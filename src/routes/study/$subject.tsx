import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { ChevronRight, Pencil, Trash2, Plus, X, RotateCcw, Save, XCircle } from "lucide-react";
import { PageShell, Pill } from "@/components/app-shell";
import { NotebookSheet } from "@/components/NotebookSheet";
import { useApp } from "@/lib/app-state";
import { useAccess } from "@/lib/access-store";
import { type Subject, type Chapter } from "@/lib/mock-data";
import { getMasterSubjects, saveEditedSubject, getEditedSubject, resetSubjectToDefault } from "@/lib/subject-storage";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/study/$subject")({
  head: ({ params }) => {
    const masterSubjects = getMasterSubjects();
    const s = masterSubjects.find((x) => x.slug === params.subject);
    const name = s ? s.en : "Subject";
    return {
      meta: [
        { title: `${name} Chapters — Wafi` },
        { name: "description", content: `Chapters and lessons for ${name}, with Bangla explanations and practice.` },
        { property: "og:title", content: `${name} Chapters — Wafi` },
        { property: "og:description", content: `Study ${name} chapter by chapter.` },
      ],
    };
  },
  validateSearch: (search: Record<string, unknown>) => ({
    exam: typeof search.exam === "string" ? search.exam : undefined,
    chapters: typeof search.chapters === "string" ? search.chapters : undefined,
  }),
  loader: ({ params }): Subject => {
    const masterSubjects = getMasterSubjects();
    const subject = masterSubjects.find((s) => s.slug === params.subject);
    if (!subject) throw notFound();
    return subject;
  },
  component: SubjectPage,
});

function getChapterLabel(chapter: Chapter): string {
  const labelType = chapter.labelType || 'chapter';
  const customLabel = chapter.customLabel;
  
  // If customLabel is set (e.g. "Part 1"), render PART 1 instead of hardcoded CHAPTER 1
  if (customLabel && labelType === 'custom') {
    return customLabel.toUpperCase();
  }
  
  // If both exist, render PART 1 · CHAPTER 1
  if (customLabel && labelType !== 'chapter') {
    return `${customLabel.toUpperCase()} · ${labelType.toUpperCase()} ${chapter.id}`;
  }
  
  // If neither is set, gracefully default to CHAPTER ${chapter.id}
  return `${labelType.toUpperCase()} ${chapter.id}`;
}

function SubjectPage() {
  const subject: Subject = Route.useLoaderData();
  const { t, lang } = useApp();
  const { currentUser } = useAccess();
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [isEditMode, setIsEditMode] = useState(false);
  const [localChapters, setLocalChapters] = useState(subject.chapters);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Check if user has permission to edit study content
  const canEditStudy = currentUser?.role === "admin" || currentUser?.role === "teacher";

  // Parse exam mode and chapter filter
  const isExamMode = search.exam === "1" && search.chapters;
  const filteredChapterIds = isExamMode 
    ? search.chapters!.split(",").map(Number).filter(n => !isNaN(n))
    : [];

  // Filter chapters based on exam mode
  const displayedChapters = isExamMode && filteredChapterIds.length > 0
    ? localChapters.filter(c => filteredChapterIds.includes(c.id))
    : localChapters;

  // Load edited chapters from storage on mount
  useEffect(() => {
    const edited = getEditedSubject(subject.slug);
    if (edited) {
      setLocalChapters(edited);
    }
  }, [subject.slug]);

  // Force exit edit mode if user loses permission
  useEffect(() => {
    if (isEditMode && !canEditStudy) {
      setIsEditMode(false);
    }
  }, [canEditStudy, isEditMode]);

  // Clear exam filter
  const clearExamFilter = () => {
    navigate({
      to: "/study/$subject",
      params: { subject: subject.slug },
      search: {},
    });
  };

  const handleSave = () => {
    saveEditedSubject(subject.slug, localChapters);
    setHasUnsavedChanges(false);
    setIsEditMode(false);
  };

  const handleCancel = () => {
    const edited = getEditedSubject(subject.slug);
    setLocalChapters(edited || subject.chapters);
    setHasUnsavedChanges(false);
    setIsEditMode(false);
  };

  const handleReset = () => {
    resetSubjectToDefault(subject.slug);
    setLocalChapters(subject.chapters);
    setHasUnsavedChanges(false);
  };

  const updateChapterTitle = (chapterId: number, field: "en" | "bn" | "part" | "labelType" | "customLabel", value: string) => {
    setLocalChapters((prev) =>
      prev.map((c) => {
        if (c.id === chapterId) {
          if (field === "part") {
            const { part, ...rest } = c;
            return value ? { ...rest, part: value } : rest;
          }
          if (field === "labelType") {
            if (value === "chapter") {
              const { labelType, customLabel, ...rest } = c;
              return rest;
            }
            return { ...c, labelType: value as Chapter["labelType"] };
          }
          if (field === "customLabel") {
            if (!value) {
              const { customLabel, ...rest } = c;
              return rest;
            }
            return { ...c, customLabel: value };
          }
          return { ...c, [field]: value };
        }
        return c;
      })
    );
    setHasUnsavedChanges(true);
  };

  const updateLessonTitle = (chapterId: number, lessonIndex: number, value: string) => {
    setLocalChapters((prev) =>
      prev.map((c) =>
        c.id === chapterId
          ? {
              ...c,
              lessons: c.lessons.map((l, i) => (i === lessonIndex ? value : l)),
            }
          : c
      )
    );
    setHasUnsavedChanges(true);
  };

  const deleteLesson = (chapterId: number, lessonIndex: number) => {
    setLocalChapters((prev) =>
      prev.map((c) =>
        c.id === chapterId
          ? {
              ...c,
              lessons: c.lessons.filter((_, i) => i !== lessonIndex),
            }
          : c
      )
    );
    setHasUnsavedChanges(true);
  };

  const addLesson = (chapterId: number) => {
    setLocalChapters((prev) =>
      prev.map((c) =>
        c.id === chapterId
          ? {
              ...c,
              lessons: [...c.lessons, ""],
            }
          : c
      )
    );
    setHasUnsavedChanges(true);
  };

  const addChapter = () => {
    const nextId = localChapters.length > 0 ? Math.max(...localChapters.map((c) => c.id)) + 1 : 1;
    setLocalChapters((prev) => [
      ...prev,
      {
        id: nextId,
        labelType: 'chapter',
        customLabel: '',
        en: 'New Chapter',
        bn: 'নতুন অধ্যায়',
        lessons: ['Lesson 1'],
        done: 0,
      },
    ]);
    setHasUnsavedChanges(true);

    // Auto-scroll to the new chapter after it's rendered
    setTimeout(() => {
      const newChapterElement = document.querySelector(`[data-chapter-id="${nextId}"]`);
      if (newChapterElement) {
        newChapterElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);

    // If in exam mode, automatically add the new chapter to the filter
    if (isExamMode && filteredChapterIds.length > 0) {
      const updatedChapterIds = [...filteredChapterIds, nextId].sort((a, b) => a - b);
      navigate({
        to: "/study/$subject",
        params: { subject: subject.slug },
        search: { exam: "1", chapters: updatedChapterIds.join(",") },
      });
    }
  };

  const deleteChapter = (chapterId: number) => {
    setLocalChapters((prev) => prev.filter((c) => c.id !== chapterId));
    setHasUnsavedChanges(true);
  };

  return (
    <PageShell
      title={`${subject.en}`}
      subtitle={`${subject.progress}% ${t("complete", "সম্পন্ন")}`}
      back="/study"
      action={
        canEditStudy ? (
          <button
            type="button"
            onClick={() => setIsEditMode(!isEditMode)}
            className="tap inline-flex size-8 sm:size-9 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-soft transition-colors hover:bg-accent/40"
            aria-label={isEditMode ? "Exit edit mode" : "Enter edit mode"}
          >
            <Pencil className="size-3.5 sm:size-4" />
          </button>
        ) : null
      }
      hideNav={isEditMode}
    >
      {isExamMode && (
        <div className="mb-4 rounded-2xl bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 p-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">🎯</span>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-indigo-700">
                {t("Exam Preparation Mode", "পরীক্ষার প্রস্তুতি মোড")}
              </span>
              <span className="text-[10px] text-indigo-600">
                {t("Chapters:", "অধ্যায়:")} {filteredChapterIds.join(", ")}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={clearExamFilter}
            className="tap inline-flex items-center gap-1 rounded-full bg-white border border-indigo-200 px-2.5 py-1 text-[10px] font-semibold text-indigo-600 hover:bg-indigo-50"
          >
            <XCircle className="size-3" />
            {t("View All", "সব দেখুন")}
          </button>
        </div>
      )}
      <div className="space-y-4 pb-28">
        {displayedChapters.map((c) => (
          <NotebookSheet
            key={c.id}
            data-chapter-id={c.id}
          >
            {/* Chapter Header */}
            <div className="mb-4 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="text-sm font-bold uppercase tracking-wide text-muted-foreground shrink-0">
                  {getChapterLabel(c)}
                </span>
                {isEditMode && canEditStudy && (
                  <button
                    type="button"
                    onClick={() => deleteChapter(c.id)}
                    className="tap inline-flex size-6 items-center justify-center rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20 shrink-0"
                    aria-label="Delete chapter"
                  >
                    <Trash2 className="size-3" />
                  </button>
                )}
              </div>
              <Pill tone={c.done === c.lessons.length ? "success" : "warning"} className="shrink-0">
                {c.done}/{c.lessons.length}
              </Pill>
            </div>

            {/* Chapter Title & Edit Mode */}
            {isEditMode ? (
              <div className="mb-4 space-y-2">
                <div className="flex gap-2">
                  <select
                    value={c.labelType || "chapter"}
                    onChange={(e) => updateChapterTitle(c.id, "labelType", e.target.value)}
                    className="flex-1 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="chapter">Chapter</option>
                    <option value="part">Part</option>
                    <option value="unit">Unit</option>
                    <option value="custom">Custom</option>
                  </select>
                  {(c.labelType === "custom" || c.labelType === "part" || c.labelType === "unit") && (
                    <input
                      type="text"
                      value={c.customLabel ?? ""}
                      onChange={(e) => updateChapterTitle(c.id, "customLabel", e.target.value)}
                      placeholder="Custom label (e.g. Part 1)"
                      className="flex-1 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  )}
                </div>
                <input
                  type="text"
                  value={c.part ?? ""}
                  onChange={(e) => updateChapterTitle(c.id, "part", e.target.value)}
                  placeholder="Part / Unit (Optional - Legacy)"
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  type="text"
                  value={c.en}
                  onChange={(e) => updateChapterTitle(c.id, "en", e.target.value)}
                  placeholder="Chapter title (English)"
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  type="text"
                  value={c.bn}
                  onChange={(e) => updateChapterTitle(c.id, "bn", e.target.value)}
                  placeholder="অধ্যায়ের শিরোনাম (বাংলা)"
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            ) : (
              <p className="mb-3 text-sm font-bold">{lang === "bn" ? c.bn : c.en}</p>
            )}

            {/* Lessons with Ruled Dividers */}
            <ul className="space-y-0">
              {c.lessons.map((lesson, i) => (
                <li
                  key={`${c.id}-${i}`}
                  className="border-b border-sky-100 dark:border-sky-900/40 last:border-b-0 min-h-[2.5rem] py-2 flex items-center justify-between"
                >
                  {isEditMode ? (
                    <div className="w-full flex items-center gap-2">
                      <span className="grid size-7 shrink-0 place-items-center rounded-full bg-card text-[11px] font-bold">
                        {i + 1}
                      </span>
                      <input
                        type="text"
                        value={lesson}
                        onChange={(e) => updateLessonTitle(c.id, i, e.target.value)}
                        placeholder="Lesson title"
                        className="flex-1 rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <button
                        type="button"
                        onClick={() => deleteLesson(c.id, i)}
                        className="tap inline-flex size-6 items-center justify-center rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20 shrink-0"
                        aria-label="Delete lesson"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </div>
                  ) : (
                    <Link
                      to="/lesson/$lessonId"
                      params={{ lessonId: `${subject.slug}-${c.id}-${i + 1}` }}
                      className="tap w-full flex items-center gap-3"
                    >
                      <span className="grid size-7 shrink-0 place-items-center rounded-full bg-card text-[11px] font-bold">
                        {i + 1}
                      </span>
                      <span className="flex-1 truncate text-sm font-medium">{lesson}</span>
                      {i < c.done ? <Pill tone="success">✓</Pill> : null}
                      <ChevronRight className="size-4 text-muted-foreground shrink-0" />
                    </Link>
                  )}
                </li>
              ))}
            </ul>

            {/* Add Lesson Button */}
            {isEditMode && canEditStudy && (
              <button
                type="button"
                onClick={() => addLesson(c.id)}
                className="mt-3 tap flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-muted/50 px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted"
              >
                <Plus className="size-4" />
                {t("Add Lesson", "পাঠ যোগ করুন")}
              </button>
            )}
          </NotebookSheet>
        ))}
        {isEditMode && canEditStudy && (
          <button
            type="button"
            onClick={addChapter}
            className="w-full py-4 px-4 my-4 rounded-2xl border-2 border-dashed border-primary/50 bg-primary/10 hover:bg-primary/20 text-primary font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            <Plus className="h-5 w-5 text-primary"/>
            <span>Add New Chapter / Part</span>
          </button>
        )}
      </div>
      {isEditMode && (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-sm px-4 py-3 pb-[env(safe-area-inset-bottom)]">
          <div className="mx-auto flex max-w-[800px] gap-2">
            <button
              type="button"
              onClick={handleSave}
              className="tap flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              <Save className="size-4" />
              {t("Save Changes", "পরিবর্তন সংরক্ষণ করুন")}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="tap flex flex-1 items-center justify-center gap-2 rounded-2xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-accent/40"
            >
              <X className="size-4" />
              {t("Cancel", "বাতিল করুন")}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="tap flex flex-1 items-center justify-center gap-2 rounded-2xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-accent/40"
            >
              <RotateCcw className="size-4" />
              {t("Reset to Default", "ডিফল্টে ফিরে যান")}
            </button>
          </div>
        </div>
      )}
    </PageShell>
  );
}
