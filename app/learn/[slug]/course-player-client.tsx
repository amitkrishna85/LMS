"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  PlayCircle,
  Video,
  FileText,
  FileQuestion,
  FileDown,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Award,
  Layers,
  Clock,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

interface CoursePlayerClientProps {
  course: any;
  completedLessonIds: string[];
  user: any;
}

export function CoursePlayerClient({
  course,
  completedLessonIds: initialCompleted,
  user,
}: CoursePlayerClientProps) {
  const router = useRouter();

  // Flatten all lessons in order
  const allLessons: any[] = [];
  course.sections?.forEach((sec: any) => {
    sec.lessons?.forEach((les: any) => {
      allLessons.push({ ...les, sectionTitle: sec.title });
    });
  });

  const [completedSet, setCompletedSet] = useState<Set<string>>(
    new Set(initialCompleted)
  );
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [savingProgress, setSavingProgress] = useState(false);

  // Default to first incomplete lesson, or first lesson
  const initialIndex = allLessons.findIndex((l) => !completedSet.has(l.id));
  const [currentLessonIndex, setCurrentLessonIndex] = useState(
    initialIndex !== -1 ? initialIndex : 0
  );

  const currentLesson = allLessons[currentLessonIndex] || allLessons[0];
  const totalLessons = allLessons.length;
  const completedCount = allLessons.filter((l) => completedSet.has(l.id)).length;
  const progressPercent =
    totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  // Toggle or mark completion
  const handleToggleComplete = async (lessonId: string, markComplete = true) => {
    setSavingProgress(true);
    try {
      const res = await fetch(`/api/student/lessons/${lessonId}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: markComplete }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setCompletedSet((prev) => {
        const next = new Set(prev);
        if (markComplete) next.add(lessonId);
        else next.delete(lessonId);
        return next;
      });

      if (data.courseCompleted) {
        toast.success(
          "Congratulations! You completed all lessons in this course!",
          {
            description: "Your verified certificate has been issued.",
          }
        );
      } else if (markComplete) {
        toast.success("Lesson completed!");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update lesson status");
    } finally {
      setSavingProgress(false);
    }
  };

  const handleNextLesson = async () => {
    if (currentLesson && !completedSet.has(currentLesson.id)) {
      await handleToggleComplete(currentLesson.id, true);
    }
    if (currentLessonIndex < totalLessons - 1) {
      setCurrentLessonIndex(currentLessonIndex + 1);
    }
  };

  const handlePrevLesson = () => {
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex(currentLessonIndex - 1);
    }
  };

  // Quiz state for QUIZ lesson type
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-slate-100 overflow-hidden font-sans">
      {/* Top Learning Classroom Header */}
      <header className="h-14 border-b border-slate-800 bg-slate-950 px-4 flex items-center justify-between gap-4 flex-shrink-0 z-30">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Return to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div className="flex flex-col">
            <h1 className="text-xs font-bold text-slate-200 line-clamp-1 max-w-[200px] sm:max-w-md">
              {course.title}
            </h1>
            <span className="text-[10px] text-slate-400">
              {currentLesson?.sectionTitle || "Module"} • Lesson{" "}
              {currentLessonIndex + 1} of {totalLessons}
            </span>
          </div>
        </div>

        {/* Progress & Sidebar Toggle */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-32 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs font-bold text-emerald-400">
              {progressPercent}%
            </span>
          </div>

          {progressPercent === 100 && (
            <Link
              href="/dashboard"
              className="px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1 hover:bg-amber-500/30"
            >
              <Award className="w-3.5 h-3.5" />
              <span>Certificate Ready</span>
            </Link>
          )}

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center gap-1.5 text-xs font-medium"
          >
            <Layers className="w-4 h-4 text-indigo-400" />
            <span className="hidden md:inline">
              {sidebarOpen ? "Hide Outline" : "Show Outline"}
            </span>
          </button>
        </div>
      </header>

      {/* Main Classroom Workspace */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left: Main Lesson Stage */}
        <div className="flex-1 flex flex-col bg-slate-900 overflow-y-auto">
          {/* Active Lesson Content Viewer */}
          <div className="flex-1 p-4 sm:p-8 max-w-4xl w-full mx-auto flex flex-col justify-between">
            <div>
              {/* Lesson header */}
              <div className="mb-6 pb-4 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                    {currentLesson?.type || "VIDEO"} LECTURE
                  </span>
                  <h2 className="text-2xl font-extrabold text-white mt-1">
                    {currentLesson?.title || "Lesson"}
                  </h2>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{currentLesson?.durationMinutes || 10} minutes</span>
                </div>
              </div>

              {/* Viewer according to lesson type */}
              {currentLesson?.type === "VIDEO" && (
                <div className="space-y-4">
                  <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-2xl flex items-center justify-center">
                    {currentLesson?.contentUrl &&
                    currentLesson.contentUrl.startsWith("http") ? (
                      <video
                        controls
                        controlsList="nodownload"
                        className="w-full h-full object-contain"
                        src={currentLesson.contentUrl}
                      >
                        Your browser does not support the video tag.
                      </video>
                    ) : (
                      /* Demo video player simulated environment */
                      <div className="w-full h-full bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950 flex flex-col items-center justify-center p-6 text-center">
                        <div className="w-16 h-16 rounded-full bg-indigo-600/30 text-indigo-400 border border-indigo-500/40 flex items-center justify-center mb-4 shadow-lg shadow-indigo-600/20">
                          <PlayCircle className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold text-white">
                          HD Masterclass Lecture
                        </h3>
                        <p className="text-xs text-slate-400 mt-1 max-w-md">
                          Internal hosted high-definition video lesson for:{" "}
                          <strong className="text-slate-200">
                            {currentLesson?.title}
                          </strong>
                        </p>
                        <div className="mt-4 px-3 py-1.5 rounded-lg bg-slate-800/80 text-[11px] text-slate-300 font-mono">
                          Simulated Player • 1080p • 60fps
                        </div>
                      </div>
                    )}
                  </div>

                  {currentLesson?.body && (
                    <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300 leading-relaxed">
                      <strong className="text-slate-100 block mb-1">
                        Lecture Notes:
                      </strong>
                      <p>{currentLesson.body}</p>
                    </div>
                  )}
                </div>
              )}

              {currentLesson?.type === "TEXT" && (
                <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 sm:p-8 text-slate-200 space-y-4 shadow-xl">
                  <h3 className="text-lg font-bold text-white border-b border-slate-700 pb-3">
                    Reading Materials & Technical Guide
                  </h3>
                  <div className="prose prose-invert max-w-none text-sm leading-relaxed whitespace-pre-line text-slate-300">
                    {currentLesson?.body ||
                      "Detailed architectural guidelines, code samples, and deep-dive conceptual reference for this milestone lecture. Follow along with the exercises."}
                  </div>
                </div>
              )}

              {currentLesson?.type === "PDF" && (
                <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-8 text-center space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto">
                    <FileDown className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    Downloadable Course PDF Document
                  </h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Reference manual, cheat sheet, and offline study notes for{" "}
                    {currentLesson?.title}.
                  </p>
                  <a
                    href={currentLesson?.contentUrl || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition"
                  >
                    <FileDown className="w-4 h-4" />
                    <span>Download PDF Manual</span>
                  </a>
                </div>
              )}

              {currentLesson?.type === "QUIZ" && (
                <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-6 sm:p-8 space-y-6">
                  <div>
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                      Knowledge Check Quiz
                    </span>
                    <h3 className="text-lg font-bold text-white mt-1">
                      {currentLesson?.title}
                    </h3>
                    <p className="text-xs text-slate-300 mt-2">
                      {currentLesson?.body ||
                        "What is the recommended design pattern when designing fault-tolerant distributed transactions?"}
                    </p>
                  </div>

                  {/* Quiz Options */}
                  <div className="space-y-2.5">
                    {[
                      "Saga Pattern with Orchestration or Choreography",
                      "Two-Phase Commit across all global public microservices",
                      "Direct synchronous REST loops without timeouts",
                      "Single shared global database table with write locks",
                    ].map((opt, optIdx) => {
                      const isSelected = quizAnswer === optIdx;
                      const isCorrect = optIdx === 0;

                      let itemStyle =
                        "bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500";
                      if (quizSubmitted) {
                        if (isCorrect) {
                          itemStyle =
                            "bg-emerald-950/80 border-emerald-500 text-emerald-200";
                        } else if (isSelected && !isCorrect) {
                          itemStyle =
                            "bg-rose-950/80 border-rose-500 text-rose-200";
                        }
                      } else if (isSelected) {
                        itemStyle =
                          "bg-indigo-950 border-indigo-400 text-indigo-100";
                      }

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          disabled={quizSubmitted}
                          onClick={() => setQuizAnswer(optIdx)}
                          className={`w-full p-4 rounded-xl border text-left text-xs font-medium transition flex items-center justify-between ${itemStyle}`}
                        >
                          <span>{opt}</span>
                          {quizSubmitted && isCorrect && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      {quizSubmitted
                        ? quizAnswer === 0
                          ? "Correct! Great job."
                          : "Incorrect. The Saga pattern provides distributed fault isolation."
                        : "Select an option and verify your answer."}
                    </span>

                    {!quizSubmitted ? (
                      <button
                        type="button"
                        disabled={quizAnswer === null}
                        onClick={() => {
                          setQuizSubmitted(true);
                          if (quizAnswer === 0) {
                            handleToggleComplete(currentLesson.id, true);
                          }
                        }}
                        className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs disabled:opacity-50 transition"
                      >
                        Submit Answer
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setQuizSubmitted(false);
                          setQuizAnswer(null);
                        }}
                        className="px-4 py-1.5 rounded-lg bg-slate-700 text-slate-300 text-xs font-medium hover:bg-slate-600"
                      >
                        Retry Quiz
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Controls Bar */}
            <div className="mt-12 pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <button
                type="button"
                disabled={currentLessonIndex === 0}
                onClick={handlePrevLesson}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous Lesson</span>
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={savingProgress}
                  onClick={() =>
                    handleToggleComplete(
                      currentLesson.id,
                      !completedSet.has(currentLesson.id)
                    )
                  }
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
                    completedSet.has(currentLesson.id)
                      ? "bg-emerald-950 text-emerald-300 border border-emerald-500/50 hover:bg-emerald-900"
                      : "bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700"
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>
                    {completedSet.has(currentLesson.id)
                      ? "Completed (Click to uncheck)"
                      : "Mark as Completed"}
                  </span>
                </button>

                {currentLessonIndex < totalLessons - 1 ? (
                  <button
                    type="button"
                    onClick={handleNextLesson}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition"
                  >
                    <span>Next Lesson</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <Link
                    href="/dashboard"
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition"
                  >
                    <span>Finish Course</span>
                    <Award className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Collapsible Curriculum Outline Sidebar */}
        {sidebarOpen && (
          <aside className="w-80 lg:w-96 border-l border-slate-800 bg-slate-950 flex flex-col flex-shrink-0 z-20">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Course Curriculum
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {completedCount} of {totalLessons} Lessons Completed
                </p>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 p-2">
              {course.sections?.map((section: any, secIdx: number) => (
                <div key={section.id} className="py-2">
                  <span className="text-[11px] font-bold text-slate-400 px-3 py-1 block">
                    Section {secIdx + 1}: {section.title}
                  </span>

                  <div className="mt-1 space-y-1">
                    {section.lessons?.map((lesson: any) => {
                      const lessonGlobalIdx = allLessons.findIndex(
                        (l) => l.id === lesson.id
                      );
                      const isCurrent = lessonGlobalIdx === currentLessonIndex;
                      const isCompleted = completedSet.has(lesson.id);

                      return (
                        <button
                          key={lesson.id}
                          type="button"
                          onClick={() => {
                            setCurrentLessonIndex(lessonGlobalIdx);
                            setQuizSubmitted(false);
                            setQuizAnswer(null);
                          }}
                          className={`w-full p-2.5 rounded-xl text-left text-xs transition flex items-center justify-between gap-2 ${
                            isCurrent
                              ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 font-bold"
                              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900 font-medium"
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            {isCompleted ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                            ) : lesson.type === "VIDEO" ? (
                              <Video className="w-4 h-4 text-slate-500 flex-shrink-0" />
                            ) : lesson.type === "QUIZ" ? (
                              <FileQuestion className="w-4 h-4 text-amber-500 flex-shrink-0" />
                            ) : (
                              <FileText className="w-4 h-4 text-slate-500 flex-shrink-0" />
                            )}
                            <span className="truncate">{lesson.title}</span>
                          </div>

                          <span className="text-[10px] text-slate-500 flex-shrink-0">
                            {lesson.durationMinutes}m
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
