import { MongoClient } from "mongodb";
import { MOCK_STUDENTS } from "../src/data/mockStudents.js";

let client: MongoClient | null = null;

async function getCollection() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI not set");
  if (!client) {
    client = new MongoClient(uri, { serverSelectionTimeoutMS: 8000 });
    await client.connect();
  }
  return client.db("curriculum_tracker").collection("students");
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: "الرجاء إدخال البريد الإلكتروني وكلمة المرور" });
  }

  // Admin hardcoded login
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
        completedLessons: [],
      },
    });
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    const collection = await getCollection();
    let student = await collection.findOne({ email: normalizedEmail });

    if (!student) {
      const mockStudent = MOCK_STUDENTS.find(
        (s) => s.email.toLowerCase() === normalizedEmail
      );
      if (mockStudent) {
        await collection.insertOne({ ...mockStudent, email: normalizedEmail });
        student = { ...mockStudent, email: normalizedEmail };
      }
    }

    if (!student) {
      return res.json({ success: false, error: "البريد الإلكتروني غير مسجل بالمنصة" });
    }

    if (student.password !== password) {
      return res.json({ success: false, error: "كلمة المرور غير صحيحة" });
    }

    const { _id, ...cleanStudent } = student as any;
    return res.json({ success: true, student: cleanStudent });
  } catch (err: any) {
    // Fallback to mock data if DB fails
    const mockStudent = MOCK_STUDENTS.find(
      (s) => s.email.toLowerCase() === normalizedEmail
    );
    if (!mockStudent) {
      return res.json({ success: false, error: "البريد الإلكتروني غير مسجل بالمنصة" });
    }
    if (mockStudent.password !== password) {
      return res.json({ success: false, error: "كلمة المرور غير صحيحة" });
    }
    return res.json({ success: true, student: mockStudent });
  }
}
