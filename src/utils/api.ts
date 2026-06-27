import { Student, AppsScriptConfig } from "../types";
import { MOCK_STUDENTS } from "../data/mockStudents";

// تهيئة قاعدة البيانات المحلية في LocalStorage كـ Cache احتياطي للتجربة الفورية والموثوقية
const LOCAL_DB_KEY = "curriculum_tracker_students_db";
const CONFIG_KEY = "curriculum_tracker_apps_script_config";

export function getLocalStudentsDB(): Student[] {
  const data = localStorage.getItem(LOCAL_DB_KEY);
  if (!data) {
    localStorage.setItem(LOCAL_DB_KEY, JSON.stringify(MOCK_STUDENTS));
    return MOCK_STUDENTS;
  }
  
  try {
    const parsed = JSON.parse(data) as Student[];
    const hasCSVStudent = parsed.some(s => s.email.toLowerCase() === "di1@dream.com");
    if (!hasCSVStudent) {
      localStorage.setItem(LOCAL_DB_KEY, JSON.stringify(MOCK_STUDENTS));
      return MOCK_STUDENTS;
    }
    return parsed;
  } catch (e) {
    localStorage.setItem(LOCAL_DB_KEY, JSON.stringify(MOCK_STUDENTS));
    return MOCK_STUDENTS;
  }
}

export function saveLocalStudentsDB(db: Student[]): void {
  localStorage.setItem(LOCAL_DB_KEY, JSON.stringify(db));
}

export function getAppsScriptConfig(): AppsScriptConfig {
  const data = localStorage.getItem(CONFIG_KEY);
  const targetUrl = "https://script.google.com/macros/s/AKfycbzWfajHG97oyedNXgiyvyliQsgPJ3iBZZrJGjVaaGYn2zppUv4zImDUpPx6i36jNb5R/exec";
  
  if (!data) {
    const defaultConfig = { webAppUrl: targetUrl, isConfigured: true };
    localStorage.setItem(CONFIG_KEY, JSON.stringify(defaultConfig));
    return defaultConfig;
  }
  
  const parsed = JSON.parse(data);
  if (!parsed.webAppUrl || parsed.webAppUrl !== targetUrl || !parsed.isConfigured) {
    const updatedConfig = { webAppUrl: targetUrl, isConfigured: true };
    localStorage.setItem(CONFIG_KEY, JSON.stringify(updatedConfig));
    return updatedConfig;
  }
  
  return parsed;
}

export function saveAppsScriptConfig(config: AppsScriptConfig): void {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
}

/**
 * دالة تسجيل الدخول - تتصل بالخادم وتجلب البيانات الحقيقية من الخادم مباشرة
 */
export async function loginStudent(email: string, password: string): Promise<{ success: boolean; student?: Student; error?: string }> {
  try {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error("فشل الاتصال بالخادم");
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error("[API Login Error] Falling back to local cache:", error);
    // تراجع آمن لقاعدة البيانات المحلية في حال وجود مشكلة بالشبكة
    const normalizedEmail = email.trim().toLowerCase();
    const db = getLocalStudentsDB();
    const foundStudent = db.find(s => s.email.toLowerCase() === normalizedEmail);
    
    if (foundStudent) {
      if (foundStudent.password === password) {
        return { success: true, student: foundStudent };
      } else {
        return { success: false, error: "كلمة المرور غير صحيحة" };
      }
    } else {
      return { success: false, error: "البريد الإلكتروني غير مسجل بالمنصة" };
    }
  }
}

/**
 * دالة حفظ حالة تقدم درس معين - تحفظ على الخادم مباشرة ثم تقوم بتحديث الـ Local Cache
 */
export async function toggleLessonStatus(email: string, lessonId: string, done: boolean): Promise<{ success: boolean; error?: string }> {
  // 1. التحديث المحلي السريع فوراً لـ Local Cache
  const db = getLocalStudentsDB();
  const updatedDb = db.map(student => {
    if (student.email.toLowerCase() === email.toLowerCase()) {
      let completed = [...(student.completedLessons || [])];
      if (done) {
        if (!completed.includes(lessonId)) {
          completed.push(lessonId);
        }
      } else {
        completed = completed.filter(id => id !== lessonId);
      }
      return { ...student, completedLessons: completed };
    }
    return student;
  });
  saveLocalStudentsDB(updatedDb);

  // 2. مزامنة التحديث مع الخادم بشكل دائم
  try {
    const response = await fetch("/api/toggle-lesson", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, lessonId, done }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return { success: false, error: data.error || "فشل المزامنة مع الخادم" };
    }

    return data;
  } catch (error: any) {
    console.error("[API Toggle Error]:", error);
    // نرجع الفشل لإظهار الخطأ للمستخدم
    return { success: false, error: "تعذر الوصول للخادم. تأكد من اتصالك بالإنترنت." };
  }
}

/**
 * دالة جلب بيانات طالب محدثة من الخادم
 */
export async function fetchStudentData(email: string): Promise<{ success: boolean; student?: Student; error?: string }> {
  try {
    const response = await fetch(`/api/student-data?email=${encodeURIComponent(email)}`);
    if (!response.ok) {
      throw new Error("فشل الاتصال بالخادم");
    }
    const data = await response.json();
    if (data.success && data.student) {
      // تحديث الـ Cache المحلي
      const db = getLocalStudentsDB();
      const updatedDb = db.map(s => {
        if (s.email.toLowerCase() === email.toLowerCase()) {
          return data.student;
        }
        return s;
      });
      saveLocalStudentsDB(updatedDb);
    }
    return data;
  } catch (error) {
    console.error("[API fetchStudentData Error]:", error);
    const db = getLocalStudentsDB();
    const cached = db.find(s => s.email.toLowerCase() === email.toLowerCase());
    if (cached) {
      return { success: true, student: cached };
    }
    return { success: false, error: "فشل تحديث البيانات من الخادم" };
  }
}

/**
 * دالة فحص حالة اتصال قاعدة البيانات
 */
export async function checkDbStatus(): Promise<{ connected: boolean; message?: string; documentsFound?: number; error?: string }> {
  try {
    const response = await fetch("/api/db-status");
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.json();
  } catch (error: any) {
    console.error("[API checkDbStatus Error]:", error);
    return { connected: false, error: "فشل الاتصال بالخادم الداخلي للتحقق من قاعدة البيانات" };
  }
}

/**
 * دالة تحديث الملف الشخصي للطالب (الاسم والتخصص)
 */
export async function updateStudentProfile(email: string, name: string, category: string): Promise<{ success: boolean; name?: string; category?: string; error?: string }> {
  try {
    const response = await fetch("/api/update-profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, name, category }),
    });

    const data = await response.json();
    
    if (data.success) {
      // تحديث الـ Cache المحلي
      const db = getLocalStudentsDB();
      const updatedDb = db.map(s => {
        if (s.email.toLowerCase() === email.toLowerCase()) {
          return { ...s, name: data.name, category: data.category as any };
        }
        return s;
      });
      saveLocalStudentsDB(updatedDb);
    }
    
    return data;
  } catch (error: any) {
    console.error("[API Update Profile Error]:", error);
    return { success: false, error: "تعذر الوصول للخادم لحفظ البيانات." };
  }
}

/**
 * دالة جلب جميع الطلاب (خاصة بالمعلم)
 */
export async function fetchAllStudents(): Promise<{ success: boolean; students?: Student[]; error?: string }> {
  try {
    const response = await fetch("/api/all-students");
    return await response.json();
  } catch (error: any) {
    console.error("[API fetchAllStudents Error]:", error);
    return { success: false, error: "فشل جلب بيانات الطلاب" };
  }
}

/**
 * دالة تحديث سجلات الطالب (التنبيهات والتأخيرات - خاصة بالمعلم)
 */
export async function updateStudentRecords(
  email: string,
  warningsCount: number,
  latesCount: number,
  warningsList: string[],
  latesList: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch("/api/update-records", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, warningsCount, latesCount, warningsList, latesList }),
    });
    return await response.json();
  } catch (error: any) {
    console.error("[API updateStudentRecords Error]:", error);
    return { success: false, error: "تعذر الاتصال بالخادم لحفظ السجلات" };
  }
}
