import React, { useState, useEffect } from "react";
import Login from "./components/Login";
import FirstLoginModal from "./components/FirstLoginModal";
import DashboardHeader from "./components/DashboardHeader";
import SyllabusExplorer from "./components/SyllabusExplorer";
import AdminDashboard from "./components/AdminDashboard";
import { Student } from "./types";
import { CURRICULUM_DATA } from "./data/curriculum";
import { getLocalStudentsDB, toggleLessonStatus } from "./utils/api";
import { motion } from "motion/react";

const ACTIVE_STUDENT_SESSION_KEY = "curriculum_tracker_active_student_email";

export default function App() {
  const [student, setStudent] = useState<Student | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);

  // حساب إجمالي عدد الدروس في المناهج بالكامل لتغذية العدادات بدقة
  const totalLessons = CURRICULUM_DATA.reduce((acc, subj) => {
    let subjCount = 0;
    subj.units.forEach(unit => {
      if (unit.chapters) {
        unit.chapters.forEach(ch => {
          subjCount += ch.lessons.length;
        });
      }
      if (unit.lessons) {
        subjCount += unit.lessons.length;
      }
    });
    return acc + subjCount;
  }, 0);

  // تحميل الجلسة المحفوظة للطالب عند فتح المنصة لمنع تسجيل الخروج التلقائي
  useEffect(() => {
    const loadSavedSession = async () => {
      const savedEmail = localStorage.getItem(ACTIVE_STUDENT_SESSION_KEY);
      if (savedEmail) {
        // 1. تحميل سريع جداً من الكاش المحلي أولاً
        const db = getLocalStudentsDB();
        const cached = db.find(s => s.email.toLowerCase() === savedEmail.toLowerCase());
        if (cached) {
          setStudent(cached);
        }
        setLoadingSession(false);

        // 2. مزامنة البيانات وتحديثها في الخلفية من السيرفر فوراً لضمان الدقة الكاملة
        try {
          const { fetchStudentData } = await import("./utils/api");
          const response = await fetchStudentData(savedEmail);
          if (response.success && response.student) {
            setStudent(response.student);
          }
        } catch (err) {
          console.error("فشل مزامنة بيانات الطالب من السيرفر:", err);
        }
      } else {
        setLoadingSession(false);
      }
    };
    
    loadSavedSession();
  }, []);

  const handleLoginSuccess = (loggedInStudent: Student) => {
    setStudent(loggedInStudent);
    localStorage.setItem(ACTIVE_STUDENT_SESSION_KEY, loggedInStudent.email);
    
    // حفظ الطالب في نسخة مخبأة محلية لسرعة استرجاعه
    const db = getLocalStudentsDB();
    const exists = db.some(s => s.email.toLowerCase() === loggedInStudent.email.toLowerCase());
    if (!exists) {
      db.push(loggedInStudent);
    } else {
      // تحديث البيانات المخبأة
      const idx = db.findIndex(s => s.email.toLowerCase() === loggedInStudent.email.toLowerCase());
      db[idx] = loggedInStudent;
    }
    localStorage.setItem("curriculum_tracker_students_db", JSON.stringify(db));
  };

  const handleLogout = () => {
    setStudent(null);
    localStorage.removeItem(ACTIVE_STUDENT_SESSION_KEY);
  };

  const handleToggleLesson = async (lessonId: string, done: boolean) => {
    if (!student) return;

    // تحديث الحالة فوراً على واجهة المستخدم (Optimistic Update) لتجربة فائقة السرعة والاستجابة
    const originalCompletedLessons = [...student.completedLessons];
    const updatedCompletedLessons = done
      ? [...student.completedLessons, lessonId]
      : student.completedLessons.filter(id => id !== lessonId);

    const updatedStudentObj = { ...student, completedLessons: updatedCompletedLessons };
    setStudent(updatedStudentObj);

    // تحديث قاعدة البيانات المخبأة محلياً كذلك
    const db = getLocalStudentsDB();
    const updatedDb = db.map(s => {
      if (s.email.toLowerCase() === student.email.toLowerCase()) {
        return updatedStudentObj;
      }
      return s;
    });
    localStorage.setItem("curriculum_tracker_students_db", JSON.stringify(updatedDb));

    // إرسال الطلب في الخلفية لتحديث قاعدة البيانات بشكل دائم
    try {
      const response = await toggleLessonStatus(student.email, lessonId, done);
      if (response && !response.success) {
        // في حال فشل الحفظ في السيرفر، تراجع عن التحديث لإبقاء البيانات متناسقة مع السيرفر
        const rolledBackStudentObj = { ...student, completedLessons: originalCompletedLessons };
        setStudent(rolledBackStudentObj);

        // تراجع في قاعدة البيانات المحلية كذلك
        const restoredDb = getLocalStudentsDB().map(s => {
          if (s.email.toLowerCase() === student.email.toLowerCase()) {
            return rolledBackStudentObj;
          }
          return s;
        });
        localStorage.setItem("curriculum_tracker_students_db", JSON.stringify(restoredDb));

        alert(`⚠️ لم يتم حفظ التقدم في السيرفر:\n${response.error || "يرجى التحقق من اتصال قاعدة البيانات وصلاحيات الكتابة."}`);
      }
    } catch (err: any) {
      console.error("فشل التحديث الدائم في جدول البيانات/قاعدة البيانات:", err);
      // تراجع عن التغيير المتفائل
      const rolledBackStudentObj = { ...student, completedLessons: originalCompletedLessons };
      setStudent(rolledBackStudentObj);
      alert(`⚠️ خطأ في الشبكة: تعذر الاتصال بالخادم لحفظ التقدم.`);
    }
  };

  if (loadingSession) {
    return (
      <div className="min-h-screen bg-slate-950/40 flex items-center justify-center font-sans backdrop-blur-md" id="loading_screen">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-bold text-white/80">جاري تحميل البوابة التعليمية...</p>
        </div>
      </div>
    );
  }

  // إذا لم يكن هناك تسجيل دخول بعد
  if (!student) {
    return (
      <div className="min-h-screen font-sans" id="auth_container">
        <Login 
          onLoginSuccess={handleLoginSuccess} 
        />
      </div>
    );
  }

  // إذا كان المستخدم آدمن (المعلم)، اعرض لوحة تحكم المعلم
  if (student.isAdmin) {
    return <AdminDashboard onLogout={handleLogout} />;
  }

  // صفحة الطالب الشخصية (Dashboard) بعد تسجيل الدخول بنجاح
  return (
    <div className="min-h-screen font-sans py-6 px-4 md:px-8 space-y-6" id="dashboard_root">
      
      {/* عرض نافذة الترحيب إذا لم يقم الطالب بإكمال بياناته (الاسم أو التخصص) */}
      {!student.category && (
        <FirstLoginModal 
          student={student} 
          onComplete={(updatedStudent) => {
            setStudent(updatedStudent);
            const db = getLocalStudentsDB();
            const idx = db.findIndex(s => s.email.toLowerCase() === updatedStudent.email.toLowerCase());
            if (idx > -1) {
              db[idx] = updatedStudent;
              localStorage.setItem("curriculum_tracker_students_db", JSON.stringify(db));
            }
          }} 
        />
      )}

      {/* المحتوى الرئيسي للوحة الطالب */}
      <main className="max-w-7xl mx-auto space-y-8" id="dashboard_main_wrapper">
        {/* رأس اللوحة */}
        <DashboardHeader 
          student={student}
          totalLessons={totalLessons}
          completedCount={student.completedLessons.length}
          onLogout={handleLogout}
        />

        {/* مستكشف المناهج والدروس */}
        <SyllabusExplorer 
          subjects={CURRICULUM_DATA}
          completedLessons={student.completedLessons}
          onToggleLesson={handleToggleLesson}
        />
      </main>

      {/* ذيل لوحة التحكم */}
      <footer className="max-w-7xl mx-auto pt-8 border-t border-white/10 text-center text-xs text-white/40 flex flex-col md:flex-row justify-between items-center gap-3" id="dashboard_footer">
        <p>بوابة متابعة المناهج الدراسية © {new Date().getFullYear()} - جميع الحقوق محفوظة للطلاب والمدرسين</p>
        <div className="flex items-center gap-4 text-[11px] text-white/50 font-medium" id="footer_links">
          <span>البيانات مؤمنة وتخضع للتحقق التلقائي</span>
        </div>
      </footer>
    </div>
  );
}
