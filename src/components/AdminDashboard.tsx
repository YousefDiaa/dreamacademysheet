import React, { useState, useEffect, useMemo } from "react";
import { Student } from "../types";
import { fetchAllStudents, updateStudentRecords } from "../utils/api";
import { CURRICULUM_DATA } from "../data/curriculum";
import { 
  Users, AlertTriangle, Clock, Search, LogOut, CheckCircle2, 
  XCircle, Filter, Activity, Plus, ShieldAlert, Award
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AdminDashboardProps {
  onLogout: () => void;
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Highlighting Filters
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [selectedUnitId, setSelectedUnitId] = useState<string>("");
  const [selectedChapterId, setSelectedChapterId] = useState<string>("");
  const [selectedLessonId, setSelectedLessonId] = useState<string>("");

  // Modal State for Disciplinary Action
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [actionType, setActionType] = useState<'warning' | 'late' | null>(null);
  const [actionReason, setActionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Table status filter
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'incomplete'>('all');

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    setLoading(true);
    const data = await fetchAllStudents();
    if (data.success && data.students) {
      setStudents(data.students);
    }
    setLoading(false);
  };

  // Derived state for dropdowns
  const activeSubject = CURRICULUM_DATA.find(s => s.id === selectedSubjectId);
  const activeUnit = activeSubject?.units.find(u => u.id === selectedUnitId);
  const activeChapter = activeUnit?.chapters.find(c => c.id === selectedChapterId);
  
  // Reset child dropdowns when parent changes
  useEffect(() => {
    setSelectedUnitId("");
    setSelectedChapterId("");
    setSelectedLessonId("");
  }, [selectedSubjectId]);

  useEffect(() => {
    setSelectedChapterId("");
    setSelectedLessonId("");
  }, [selectedUnitId]);

  useEffect(() => {
    setSelectedLessonId("");
  }, [selectedChapterId]);

  // Derived stats
  const totalStudents = students.length;
  const totalWarnings = students.reduce((acc, s) => acc + (s.warningsCount || 0), 0);
  const totalLates = students.reduce((acc, s) => acc + (s.latesCount || 0), 0);
  const totalCompleted = students.reduce((acc, s) => acc + (s.completedLessons?.length || 0), 0);

  // Helper to check if a student completed the current target (subject, unit, or lesson)
  const getTargetProgress = (student: Student) => {
    if (!student.completedLessons) return { type: 'none', value: 0, total: 0, percent: 0, isDone: false };
    
    if (selectedLessonId) {
      const isDone = student.completedLessons.includes(selectedLessonId);
      return { type: 'lesson', isDone };
    }
    
    if (selectedChapterId && activeChapter) {
      const chapterLessons = activeChapter.lessons.map(l => l.id);
      if (chapterLessons.length === 0) return { type: 'chapter', value: 0, total: 0, percent: 0 };
      const completedCount = chapterLessons.filter(id => student.completedLessons.includes(id)).length;
      return { type: 'chapter', value: completedCount, total: chapterLessons.length, percent: Math.round((completedCount / chapterLessons.length) * 100) };
    }
    
    if (selectedUnitId && activeUnit) {
      const unitLessons = activeUnit.chapters.flatMap(c => c.lessons.map(l => l.id));
      if (unitLessons.length === 0) return { type: 'unit', value: 0, total: 0, percent: 0 };
      const completedCount = unitLessons.filter(id => student.completedLessons.includes(id)).length;
      return { type: 'unit', value: completedCount, total: unitLessons.length, percent: Math.round((completedCount / unitLessons.length) * 100) };
    }
    
    if (selectedSubjectId && activeSubject) {
      const subjectLessons = activeSubject.units.flatMap(u => u.chapters.flatMap(c => c.lessons.map(l => l.id)));
      if (subjectLessons.length === 0) return { type: 'subject', value: 0, total: 0, percent: 0 };
      const completedCount = subjectLessons.filter(id => student.completedLessons.includes(id)).length;
      return { type: 'subject', value: completedCount, total: subjectLessons.length, percent: Math.round((completedCount / subjectLessons.length) * 100) };
    }
    
    return { type: 'none' }; // Nothing selected
  };

  // Filtering students
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      // Search filter
      if (searchQuery && !s.name.includes(searchQuery) && !s.email.includes(searchQuery)) {
        return false;
      }
      
      // Status filter
      if (statusFilter !== 'all' && (selectedSubjectId || selectedUnitId || selectedChapterId || selectedLessonId)) {
        const progress = getTargetProgress(s);
        const isComplete = progress.type === 'lesson' ? progress.isDone : progress.percent === 100;
        
        if (statusFilter === 'completed' && !isComplete) return false;
        if (statusFilter === 'incomplete' && isComplete) return false;
      }

      return true;
    }).sort((a, b) => {
      const aProgress = getTargetProgress(a);
      const bProgress = getTargetProgress(b);
      
      if (aProgress.type === 'lesson' && bProgress.type === 'lesson') {
        if (aProgress.isDone && !bProgress.isDone) return -1;
        if (!aProgress.isDone && bProgress.isDone) return 1;
      } else if ((aProgress.type === 'unit' || aProgress.type === 'subject' || aProgress.type === 'chapter') && 
                 (bProgress.type === 'unit' || bProgress.type === 'subject' || bProgress.type === 'chapter')) {
        // Sort by highest percentage first so completed students bubble to top
        return (bProgress.percent || 0) - (aProgress.percent || 0);
      }
      return 0;
    });
  }, [students, searchQuery, selectedLessonId, selectedChapterId, selectedUnitId, selectedSubjectId, statusFilter]);

  const handleDisciplinarySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !actionType || !actionReason.trim()) return;

    setActionLoading(true);
    const updatedWarnings = actionType === 'warning' 
      ? [...(selectedStudent.warningsList || []), actionReason] 
      : (selectedStudent.warningsList || []);
    
    const updatedLates = actionType === 'late'
      ? [...(selectedStudent.latesList || []), actionReason]
      : (selectedStudent.latesList || []);

    const result = await updateStudentRecords(
      selectedStudent.email,
      actionType === 'warning' ? (selectedStudent.warningsCount || 0) + 1 : (selectedStudent.warningsCount || 0),
      actionType === 'late' ? (selectedStudent.latesCount || 0) + 1 : (selectedStudent.latesCount || 0),
      updatedWarnings,
      updatedLates
    );

    if (result.success) {
      // Update local state to reflect change instantly
      setStudents(prev => prev.map(s => {
        if (s.email === selectedStudent.email) {
          return {
            ...s,
            warningsCount: actionType === 'warning' ? (s.warningsCount || 0) + 1 : s.warningsCount,
            latesCount: actionType === 'late' ? (s.latesCount || 0) + 1 : s.latesCount,
            warningsList: updatedWarnings,
            latesList: updatedLates
          };
        }
        return s;
      }));
      closeModal();
    } else {
      alert(result.error || "فشل حفظ السجل");
    }
    setActionLoading(false);
  };

  const closeModal = () => {
    setSelectedStudent(null);
    setActionType(null);
    setActionReason("");
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-200" dir="rtl">
      
      {/* Navbar */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-500/20 text-indigo-400 flex items-center justify-center rounded-xl border border-indigo-500/30">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white leading-tight">لوحة تحكم المعلم والإدارة</h1>
              <p className="text-[10px] text-slate-400">كراسة متابعة المناهج الدراسية</p>
            </div>
          </div>
          
          <button 
            onClick={onLogout}
            className="flex items-center gap-2 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg transition-colors border border-rose-500/20 text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">تسجيل الخروج</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group">
            <div className="absolute right-0 top-0 w-16 h-16 bg-blue-500/5 rounded-bl-full -z-0 group-hover:bg-blue-500/10 transition-colors" />
            <div className="flex items-center justify-between mb-3 relative z-10">
              <span className="text-slate-400 font-medium text-sm">إجمالي الطلاب</span>
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-3xl font-black text-white relative z-10">{totalStudents}</div>
          </div>
          
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group">
            <div className="absolute right-0 top-0 w-16 h-16 bg-emerald-500/5 rounded-bl-full -z-0 group-hover:bg-emerald-500/10 transition-colors" />
            <div className="flex items-center justify-between mb-3 relative z-10">
              <span className="text-slate-400 font-medium text-sm">الدروس المنجزة</span>
              <Award className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-3xl font-black text-emerald-400 relative z-10">{totalCompleted}</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group">
            <div className="absolute right-0 top-0 w-16 h-16 bg-rose-500/5 rounded-bl-full -z-0 group-hover:bg-rose-500/10 transition-colors" />
            <div className="flex items-center justify-between mb-3 relative z-10">
              <span className="text-slate-400 font-medium text-sm">إجمالي التنبيهات</span>
              <AlertTriangle className="w-5 h-5 text-rose-400" />
            </div>
            <div className="text-3xl font-black text-rose-400 relative z-10">{totalWarnings}</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group">
            <div className="absolute right-0 top-0 w-16 h-16 bg-amber-500/5 rounded-bl-full -z-0 group-hover:bg-amber-500/10 transition-colors" />
            <div className="flex items-center justify-between mb-3 relative z-10">
              <span className="text-slate-400 font-medium text-sm">إجمالي التأخيرات</span>
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <div className="text-3xl font-black text-amber-400 relative z-10">{totalLates}</div>
          </div>
        </div>

        {/* Filters & Highlight Engine */}
        <div className="bg-indigo-950/20 border border-indigo-500/20 rounded-3xl p-6 shadow-xl backdrop-blur-sm space-y-5 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1/2 bg-gradient-to-r from-indigo-500/5 to-transparent pointer-events-none" />
          
          <div className="flex items-center gap-2 text-indigo-300 font-bold mb-2">
            <Filter className="w-5 h-5" />
            <h2>نظام التتبع المتقدم لإنجاز المناهج</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
            <div>
              <label className="block text-xs text-indigo-300/70 font-medium mb-1.5">المادة الدراسية</label>
              <select 
                value={selectedSubjectId}
                onChange={e => setSelectedSubjectId(e.target.value)}
                className="w-full bg-slate-950/50 border border-indigo-500/30 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="">-- اختر المادة --</option>
                {CURRICULUM_DATA.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
              </select>
            </div>
            
            <div>
              <label className="block text-xs text-indigo-300/70 font-medium mb-1.5">الوحدة / الباب</label>
              <select 
                value={selectedUnitId}
                onChange={e => setSelectedUnitId(e.target.value)}
                disabled={!selectedSubjectId}
                className="w-full bg-slate-950/50 border border-indigo-500/30 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 disabled:opacity-50"
              >
                <option value="">-- اختر الوحدة --</option>
                {activeSubject?.units.map(u => <option key={u.id} value={u.id}>{u.title}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs text-indigo-300/70 font-medium mb-1.5">الفصل (اختياري)</label>
              <select 
                value={selectedChapterId}
                onChange={e => setSelectedChapterId(e.target.value)}
                disabled={!selectedUnitId}
                className="w-full bg-slate-950/50 border border-indigo-500/30 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 disabled:opacity-50"
              >
                <option value="">-- اختر الفصل --</option>
                {activeUnit?.chapters.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
            
            <div>
              <label className="block text-xs text-indigo-300/70 font-medium mb-1.5">الدرس (اختياري)</label>
              <select 
                value={selectedLessonId}
                onChange={e => setSelectedLessonId(e.target.value)}
                disabled={!selectedChapterId}
                className="w-full bg-slate-950/50 border border-indigo-500/30 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 disabled:opacity-50"
              >
                <option value="">-- اختر الدرس --</option>
                {activeChapter?.lessons.map(l => (
                  <option key={l.id} value={l.id}>{l.title}</option>
                ))}
              </select>
            </div>
          </div>
          
          {(selectedSubjectId || selectedUnitId || selectedChapterId || selectedLessonId) && (
            <div className="mt-4 p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-xl flex items-center gap-3">
              <Activity className="w-5 h-5 text-emerald-300 animate-pulse" />
              <p className="text-sm text-emerald-200">
                الجدول بالأسفل يبرز الآن الطلاب الذين <strong className="text-emerald-400">أنجزوا</strong> الهدف المحدد في أعلى القائمة.
              </p>
            </div>
          )}
        </div>

        {/* Student Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-xl overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/50">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-400" />
              سجل متابعة الطلاب
            </h2>
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              {(selectedSubjectId || selectedUnitId || selectedChapterId || selectedLessonId) && (
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="w-full sm:w-auto bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="all">عرض الكل (مرتب حسب الإنجاز)</option>
                  <option value="incomplete">المتقاعسين فقط</option>
                  <option value="completed">المنجزين فقط</option>
                </select>
              )}
              <div className="relative w-full sm:w-64">
                <input 
                  type="text"
                  placeholder="بحث باسم الطالب أو الإيميل..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-4 pr-10 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
                <Search className="w-4 h-4 text-slate-500 absolute right-3 top-2.5" />
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-slate-950/50 text-slate-400 font-medium text-xs border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4 whitespace-nowrap">اسم الطالب</th>
                  <th className="px-6 py-4 whitespace-nowrap">التخصص</th>
                  {(selectedSubjectId || selectedUnitId || selectedChapterId || selectedLessonId) && <th className="px-6 py-4 text-center whitespace-nowrap">حالة الهدف المحدد</th>}
                  <th className="px-6 py-4 text-center whitespace-nowrap">إجمالي الإنجاز</th>
                  <th className="px-6 py-4 text-center whitespace-nowrap">التنبيهات</th>
                  <th className="px-6 py-4 text-center whitespace-nowrap">التأخيرات</th>
                  <th className="px-6 py-4 text-center whitespace-nowrap">إجراءات انضباطية</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                        <span>جاري تحميل بيانات الطلاب...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                      لا يوجد طلاب مطابقين للبحث.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map(student => {
                    const progress = getTargetProgress(student);
                    const isHighlighted = progress.type === 'lesson' ? !progress.isDone : (progress.type !== 'none' && (progress.percent || 0) < 100);
                    const totalStudentLessons = student.completedLessons?.length || 0;
                    
                    return (
                      <tr 
                        key={student.email} 
                        className={`transition-colors hover:bg-slate-800/30 ${isHighlighted ? 'bg-amber-500/5 hover:bg-amber-500/10' : ''}`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-bold text-white">{student.name || "لم يحدد بعد"}</div>
                          <div className="text-xs text-slate-500 font-mono mt-0.5">{student.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 bg-slate-800 rounded-md text-xs font-medium text-slate-300">
                            {student.category || "-"}
                          </span>
                        </td>
                        
                        {(selectedSubjectId || selectedUnitId || selectedChapterId || selectedLessonId) && (
                          <td className="px-6 py-4 text-center">
                            {progress.type === 'lesson' && (
                              progress.isDone ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  منجز
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-bold">
                                  <XCircle className="w-3.5 h-3.5" />
                                  متقاعس
                                </span>
                              )
                            )}
                            {(progress.type === 'chapter' || progress.type === 'unit' || progress.type === 'subject') && (
                              <div className="flex flex-col items-center justify-center gap-1">
                                <span className={`text-sm font-bold ${progress.percent === 100 ? 'text-emerald-400' : progress.percent === 0 ? 'text-rose-400' : 'text-amber-400'}`}>
                                  {progress.percent}%
                                </span>
                                <span className="text-[10px] text-slate-500 font-mono">{progress.value} / {progress.total} دروس</span>
                              </div>
                            )}
                          </td>
                        )}

                        <td className="px-6 py-4 text-center whitespace-nowrap">
                          <span className="text-lg font-black text-emerald-400">{totalStudentLessons}</span>
                        </td>
                        <td className="px-6 py-4 text-center whitespace-nowrap">
                          <span className={`text-lg font-black ${student.warningsCount > 0 ? 'text-rose-400' : 'text-slate-500'}`}>
                            {student.warningsCount || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center whitespace-nowrap">
                          <span className={`text-lg font-black ${student.latesCount > 0 ? 'text-amber-400' : 'text-slate-500'}`}>
                            {student.latesCount || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => { setSelectedStudent(student); setActionType('warning'); }}
                              className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white border border-rose-500/20 transition-all"
                              title="إضافة إنذار"
                            >
                              <AlertTriangle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => { setSelectedStudent(student); setActionType('late'); }}
                              className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500 hover:text-white border border-amber-500/20 transition-all"
                              title="تسجيل تأخير"
                            >
                              <Clock className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>

      {/* Disciplinary Modal */}
      <AnimatePresence>
        {selectedStudent && actionType && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className={`p-5 border-b flex items-center gap-3 ${actionType === 'warning' ? 'border-rose-500/20 bg-rose-500/5' : 'border-amber-500/20 bg-amber-500/5'}`}>
                {actionType === 'warning' ? (
                  <AlertTriangle className="w-6 h-6 text-rose-400" />
                ) : (
                  <Clock className="w-6 h-6 text-amber-400" />
                )}
                <h3 className={`font-bold text-lg ${actionType === 'warning' ? 'text-rose-400' : 'text-amber-400'}`}>
                  {actionType === 'warning' ? 'تسجيل إنذار أكاديمي/سلوكي' : 'تسجيل تأخير للطالب'}
                </h3>
              </div>
              
              <form onSubmit={handleDisciplinarySubmit} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">الطالب المستهدف</label>
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-medium">
                    {selectedStudent.name} <span className="text-xs text-slate-500 font-mono block mt-1">{selectedStudent.email}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">سبب {actionType === 'warning' ? 'الإنذار' : 'التأخير'} والتفاصيل</label>
                  <textarea
                    required
                    value={actionReason}
                    onChange={e => setActionReason(e.target.value)}
                    placeholder="مثال: لم يقم بإنجاز الواجبات المطلوبة لمدة أسبوعين..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none h-24"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm text-white flex justify-center transition-all ${
                      actionType === 'warning' ? 'bg-rose-600 hover:bg-rose-500' : 'bg-amber-600 hover:bg-amber-500'
                    } disabled:opacity-50`}
                  >
                    {actionLoading ? "جاري الحفظ..." : "حفظ السجل وتأكيد"}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="py-3 px-6 rounded-xl font-bold text-sm text-slate-300 bg-slate-800 hover:bg-slate-700 transition-all"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
