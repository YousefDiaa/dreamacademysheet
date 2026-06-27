import React, { useState } from "react";
import { motion } from "motion/react";
import { updateStudentProfile } from "../utils/api";
import { Student } from "../types";
import { User, BookOpen, AlertCircle } from "lucide-react";

interface FirstLoginModalProps {
  student: Student;
  onComplete: (updatedStudent: Student) => void;
}

export default function FirstLoginModal({ student, onComplete }: FirstLoginModalProps) {
  const [name, setName] = useState(student.name || "");
  const [category, setCategory] = useState<'هندسة' | 'حاسبات' | null>(student.category || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isArabic = (text: string) => {
    const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\s]+/;
    return arabicRegex.test(text);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("الرجاء إدخال اسمك");
      return;
    }

    if (!isArabic(name)) {
      setError("الرجاء إدخال اسمك باللغة العربية");
      return;
    }

    if (!category) {
      setError("الرجاء اختيار التخصص");
      return;
    }

    setLoading(true);
    const result = await updateStudentProfile(student.email, name, category);
    setLoading(false);

    if (result.success && result.name && result.category) {
      onComplete({ ...student, name: result.name, category: result.category as any });
    } else {
      setError(result.error || "حدث خطأ أثناء حفظ البيانات");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
        dir="rtl"
      >
        <div className="p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-indigo-500/20">
              <User className="w-8 h-8 text-indigo-400" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">أهلاً بك في الكراسة!</h2>
            <p className="text-sm text-slate-400">
              يرجى استكمال بياناتك الشخصية للبدء في استخدام كراسة متابعة المناهج.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-400 leading-relaxed">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-slate-300">
                الاسم الرباعي (باللغة العربية)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full pl-3 pr-10 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors"
                  placeholder="مثال: أحمد محمد علي محمود"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-300">
                اختر تخصصك
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setCategory('هندسة')}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                    category === 'هندسة' 
                      ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300' 
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <BookOpen className="w-6 h-6 mb-2" />
                  <span className="font-semibold">هندسة</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCategory('حاسبات')}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                    category === 'حاسبات' 
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300' 
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <BookOpen className="w-6 h-6 mb-2" />
                  <span className="font-semibold">حاسبات</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] mt-6"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "حفظ ومتابعة"
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
