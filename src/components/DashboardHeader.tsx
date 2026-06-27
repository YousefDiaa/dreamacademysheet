import React, { useState } from "react";
import { Student } from "../types";
import { LogOut, AlertTriangle, Clock, CheckCircle2, Award, ChevronDown, ChevronUp, Bell, Sparkles, Database, BookOpen } from "lucide-react";
import { motion } from "motion/react";
import { checkDbStatus } from "../utils/api";

interface DashboardHeaderProps {
  student: Student;
  totalLessons: number;
  completedCount: number;
  onLogout: () => void;
}

export default function DashboardHeader({ student, totalLessons, completedCount, onLogout }: DashboardHeaderProps) {
  const [showAlerts, setShowAlerts] = useState(false);
  const [dbStatusLoading, setDbStatusLoading] = useState(false);
  
  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  const handleCheckDb = async () => {
    setDbStatusLoading(true);
    try {
      const status = await checkDbStatus();
      if (status.connected) {
        alert(`✅ ${status.message}\nعدد المستندات في المجموعة: ${status.documentsFound}`);
      } else {
        alert(`❌ فشل الاتصال بقاعدة البيانات:\n${status.error}\n\nملاحظة: إذا كنت قد حذفت ملف .env، يرجى إضافة رابط MongoDB (MONGODB_URI) في إعدادات البيئة.`);
      }
    } catch (error) {
      alert("❌ خطأ أثناء التحقق من قاعدة البيانات.");
    } finally {
      setDbStatusLoading(false);
    }
  };

  // تحديد مستوى التقييم بناء على الإنجاز والإنذارات
  const getStudentRating = () => {
    if (student.warningsCount > 2) return { text: "تحت الملاحظة الأكاديمية", color: "bg-rose-500 text-white" };
    if (progressPercent >= 75) return { text: "طالب متميز ومجتهد", color: "bg-amber-500 text-white animate-pulse" };
    if (progressPercent >= 40) return { text: "مستوى جيد ومستقر", color: "bg-emerald-500 text-white" };
    return { text: "مستجد / قيد المتابعة", color: "bg-blue-500 text-white" };
  };

  const rating = getStudentRating();

  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/15 shadow-2xl p-6 lg:p-8 space-y-6" id="dashboard_header_container">
      {/* سطر الترحيب ومعلومات الطالب */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 border-b border-white/10 pb-6" id="student_meta_row">
        <div className="flex items-center gap-4" id="student_greeting_block">
          <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white font-extrabold text-2xl shadow-lg shrink-0" id="avatar_letter">
            {student.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap" id="student_name_row">
              <h1 className="text-xl md:text-2xl font-black text-white">{student.name}</h1>
              {student.category && (
                <span className="text-xs font-bold px-2.5 py-1 rounded-full shadow-md bg-indigo-500/20 text-indigo-200 border border-indigo-500/30 flex items-center gap-1" id="student_category_badge">
                  <BookOpen className="w-3.5 h-3.5" />
                  {student.category}
                </span>
              )}
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full shadow-md ${rating.color}`} id="student_badge">
                {rating.text}
              </span>
            </div>
            <p className="text-xs text-white/60 font-mono mt-1">{student.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-center" id="header_actions">

          <button
            onClick={() => setShowAlerts(!showAlerts)}
            className="relative p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all border border-white/15 cursor-pointer"
            title="التنبيهات والمخالفات"
            id="btn_toggle_alerts"
          >
            <Bell className="w-5 h-5" />
            {(student.warningsCount > 0 || student.latesCount > 0) && (
              <span className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow-md shadow-rose-900/30 animate-bounce" id="unread_alerts_badge">
                {student.warningsCount + student.latesCount}
              </span>
            )}
          </button>
          
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 border border-rose-500/30 text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 rounded-xl transition-all font-bold text-sm cursor-pointer"
            id="btn_logout"
          >
            <LogOut className="w-4 h-4" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </div>

      {/* بطاقات الإحصائيات الفورية والتقدم */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4" id="stats_grid">
        {/* بطاقة نسبة الإنجاز الكلية */}
        <div className="md:col-span-2 bg-gradient-to-br from-indigo-950/50 to-slate-950/50 backdrop-blur-md border border-white/10 text-white rounded-2xl p-6 relative overflow-hidden shadow-xl" id="overall_progress_card">
          <div className="absolute right-0 bottom-0 translate-x-1/4 translate-y-1/4 opacity-5 pointer-events-none" id="progress_card_bg_pattern">
            <Award className="w-48 h-48" />
          </div>
          
          <div className="relative space-y-4" id="progress_stats_wrapper">
            <div className="flex justify-between items-center" id="progress_stat_label">
              <span className="text-sm font-bold text-white/80">نسبة التقدم الكلية في المناهج</span>
              <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold px-2.5 py-0.5 rounded-full">
                {completedCount} من {totalLessons} درس
              </span>
            </div>
            
            <div className="flex items-baseline gap-2" id="percentage_display">
              <span className="text-4xl font-extrabold tracking-tight text-emerald-400">{progressPercent}%</span>
              <span className="text-xs text-white/50">إجمالي الدروس المكتملة</span>
            </div>

            {/* شريط تقدم مخصص */}
            <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden" id="progressbar_track">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full bg-gradient-to-l from-emerald-400 to-teal-500 rounded-full shadow-lg shadow-emerald-500/20"
                id="progressbar_fill"
              />
            </div>
          </div>
        </div>

        {/* كرت التنبيهات والإنذارات */}
        <button
          onClick={() => setShowAlerts(!showAlerts)}
          className={`text-right p-6 rounded-2xl border backdrop-blur-md transition-all cursor-pointer relative overflow-hidden shadow-xl ${
            student.warningsCount > 0 
              ? 'border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-200' 
              : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10'
          }`}
          id="warnings_stat_card"
        >
          <div className="flex justify-between items-start" id="warnings_header">
            <span className="text-sm font-bold text-white/60">عدد التنبيهات</span>
            <AlertTriangle className={`w-6 h-6 ${student.warningsCount > 0 ? 'text-rose-400' : 'text-white/40'}`} />
          </div>
          <div className="mt-4" id="warnings_value">
            <span className={`text-4xl font-extrabold ${student.warningsCount > 0 ? 'text-rose-400' : 'text-white'}`}>
              {student.warningsCount}
            </span>
            <p className="text-[11px] text-white/40 mt-1">تنبيهات سلوكية أو أكاديمية</p>
          </div>
        </button>

        {/* كرت التأخيرات */}
        <button
          onClick={() => setShowAlerts(!showAlerts)}
          className={`text-right p-6 rounded-2xl border backdrop-blur-md transition-all cursor-pointer relative overflow-hidden shadow-xl ${
            student.latesCount > 0 
              ? 'border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-200' 
              : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10'
          }`}
          id="lates_stat_card"
        >
          <div className="flex justify-between items-start" id="lates_header">
            <span className="text-sm font-bold text-white/60">مرات التأخير</span>
            <Clock className={`w-6 h-6 ${student.latesCount > 0 ? 'text-amber-400 animate-pulse' : 'text-white/40'}`} />
          </div>
          <div className="mt-4" id="lates_value">
            <span className={`text-4xl font-extrabold ${student.latesCount > 0 ? 'text-amber-400' : 'text-white'}`}>
              {student.latesCount}
            </span>
            <p className="text-[11px] text-white/40 mt-1">تأخيرات عن الحصص أو الطابور</p>
          </div>
        </button>
      </div>

      {/* لوحة التفاصيل الموسعة للتنبيهات والتأخيرات */}
      {showAlerts && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-white/5 backdrop-blur-xl rounded-2xl p-5 border border-white/10 space-y-4 overflow-hidden"
          id="expanded_alerts_panel"
        >
          <div className="flex justify-between items-center border-b border-white/10 pb-2" id="expanded_alerts_title">
            <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
              تفاصيل السجل الانضباطي للطالب
            </h3>
            <button 
              onClick={() => setShowAlerts(false)}
              className="text-xs font-bold text-white/60 hover:text-white cursor-pointer"
            >
              إغلاق
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="expanded_alerts_columns">
            {/* التنبيهات بالتفصيل */}
            <div className="space-y-2.5" id="warnings_details_column">
              <h4 className="text-xs font-bold text-rose-300 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                قائمة الإنذارات والتنبيهات ({student.warningsCount}):
              </h4>
              {student.warningsList.length > 0 ? (
                <ul className="space-y-1.5" id="warnings_details_list">
                  {student.warningsList.map((warn, idx) => (
                    <li key={idx} className="text-xs bg-rose-500/10 border border-rose-500/20 text-rose-200 rounded-xl p-2.5 leading-relaxed">
                      • {warn}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-white/40 bg-white/5 border border-white/5 rounded-xl p-3 text-center">
                  لا توجد تنبيهات مسجلة بحقك. استمر في أدائك الممتاز!
                </p>
              )}
            </div>

            {/* التأخيرات بالتفصيل */}
            <div className="space-y-2.5" id="lates_details_column">
              <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1">
                <Clock className="w-4 h-4 text-amber-400" />
                قائمة مرات التأخير المرصودة ({student.latesCount}):
              </h4>
              {student.latesList.length > 0 ? (
                <ul className="space-y-1.5" id="lates_details_list">
                  {student.latesList.map((late, idx) => (
                    <li key={idx} className="text-xs bg-amber-500/10 border border-amber-500/20 text-amber-200 rounded-xl p-2.5 leading-relaxed">
                      • {late}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-white/40 bg-white/5 border border-white/5 rounded-xl p-3 text-center">
                  سجل حضورك مثالي وخالٍ من التأخيرات!
                </p>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
