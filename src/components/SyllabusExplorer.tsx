import React, { useState } from "react";
import { Subject, Lesson } from "../types";
import { CheckSquare, Square, ChevronRight, ChevronDown, Award, BookOpen, GraduationCap, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface SyllabusExplorerProps {
  subjects: Subject[];
  completedLessons: string[];
  onToggleLesson: (lessonId: string, done: boolean) => void;
}

export default function SyllabusExplorer({ subjects, completedLessons, onToggleLesson }: SyllabusExplorerProps) {
  const [activeSubjectId, setActiveSubjectId] = useState<string>(subjects[0]?.id || "");
  const [expandedUnits, setExpandedUnits] = useState<Record<string, boolean>>({});
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({});

  const activeSubject = subjects.find(s => s.id === activeSubjectId) || subjects[0];

  // دالة لحساب نسبة التقدم لمادة معينة
  const getSubjectStats = (subject: Subject) => {
    let total = 0;
    let completed = 0;

    subject.units.forEach(unit => {
      if (unit.chapters) {
        unit.chapters.forEach(ch => {
          ch.lessons.forEach(l => {
            total++;
            if (completedLessons.includes(l.id)) completed++;
          });
        });
      }
      if (unit.lessons) {
        unit.lessons.forEach(l => {
          total++;
          if (completedLessons.includes(l.id)) completed++;
        });
      }
    });

    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percent };
  };

  const toggleUnit = (unitId: string) => {
    setExpandedUnits(prev => ({ ...prev, [unitId]: !prev[unitId] }));
  };

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters(prev => ({ ...prev, [chapterId]: !prev[chapterId] }));
  };

  // تهيئة الوحدات والفصول لتكون مفتوحة تلقائياً بالبداية للتسهيل
  React.useEffect(() => {
    if (activeSubject) {
      const initialUnits: Record<string, boolean> = {};
      const initialChapters: Record<string, boolean> = {};
      
      activeSubject.units.forEach(u => {
        initialUnits[u.id] = true;
        if (u.chapters) {
          u.chapters.forEach(c => {
            initialChapters[c.id] = true;
          });
        }
      });

      setExpandedUnits(prev => ({ ...initialUnits, ...prev }));
      setExpandedChapters(prev => ({ ...initialChapters, ...prev }));
    }
  }, [activeSubjectId]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8" id="syllabus_explorer_layout">
      {/* القائمة الجانبية للمواد */}
      <div className="lg:col-span-1 space-y-3" id="subjects_sidebar_column">
        <div className="flex justify-between items-end">
          <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider px-2 flex items-center gap-1.5" id="subjects_sidebar_title">
            <GraduationCap className="w-5 h-5 text-indigo-400" />
            المواد المتوفرة
          </h3>
          <span className="text-[10px] text-white/40 lg:hidden px-2 flex items-center gap-1 animate-pulse">
            اسحب للمزيد ←
          </span>
        </div>

        <div className="flex flex-row lg:flex-col gap-3 overflow-x-auto pb-4 lg:pb-0 scrollbar-none snap-x snap-mandatory" id="subjects_tabs_list">
          {subjects.map(subject => {
            const isActive = subject.id === activeSubjectId;
            const stats = getSubjectStats(subject);

            return (
              <button
                key={subject.id}
                onClick={() => setActiveSubjectId(subject.id)}
                className={`w-72 lg:w-full snap-center snap-always text-right p-4 rounded-2xl border transition-all duration-200 shrink-0 lg:shrink flex flex-col gap-2 cursor-pointer backdrop-blur-md ${
                  isActive
                    ? "bg-white/15 border-white/25 text-white shadow-xl scale-100"
                    : "bg-white/5 border-white/5 text-white/70 hover:bg-white/10 hover:border-white/10 scale-[0.98] lg:scale-100"
                }`}
                id={`tab_subject_${subject.id}`}
              >
                <div className="flex justify-between items-center w-full">
                  <span className="font-extrabold text-sm md:text-md truncate">{subject.title}</span>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${isActive ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-white/10 text-white/60'}`}>
                    {stats.percent}%
                  </span>
                </div>

                {/* مؤشر تقدم صغير في الكرت */}
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mt-1">
                  <div 
                    className={`h-full rounded-full bg-gradient-to-l ${isActive ? 'from-emerald-400 to-teal-400' : 'from-emerald-500 to-teal-500'}`} 
                    style={{ width: `${stats.percent}%` }}
                  />
                </div>
                
                <div className="flex justify-between items-center text-[10px] opacity-75">
                  <span>منجز: {stats.completed} درس</span>
                  <span>المجموع: {stats.total}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* لوحة عرض محتوى المادة المحددة */}
      <div className="lg:col-span-3 space-y-6" id="subject_curriculum_column">
        {activeSubject && (
          <motion.div
            key={activeSubject.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
            id="curriculum_panel"
          >
            {/* بطاقة تفاصيل المادة */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-3xl p-6 flex flex-col md:flex-row md:justify-between md:items-center gap-4 shadow-2xl" id="subject_intro_card">
              <div className="space-y-1.5" id="subject_intro_text">
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-indigo-400" />
                  مقرر {activeSubject.title}
                </h2>
                <p className="text-xs text-white/60 leading-relaxed">
                  انقر على مربع الاختيار لتحديد الدرس كمكتمل. سيقوم النظام بحفظ تقدمك وتحديث النسبة الكلية تلقائياً.
                </p>
              </div>

              {/* نسبة الإنجاز في هذه المادة */}
              {(() => {
                const stats = getSubjectStats(activeSubject);
                return (
                  <div className="bg-white/10 border border-white/10 rounded-2xl p-4 flex items-center gap-4 shrink-0 shadow-lg" id="subject_percentage_badge">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center font-extrabold text-md" id="percentage_box">
                      {stats.percent}%
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">التقدم الفردي للمادة</h4>
                      <p className="text-[10px] text-white/50 mt-0.5">تم إكمال {stats.completed} من أصل {stats.total} درس</p>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* شجرة الوحدات والفصول والدروس */}
            <div className="space-y-4" id="curriculum_tree">
              {activeSubject.units.map(unit => {
                const isUnitExpanded = expandedUnits[unit.id] !== false;
                
                return (
                  <div key={unit.id} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden shadow-2xl" id={`unit_container_${unit.id}`}>
                    {/* ترويسة الوحدة */}
                    <button
                      onClick={() => toggleUnit(unit.id)}
                      className="w-full flex justify-between items-center p-5 bg-white/5 border-b border-white/10 font-extrabold text-white hover:bg-white/10 transition-all text-right cursor-pointer"
                    >
                      <span className="text-sm md:text-md">{unit.title}</span>
                      {isUnitExpanded ? <ChevronDown className="w-5 h-5 text-white/60" /> : <ChevronRight className="w-5 h-5 text-white/60" />}
                    </button>

                    {/* محتوى الوحدة */}
                    <AnimatePresence initial={false}>
                      {isUnitExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="divide-y divide-white/5"
                        >
                          {/* في حال وجود فصول داخل الوحدة */}
                          {unit.chapters && unit.chapters.map(chapter => {
                            const isChExpanded = expandedChapters[chapter.id] !== false;

                            return (
                              <div key={chapter.id} className="p-4 md:p-5" id={`chapter_container_${chapter.id}`}>
                                <button
                                  onClick={() => toggleChapter(chapter.id)}
                                  className="w-full flex items-center gap-1.5 font-bold text-white hover:text-white transition-all text-right text-xs md:text-sm mb-3 cursor-pointer"
                                >
                                  {isChExpanded ? <ChevronDown className="w-4 h-4 text-indigo-400" /> : <ChevronRight className="w-4 h-4 text-indigo-400" />}
                                  <span>{chapter.title}</span>
                                </button>

                                {isChExpanded && (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-2" id={`lessons_grid_${chapter.id}`}>
                                    {chapter.lessons.map(lesson => {
                                      const isDone = completedLessons.includes(lesson.id);

                                      return (
                                        <button
                                          key={lesson.id}
                                          onClick={() => onToggleLesson(lesson.id, !isDone)}
                                          className={`w-full text-right p-3.5 rounded-xl border flex items-center justify-between gap-4 transition-all duration-150 group cursor-pointer ${
                                            isDone
                                              ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-200 shadow-md"
                                              : "bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/10 text-white/80"
                                          }`}
                                          id={`btn_lesson_toggle_${lesson.id}`}
                                        >
                                          <div className="flex items-center gap-3">
                                            <div className="shrink-0">
                                              {isDone ? (
                                                <CheckCircle2 className="w-5.5 h-5.5 text-emerald-400 fill-emerald-500/20" />
                                              ) : (
                                                <div className="w-5.5 h-5.5 rounded-md border border-white/20 group-hover:border-indigo-400 transition-colors" />
                                              )}
                                            </div>
                                            <span className={`text-xs md:text-sm font-semibold leading-relaxed ${isDone ? 'line-through text-white/40' : ''}`}>
                                              {lesson.title}
                                            </span>
                                          </div>
                                          {isDone && (
                                            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold px-2 py-0.5 rounded-md shrink-0">
                                              مكتمل
                                            </span>
                                          )}
                                        </button>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })}

                          {/* في حال وجود دروس مباشرة داخل الوحدة دون فصول */}
                          {unit.lessons && (
                            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-3">
                              {unit.lessons.map(lesson => {
                                const isDone = completedLessons.includes(lesson.id);

                                return (
                                  <button
                                    key={lesson.id}
                                    onClick={() => onToggleLesson(lesson.id, !isDone)}
                                    className={`w-full text-right p-3.5 rounded-xl border flex items-center justify-between gap-4 transition-all duration-150 group cursor-pointer ${
                                      isDone
                                        ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-200 shadow-md"
                                        : "bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/10 text-white/80"
                                    }`}
                                    id={`btn_direct_lesson_toggle_${lesson.id}`}
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="shrink-0">
                                        {isDone ? (
                                          <CheckCircle2 className="w-5.5 h-5.5 text-emerald-400 fill-emerald-500/20" />
                                        ) : (
                                          <div className="w-5.5 h-5.5 rounded-md border border-white/20 group-hover:border-indigo-400 transition-colors" />
                                        )}
                                      </div>
                                      <span className={`text-xs md:text-sm font-semibold leading-relaxed ${isDone ? 'line-through text-white/40' : ''}`}>
                                        {lesson.title}
                                      </span>
                                    </div>
                                    {isDone && (
                                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold px-2 py-0.5 rounded-md shrink-0">
                                        مكتمل
                                      </span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
