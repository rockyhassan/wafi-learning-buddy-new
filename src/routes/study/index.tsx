import { createFileRoute, Link } from "@tanstack/react-router";
import { Pencil, Trash2, Plus, Save, X, RotateCcw } from "lucide-react";
import { PageShell } from "@/components/app-shell";
import { Progress } from "@/components/ui/progress";
import { useApp } from "@/lib/app-state";
import { subjects as defaultSubjects, type Subject } from "@/lib/mock-data";
import { getMasterSubjects, saveMasterSubjects, resetMasterSubjects } from "@/lib/subject-storage";
import { getSubjectMeta } from "@/lib/subjects";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/study/")({
  head: () => ({
    meta: [
      { title: "Study Subjects — Wafi" },
      { name: "description", content: "Browse every school subject with chapters and lessons for your class." },
      { property: "og:title", content: "Study Subjects — Wafi" },
      { property: "og:description", content: "English, Bangla, Math, Science, BGS, ICT and more." },
    ],
  }),
  component: Study,
});

function Study() {
  const { t, lang } = useApp();
  const [isEditMode, setIsEditMode] = useState(false);
  const [subjectList, setSubjectList] = useState<Subject[]>(defaultSubjects);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Load subjects from storage on mount
  useEffect(() => {
    const stored = getMasterSubjects();
    setSubjectList(stored);
  }, []);

  const handleEditSubject = (index: number, field: "en" | "bn", value: string) => {
    setSubjectList((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
    setHasUnsavedChanges(true);
  };

  const handleDeleteSubject = (index: number) => {
    setSubjectList((prev) => prev.filter((_, i) => i !== index));
    setHasUnsavedChanges(true);
  };

  const handleAddSubject = () => {
    const nextId = Math.max(...subjectList.map((s) => parseInt(s.id.split("-").pop() || "0"))) + 1;
    const newSubject: Subject = {
      id: `custom-subject-${nextId}`,
      slug: `custom-${nextId}`,
      en: "New Subject",
      bn: "নতুন বিষয়",
      icon: "BookOpen",
      progress: 0,
      chapters: [
        {
          id: 1,
          en: "Chapter 1",
          bn: "অধ্যায় ১",
          done: 0,
          lessons: ["Lesson 1"],
        },
      ],
    };
    setSubjectList((prev) => [...prev, newSubject]);
    setHasUnsavedChanges(true);

    // Auto-scroll to the new subject after it's rendered
    setTimeout(() => {
      const newElement = document.querySelector(`[data-subject-id="${newSubject.id}"]`);
      if (newElement) {
        newElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100);
  };

  const handleSave = () => {
    saveMasterSubjects(subjectList);
    setHasUnsavedChanges(false);
    setIsEditMode(false);
  };

  const handleCancel = () => {
    const stored = getMasterSubjects();
    setSubjectList(stored);
    setHasUnsavedChanges(false);
    setIsEditMode(false);
  };

  const handleReset = () => {
    resetMasterSubjects();
    setSubjectList(defaultSubjects);
    setHasUnsavedChanges(false);
  };

  return (
    <PageShell
      title={t("Study", "পড়াশোনা")}
      subtitle={t("All subjects", "সব বিষয়")}
      action={
        <button
          type="button"
          onClick={() => setIsEditMode(!isEditMode)}
          className="tap inline-flex size-8 sm:size-9 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-soft transition-colors hover:bg-accent/40"
          aria-label={isEditMode ? "Exit edit mode" : "Enter edit mode"}
        >
          <Pencil className="size-3.5 sm:size-4" />
        </button>
      }
      hideNav={isEditMode}
    >
      <div className="space-y-4 pb-28">
        <div className="grid grid-cols-2 gap-3">
          {subjectList.map((s, index) => {
            const meta = getSubjectMeta(s.en);
            return (
              <div
                key={s.id}
                data-subject-id={s.id}
                className={isEditMode ? "space-y-2" : ""}
              >
                {isEditMode ? (
                  <div className="rounded-3xl border border-border bg-card p-4 shadow-soft space-y-2">
                    <div className="flex gap-2 items-start">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={s.en}
                          onChange={(e) => handleEditSubject(index, "en", e.target.value)}
                          placeholder="Subject (English)"
                          className="w-full text-sm font-bold rounded-lg border border-border bg-muted px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <input
                          type="text"
                          value={s.bn}
                          onChange={(e) => handleEditSubject(index, "bn", e.target.value)}
                          placeholder="বিষয় (বাংলা)"
                          className="w-full text-sm font-bold rounded-lg border border-border bg-muted px-2 py-1.5 mt-1 focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteSubject(index)}
                        className="tap inline-flex size-8 items-center justify-center rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20 mt-1"
                        aria-label="Delete subject"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                    <div className="text-[11px] text-muted-foreground font-mono">
                      ID: {s.id} | Slug: {s.slug}
                    </div>
                  </div>
                ) : (
                  <Link
                    to="/study/$subject"
                    params={{ subject: s.slug }}
                    className="tap rounded-3xl border border-border gradient-card p-4 shadow-soft flex flex-col h-full"
                  >
                    {/* Subject Icon Badge - Matches DiaryItemCard style */}
                    <div
                      className={`shrink-0 size-11 rounded-xl flex items-center justify-center text-xl shadow-[0_2px_8px_-2px_rgba(0,0,0,0.06)] border mb-2 ${meta.bgClass} ${meta.borderClass}`}
                    >
                      <span>{meta.emoji}</span>
                    </div>
                    <p className="text-sm font-bold leading-tight">{lang === "bn" ? s.bn : s.en}</p>
                    <Progress value={s.progress} className="mt-2 h-1.5" />
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {s.progress}% · {s.chapters.length} {t("chapters", "অধ্যায়")}
                    </p>
                  </Link>
                )}
              </div>
            );
          })}
        </div>
        {isEditMode && (
          <button
            type="button"
            onClick={handleAddSubject}
            className="w-full py-4 px-4 rounded-2xl border-2 border-dashed border-primary/50 bg-primary/10 hover:bg-primary/20 text-primary font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            <Plus className="h-5 w-5 text-primary" />
            <span>{t("Add New Subject", "নতুন বিষয় যোগ করুন")}</span>
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