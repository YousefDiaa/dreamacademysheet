import "dotenv/config";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { MongoClient, Db, Collection } from "mongodb";
import { MOCK_STUDENTS } from "./src/data/mockStudents";
import { Student } from "./src/types";

// --- MongoDB Configuration with Lazy Initialization ---
let mongoClient: MongoClient | null = null;
let mongoDb: Db | null = null;
let studentsCollection: Collection<any> | null = null;
let isMongoActive = false;
let mongoConnectionError = "";

async function connectToMongoDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log("⚠️  [MongoDB] MONGODB_URI is not set.");
    mongoConnectionError = "العنوان MONGODB_URI غير محدد في أسرار البيئة (Environment Secrets). الرجاء إضافته للاتصال بـ MongoDB.";
    return false;
  }

  if (uri.includes("<db_password>")) {
    console.log("⚠️  [MongoDB] Placeholder <db_password> detected in MONGODB_URI.");
    mongoConnectionError = "تنبيه ⚠️: الرابط يحتوي على '<db_password>'! الرجاء استبدالها بكلمة مرور مستخدم قاعدة البيانات الحقيقية التي أنشأتها في لوحة تحكم MongoDB Atlas.";
    return false;
  }
  
  try {
    console.log("🔌 [MongoDB] Connecting to database...");
    mongoClient = new MongoClient(uri, {
      connectTimeoutMS: 5000,
      serverSelectionTimeoutMS: 5000,
    });
    await mongoClient.connect();
    // Default to the database specified in the URI, or fallback to 'curriculum_tracker'
    const dbName = mongoClient.options.dbName || "curriculum_tracker";
    mongoDb = mongoClient.db(dbName);
    studentsCollection = mongoDb.collection("students");
    
    // CRITICAL: Verify connection and authentication by executing a ping command.
    // This will force the client to authenticate immediately and throw if credentials are bad.
    await mongoDb.command({ ping: 1 });
    
    // Sync all students with upsert: updates name, password, warnings, lates, while preserving completed lessons
    try {
      console.log("🌱 [MongoDB] Synchronizing student accounts with database...");
      for (const s of MOCK_STUDENTS) {
        const emailLower = s.email.trim().toLowerCase();
        await studentsCollection.updateOne(
          { email: emailLower },
          { 
            $set: { 
              password: s.password,
              name: s.name || "",
              warningsCount: s.warningsCount || 0,
              latesCount: s.latesCount || 0,
              warningsList: s.warningsList || [],
              latesList: s.latesList || []
            },
            $setOnInsert: {
              email: emailLower,
              completedLessons: s.completedLessons || [],
              category: s.category || undefined
            }
          },
          { upsert: true }
        );
      }
      console.log(`🌱 [MongoDB] Successfully synced ${MOCK_STUDENTS.length} students with MongoDB!`);
    } catch (syncError: any) {
      console.log("[MongoDB Info] Note: Synchronizing records skipped (read-only database user or restricted permissions):", syncError.message || syncError);
    }
    
    isMongoActive = true;
    mongoConnectionError = "";
    console.log("✅ [MongoDB] Connected and authenticated successfully!");
    return true;
  } catch (error: any) {
    console.log("[MongoDB Info] Database connection fallback active. Details:", error.message || error);
    mongoConnectionError = `فشل الاتصال بـ MongoDB: ${error.message || error}.\n💡 نصائح للحل:\n1. تأكد من تفعيل خيار (Allow access from anywhere - IP 0.0.0.0/0) في لوحة تحكم MongoDB Atlas تحت قسم Network Access.\n2. تأكد من استبدال <db_password> بكلمة المرور الصحيحة لمستخدم قاعدة البيانات.\n3. تأكد من صحة اسم مستخدم قاعدة البيانات ورابط الاتصال.`;
    isMongoActive = false;
    return false;
  }
}

async function ensureMongoConnected(): Promise<boolean> {
  if (isMongoActive && studentsCollection) {
    return true;
  }
  return await connectToMongoDB();
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize and connect to MongoDB directly
  await connectToMongoDB();

  // Middleware to parse JSON bodies
  app.use(express.json());

  // Real Server-Side Student Login
  app.post("/api/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ success: false, error: "الرجاء إدخال البريد الإلكتروني وكلمة المرور" });
      }

      // Hardcoded Admin Login
      if (email === "admin@school.com" && password === "admin123") {
        return res.json({ 
          success: true, 
          student: { 
            name: "لوحة تحكم المعلم", 
            email: "admin@school.com", 
            isAdmin: true,
            warningsCount: 0,
            latesCount: 0,
            warningsList: [],
            latesList: [],
            completedLessons: []
          } 
        });
      }

      await ensureMongoConnected();
      const normalizedEmail = email.trim().toLowerCase();
      let student: Student | null = null;

      if (isMongoActive && studentsCollection) {
        try {
          student = await studentsCollection.findOne({ email: normalizedEmail });
          if (!student) {
            // If student is not in the database yet, try to find in mock data and insert them!
            const mockStudent = MOCK_STUDENTS.find(s => s.email.toLowerCase() === normalizedEmail);
            if (mockStudent) {
              const studentToInsert = {
                ...mockStudent,
                email: normalizedEmail,
                completedLessons: mockStudent.completedLessons || []
              };
              await studentsCollection.insertOne(studentToInsert);
              student = studentToInsert;
              console.log(`🌱 [MongoDB] Automatically inserted mock student ${normalizedEmail} on login`);
            }
          }
        } catch (dbError: any) {
          console.log("[MongoDB Info] Fallback to mock student record. Details:", dbError.message || dbError);
          student = MOCK_STUDENTS.find(s => s.email.toLowerCase() === normalizedEmail) || null;
        }
      } else {
        student = MOCK_STUDENTS.find(s => s.email.toLowerCase() === normalizedEmail) || null;
      }

      if (!student) {
        return res.json({ success: false, error: "البريد الإلكتروني غير مسجل بالمنصة" });
      }

      if (student.password !== password) {
        return res.json({ success: false, error: "كلمة المرور غير صحيحة" });
      }

      // Omit mongo internal _id property before returning
      if (student && (student as any)._id) {
        const { _id, ...cleanStudent } = student as any;
        student = cleanStudent;
      }

      res.json({ success: true, student });
    } catch (error: any) {
      console.error("[Backend Login] Error:", error);
      res.status(500).json({ success: false, error: "خطأ داخلي في الخادم أثناء تسجيل الدخول" });
    }
  });

  // Real Server-Side Lesson Status Update
  app.post("/api/toggle-lesson", async (req, res) => {
    try {
      const { email, lessonId, done } = req.body;
      if (!email || !lessonId) {
        return res.status(400).json({ success: false, error: "البيانات المدخلة غير مكتملة" });
      }

      await ensureMongoConnected();
      const normalizedEmail = email.trim().toLowerCase();
      let student: Student | null = null;

      if (isMongoActive && studentsCollection) {
        try {
          student = await studentsCollection.findOne({ email: normalizedEmail });
          if (!student) {
            // Auto-create in database if student is in MOCK_STUDENTS but not in DB yet
            const mockStudent = MOCK_STUDENTS.find(s => s.email.toLowerCase() === normalizedEmail);
            if (mockStudent) {
              const studentToInsert = {
                ...mockStudent,
                email: normalizedEmail,
                completedLessons: mockStudent.completedLessons || []
              };
              await studentsCollection.insertOne(studentToInsert);
              student = studentToInsert;
              console.log(`🌱 [MongoDB] Automatically inserted mock student ${normalizedEmail} on progress update`);
            }
          }
        } catch (dbError: any) {
          console.log("[MongoDB Info] Fallback to mock student record. Details:", dbError.message || dbError);
          student = MOCK_STUDENTS.find(s => s.email.toLowerCase() === normalizedEmail) || null;
        }
      } else {
        student = MOCK_STUDENTS.find(s => s.email.toLowerCase() === normalizedEmail) || null;
      }

      if (!student) {
        return res.status(404).json({ success: false, error: "الطالب غير موجود" });
      }

      let completed = [...(student.completedLessons || [])];

      if (done) {
        if (!completed.includes(lessonId)) {
          completed.push(lessonId);
        }
      } else {
        completed = completed.filter(id => id !== lessonId);
      }

      if (isMongoActive && studentsCollection) {
        try {
          await studentsCollection.updateOne(
            { email: normalizedEmail },
            { 
              $set: { completedLessons: completed },
              $setOnInsert: {
                email: normalizedEmail,
                password: student.password,
                name: student.name || "",
                warningsCount: student.warningsCount || 0,
                latesCount: student.latesCount || 0,
                warningsList: student.warningsList || [],
                latesList: student.latesList || []
              }
            },
            { upsert: true }
          );
        } catch (dbWriteError: any) {
          console.error("❌ [MongoDB] Error writing progress to database:", dbWriteError.message || dbWriteError);
          return res.status(500).json({ 
            success: false, 
            error: `فشل حفظ التقدم في قاعدة البيانات: ${dbWriteError.message || "خطأ في تصاريح قاعدة البيانات"}` 
          });
        }
      } else {
        student.completedLessons = completed;
      }

      console.log(`[Backend DB] Saved progress for ${normalizedEmail}: Lesson ${lessonId} -> ${done ? "Completed" : "Incomplete"}`);
      res.json({ success: true, completedLessons: completed });
    } catch (error: any) {
      console.error("[Backend Toggle] Error:", error);
      res.status(500).json({ success: false, error: "خطأ داخلي في الخادم أثناء حفظ التقدم" });
    }
  });

  // Update Profile
  app.post("/api/update-profile", async (req, res) => {
    try {
      const { email, name, category } = req.body;
      if (!email || !name || !category) {
        return res.status(400).json({ success: false, error: "البيانات المدخلة غير مكتملة" });
      }

      await ensureMongoConnected();
      const normalizedEmail = email.trim().toLowerCase();
      
      if (isMongoActive && studentsCollection) {
        try {
          const result = await studentsCollection.updateOne(
            { email: normalizedEmail },
            { 
              $set: { 
                name: name.trim(),
                category: category
              }
            }
          );
          
          if (result.matchedCount === 0) {
            return res.status(404).json({ success: false, error: "الطالب غير موجود" });
          }
        } catch (dbWriteError: any) {
          console.error("❌ [MongoDB] Error writing profile to database:", dbWriteError.message || dbWriteError);
          return res.status(500).json({ success: false, error: "فشل تحديث البيانات" });
        }
      } else {
        // Fallback for mock data (temporary in memory)
        const student = MOCK_STUDENTS.find(s => s.email.toLowerCase() === normalizedEmail);
        if (student) {
          student.name = name.trim();
          (student as any).category = category;
        } else {
          return res.status(404).json({ success: false, error: "الطالب غير موجود في البيانات المؤقتة" });
        }
      }

      res.json({ success: true, name: name.trim(), category });
    } catch (error: any) {
      console.error("[Backend Update Profile] Error:", error);
      res.status(500).json({ success: false, error: "خطأ داخلي في الخادم" });
    }
  });

  // Fetch all students (Admin Only)
  app.get("/api/all-students", async (req, res) => {
    try {
      await ensureMongoConnected();
      
      let allStudents: any[] = [];
      if (isMongoActive && studentsCollection) {
        allStudents = await studentsCollection.find({}).toArray();
      } else {
        allStudents = [...MOCK_STUDENTS];
      }

      // Sanitize: Remove passwords and _ids
      const sanitized = allStudents.map(s => {
        const { password, _id, ...clean } = s;
        return clean;
      });

      res.json({ success: true, students: sanitized });
    } catch (error: any) {
      console.error("[Backend All Students] Error:", error);
      res.status(500).json({ success: false, error: "فشل جلب بيانات الطلاب" });
    }
  });

  // Update Disciplinary Records (Admin Only)
  app.post("/api/update-records", async (req, res) => {
    try {
      const { email, warningsCount, latesCount, warningsList, latesList } = req.body;
      if (!email) {
        return res.status(400).json({ success: false, error: "البريد الإلكتروني مطلوب" });
      }

      await ensureMongoConnected();
      const normalizedEmail = email.trim().toLowerCase();
      
      if (isMongoActive && studentsCollection) {
        const result = await studentsCollection.updateOne(
          { email: normalizedEmail },
          { 
            $set: { 
              warningsCount,
              latesCount,
              warningsList,
              latesList
            }
          }
        );
        if (result.matchedCount === 0) {
          return res.status(404).json({ success: false, error: "الطالب غير موجود" });
        }
      } else {
        const student = MOCK_STUDENTS.find(s => s.email.toLowerCase() === normalizedEmail);
        if (student) {
          student.warningsCount = warningsCount;
          student.latesCount = latesCount;
          student.warningsList = warningsList;
          student.latesList = latesList;
        } else {
          return res.status(404).json({ success: false, error: "الطالب غير موجود" });
        }
      }

      res.json({ success: true });
    } catch (error: any) {
      console.error("[Backend Update Records] Error:", error);
      res.status(500).json({ success: false, error: "خطأ داخلي في الخادم" });
    }
  });

  // Fetch student data on-demand (to ensure warnings/lates/completed is synced)
  app.get("/api/student-data", async (req, res) => {
    try {
      const { email } = req.query;
      if (!email) {
        return res.status(400).json({ success: false, error: "البريد الإلكتروني مطلوب" });
      }

      await ensureMongoConnected();
      const normalizedEmail = (email as string).trim().toLowerCase();
      let student: Student | null = null;

      if (isMongoActive && studentsCollection) {
        try {
          student = await studentsCollection.findOne({ email: normalizedEmail });
          if (!student) {
            // Auto-create in database if student is in MOCK_STUDENTS but not in DB yet
            const mockStudent = MOCK_STUDENTS.find(s => s.email.toLowerCase() === normalizedEmail);
            if (mockStudent) {
              const studentToInsert = {
                ...mockStudent,
                email: normalizedEmail,
                completedLessons: mockStudent.completedLessons || []
              };
              await studentsCollection.insertOne(studentToInsert);
              student = studentToInsert;
              console.log(`🌱 [MongoDB] Automatically inserted mock student ${normalizedEmail} on student-data fetch`);
            }
          }
        } catch (dbError: any) {
          console.log("[MongoDB Info] Fallback to mock student record. Details:", dbError.message || dbError);
          student = MOCK_STUDENTS.find(s => s.email.toLowerCase() === normalizedEmail) || null;
        }
      } else {
        student = MOCK_STUDENTS.find(s => s.email.toLowerCase() === normalizedEmail) || null;
      }

      if (!student) {
        return res.status(404).json({ success: false, error: "الطالب غير موجود" });
      }

      // Omit mongo internal _id property before returning
      if (student && (student as any)._id) {
        const { _id, ...cleanStudent } = student as any;
        student = cleanStudent;
      }

      res.json({ success: true, student });
    } catch (error: any) {
      console.error("[Backend GetStudent] Error:", error);
      res.status(500).json({ success: false, error: "خطأ داخلي في الخادم" });
    }
  });


  // API Proxy for Student Login (kept for backwards compatibility if needed)
  app.get("/api/proxy-login", async (req, res) => {
    try {
      const { webAppUrl, email, password } = req.query;
      if (!webAppUrl || !email || !password) {
        return res.status(400).json({ success: false, error: "Missing required parameters" });
      }

      const url = `${webAppUrl}?action=login&email=${encodeURIComponent(email as string)}&password=${encodeURIComponent(password as string)}`;
      
      console.log(`[Proxy Login] Forwarding request for: ${email}`);
      const response = await fetch(url);

      const text = await response.text();

      if (!response.ok) {
        throw new Error(`Google Apps Script returned HTTP status ${response.status}. Response: ${text.substring(0, 200)}`);
      }

      // Check if the response is HTML (Google's login page or permission prompt)
      if (text.trim().startsWith("<") || text.includes("<!doctype") || text.includes("<html")) {
        return res.status(200).json({
          success: false,
          error: "تلقى التطبيق استجابة HTML من Google. يرجى التأكد من نشر الـ Web App في Google Apps Script مع تعيين صلاحية الوصول لـ 'Anyone' (أي شخص)، وتخويل صلاحيات التشغيل للحساب الخاص بك."
        });
      }

      try {
        const data = JSON.parse(text);
        res.json(data);
      } catch (parseError) {
        console.error("[Proxy Login] JSON parse error:", parseError, "Response text was:", text.substring(0, 200));
        res.json({
          success: false,
          error: "تنسيق استجابة غير صالح من Google Apps Script. تأكد من أن السكربت يرجع كائن JSON صالح."
        });
      }
    } catch (error: any) {
      console.error("[Proxy Login] Error details:", error);
      res.status(200).json({ 
        success: false, 
        error: `خطأ في الاتصال بالسيرفر الوسيط: ${error.message || error}` 
      });
    }
  });

  // API Proxy for Lesson Toggle (kept for backwards compatibility if needed)
  app.post("/api/proxy-toggle", async (req, res) => {
    try {
      const { webAppUrl, email, lessonId, done } = req.body;
      if (!webAppUrl || !email || !lessonId) {
        return res.status(400).json({ success: false, error: "Missing required parameters" });
      }

      console.log(`[Proxy Toggle] Forwarding request for email: ${email}, lesson: ${lessonId}, done: ${done}`);
      const response = await fetch(webAppUrl as string, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "toggleLesson",
          email,
          lessonId,
          done,
        }),
      });

      const text = await response.text();
      
      if (!response.ok) {
        throw new Error(`Google Apps Script returned HTTP status ${response.status}. Response: ${text.substring(0, 200)}`);
      }

      // Check if response is HTML
      if (text.trim().startsWith("<") || text.includes("<!doctype") || text.includes("<html")) {
        return res.status(200).json({
          success: false,
          error: "تلقى التطبيق استجابة HTML من Google أثناء تحديث الحالة. يرجى التأكد من صلاحية الوصول لـ 'Anyone'."
        });
      }

      try {
        const json = JSON.parse(text);
        res.json(json);
      } catch {
        res.json({ success: true, message: text });
      }
    } catch (error: any) {
      console.error("[Proxy Toggle] Error:", error);
      res.status(200).json({ 
        success: false, 
        error: `خطأ في الاتصال بالسيرفر الوسيط: ${error.message || error}` 
      });
    }
  });

  // Database status endpoint
  app.get("/api/db-status", async (req, res) => {
    try {
      await ensureMongoConnected();
      
      if (!isMongoActive || !mongoClient || !studentsCollection) {
        return res.json({ 
          connected: false, 
          error: mongoConnectionError || "قاعدة البيانات غير متصلة (تأكد من صحة MONGODB_URI واتصال الشبكة)" 
        });
      }

      // Test a quick command to ensure connection and permissions are working
      const pingResult = await mongoClient.db(mongoClient.options.dbName || "curriculum_tracker").command({ ping: 1 });
      
      if (pingResult && pingResult.ok) {
        // Test basic read permission
        const docCount = await studentsCollection.countDocuments({});
        return res.json({ 
          connected: true, 
          message: "تم الاتصال بقاعدة البيانات بنجاح", 
          documentsFound: docCount 
        });
      } else {
        return res.json({ connected: false, error: "فشل اختبار الاتصال السريع (Ping failed)" });
      }
    } catch (error: any) {
      console.error("[DB Status] Error:", error);
      return res.json({ connected: false, error: error.message || "حدث خطأ أثناء اختبار الاتصال" });
    }
  });

  // Mount Vite middleware for development (or serve static files in production)
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
