import React, { useState, useEffect } from "react";
import { loginStudent } from "../utils/api";
import { Student } from "../types";
import { Mail, Lock, LogIn, AlertCircle, BookOpen, Database, ChevronDown, ChevronUp, CheckCircle2, Terminal } from "lucide-react";
import { motion } from "motion/react";

interface LoginProps {
  onLoginSuccess: (student: Student) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // دالة جلب حالة قاعدة البيانات لمعرفة ما إذا كانت MongoDB نشطة أم لا
  const [dbStatus, setDbStatus] = useState<{
    isMongoActive: boolean;
    connectionInfo: string;
    error: string;
  } | null>(null);
  const [showMongoGuide, setShowMongoGuide] = useState(false);

  useEffect(() => {
    fetch("/api/db-status")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setDbStatus({
            isMongoActive: data.isMongoActive,
            connectionInfo: data.connectionInfo,
            error: data.error || "",
          });
        }
      })
      .catch((err) => console.error("Error fetching db status:", err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("الرجاء إدخال البريد الإلكتروني وكلمة المرور");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await loginStudent(email, password);
      if (response.success && response.student) {
        onLoginSuccess(response.student);
      } else {
        setError(response.error || "فشل تسجيل الدخول");
      }
    } catch (err: any) {
      setError("حدث خطأ غير متوقع أثناء تسجيل الدخول");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8" id="login_page_container">
      <div className="my-auto sm:mx-auto sm:w-full sm:max-w-xl" id="login_content_box">
        {/* اللوجو والترحيب */}
        <div className="text-center mb-6" id="login_logo_heading">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-400 shadow-lg shadow-indigo-500/10 mb-4" id="logo_container">
            <BookOpen className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            كراسة متابعة المناهج الدراسية
          </h2>
          <p className="mt-2 text-sm text-white/60 max-w-sm mx-auto">
            بوابة الطالب الإلكترونية لمتابعة مدى تقدم المناهج، والتنبيهات، والتأخيرات بالتنسيق مع المدرسين.
          </p>
        </div>

        {/* كرت حالة قاعدة البيانات النشطة */}
        {dbStatus && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-2xl border text-xs leading-relaxed flex items-center justify-between gap-3 ${
              dbStatus.isMongoActive
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-200"
                : "bg-amber-500/10 border-amber-500/30 text-amber-200"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Database className={`w-5 h-5 ${dbStatus.isMongoActive ? "text-emerald-400" : "text-amber-400"}`} />
              <div className="text-right">
                <span className="font-bold block">
                  {dbStatus.isMongoActive ? "قاعدة بيانات MongoDB نشطة ومربوطة" : "تعمل الآن بقاعدة البيانات المحلية المؤقتة"}
                </span>
                <span className="opacity-75 block text-[11px] mt-0.5">{dbStatus.connectionInfo}</span>
              </div>
            </div>
            {!dbStatus.isMongoActive && (
              <button
                onClick={() => setShowMongoGuide(!showMongoGuide)}
                className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-100 font-bold border border-amber-500/30 text-[11px] cursor-pointer hover:bg-amber-500/30 transition-all flex items-center gap-1"
              >
                <span>دليل الإعداد</span>
                {showMongoGuide ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            )}
          </motion.div>
        )}

        {/* دليل إعداد MongoDB الكامل */}
        {showMongoGuide && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mb-6 bg-slate-900/90 border border-indigo-500/20 rounded-2xl p-5 text-right text-sm text-white/90 space-y-4 shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="font-bold text-indigo-400 flex items-center gap-1.5">
                <Database className="w-4 h-4 text-indigo-400" />
                هيكل وإعداد قاعدة بيانات MongoDB الحية
              </span>
              <button onClick={() => setShowMongoGuide(false)} className="text-xs text-white/40 hover:text-white/60">إغلاق</button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed">
              <p>لتشغيل التطبيق باستخدام قاعدة بيانات حية وسحابية بـ <strong>MongoDB</strong>، يرجى اتباع الخطوات التالية:</p>
              
              <div className="space-y-2">
                <h4 className="font-bold text-indigo-300">1. تهيئة قاعدة البيانات على MongoDB Atlas:</h4>
                <ul className="list-disc list-inside space-y-1.5 text-white/70 pr-2">
                  <li>قم بإنشاء حساب مجاني على <a href="https://www.mongodb.com/cloud/atlas" target="_blank" rel="noopener noreferrer" className="text-indigo-400 underline">MongoDB Atlas</a>.</li>
                  <li>أنشئ كود قاعدة بيانات جديدة باسم: <code className="bg-white/10 px-1 py-0.5 rounded font-mono text-white text-[11px]">curriculum_tracker</code>.</li>
                  <li>أنشئ مجموعة (Collection) بداخلها باسم: <code className="bg-white/10 px-1 py-0.5 rounded font-mono text-white text-[11px]">students</code>.</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-indigo-300">2. إضافة متغير البيئة (Secret):</h4>
                <p className="text-white/70">افتح لوحة <strong>إعدادات الأسرار (Secrets)</strong> في المنصة وأضف مفتاح البيئة التالي:</p>
                <div className="bg-black/40 p-3 rounded-lg font-mono text-left direction-ltr text-[11px] text-emerald-400 border border-white/5 space-y-1">
                  <div>KEY: <span className="text-white font-bold">MONGODB_URI</span></div>
                  <div>VALUE: <span className="text-white/60">mongodb+srv://&lt;username&gt;:&lt;password&gt;@cluster0.xxxx.mongodb.net/?retryWrites=true&w=majority</span></div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-indigo-300">3. هيكل مستند الطالب في قاعدة البيانات (Document Schema):</h4>
                <p className="text-white/70">يتكون هيكل الطالب في مجموعة <code className="bg-white/10 px-1 py-0.5 rounded font-mono text-white">students</code> من الحقول التالية:</p>
                <div className="bg-black/55 p-3 rounded-xl font-mono text-left direction-ltr text-[11px] text-indigo-300 border border-indigo-500/20 max-h-48 overflow-y-auto">
                  <pre>{JSON.stringify({
  "name": "يوسف ضياء الدين",
  "email": "di1@dream.com",
  "password": "123",
  "warningsCount": 0,
  "latesCount": 1,
  "warningsList": [],
  "latesList": ["تأخر حفل تخرج الطلاب"],
  "completedLessons": ["lesson_1_1", "lesson_2_3"]
}, null, 2)}</pre>
                </div>
              </div>

              <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-[11px] text-indigo-200">
                🚀 <strong>التشغيل التلقائي:</strong> بمجرد إدخال العنوان وتحديث الأسرار، سيقوم التطبيق بإنشاء الاتصال تلقائياً ونسخ حسابات الطلاب المبدئية مباشرة داخل مجموعتك السحابية حتى تستمتع بتجربة كاملة وفورية بدون كتابة سطر كود واحد!
              </div>
            </div>
          </motion.div>
        )}

        {/* كرت تسجيل الدخول */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 py-8 px-6 shadow-2xl rounded-3xl sm:px-10"
          id="login_card"
        >
          <form className="space-y-5" onSubmit={handleSubmit} id="login_form">
            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-rose-500/20 border border-rose-400/30 text-rose-200 text-xs p-3 rounded-xl flex flex-col gap-2.5 leading-relaxed"
                id="error_alert"
              >
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              </motion.div>
            )}

            <div>
              <label htmlFor="email" className="block text-xs font-bold text-white/80 mb-1.5 text-right">
                البريد الإلكتروني للطالب
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="yousef@school.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 pr-3 pl-10 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-indigo-400 focus:bg-white/10 text-white text-sm placeholder-white/30 font-mono text-left direction-ltr"
                />
                <Mail className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-white/40" />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-white/80 mb-1.5 text-right">
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 pr-3 pl-10 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-indigo-400 focus:bg-white/10 text-white text-sm placeholder-white/30 font-mono text-left direction-ltr"
                />
                <Lock className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-white/40" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-3 px-4 font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 cursor-pointer"
              id="btn_login_submit"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <LogIn className="w-4.5 h-4.5" />
                  <span>تسجيل الدخول لبوابة الطالب</span>
                </>
              )}
            </button>

          </form>
        </motion.div>
      </div>

      {/* ذيل الصفحة */}
      <div className="text-center text-xs text-white/40 mt-8 space-y-1" id="login_footer">
        <p>جميع المناهج والمواد الدراسية مطابقة لآخر تحديثات وزارة التربية والتعليم</p>
        <p className="text-[10px] text-white/35">made by yousef diaa el dennn</p>
      </div>
    </div>
  );
}
