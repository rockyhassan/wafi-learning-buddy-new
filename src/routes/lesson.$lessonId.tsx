import { createFileRoute } from "@tanstack/react-router";
import { Play, Volume2, Pencil, X, Check } from "lucide-react";
import { PageShell, Pill, SectionCard } from "@/components/app-shell";
import { useApp } from "@/lib/app-state";
import { getLessonContent, type LessonDetail } from "@/lib/curriculum-data";
import { saveEditedLesson, resetLessonToDefault, isLessonEdited } from "@/lib/lesson-storage";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/lesson/$lessonId")({
  head: () => ({
    meta: [
      { title: "Lesson — Wafi" },
      {
        name: "description",
        content: "Lesson text, Bangla explanation, easy English, vocabulary, pronunciation and parent tips.",
      },
      { property: "og:title", content: "Lesson — Wafi" },
      { property: "og:description", content: "Read, listen and understand each lesson step by step." },
    ],
  }),
  component: LessonPage,
});

function LessonPage() {
  const { lessonId } = Route.useParams();
  const { t, lang } = useApp();
  const [subject, chapter, lesson] = lessonId.split("-");
  const lessonData = getLessonContent(lessonId);
  
  // Edit mode state
  const [editMode, setEditMode] = useState(false);
  const [editedContent, setEditedContent] = useState<LessonDetail>(lessonData);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Sync edited content when lesson data changes (e.g., language toggle)
  useEffect(() => {
    if (!editMode) {
      setEditedContent(lessonData);
    }
  }, [lessonData, editMode]);

  // Track unsaved changes
  useEffect(() => {
    const hasChanges = JSON.stringify(editedContent) !== JSON.stringify(lessonData);
    setHasUnsavedChanges(hasChanges);
  }, [editedContent, lessonData]);

  const handleSave = () => {
    saveEditedLesson(lessonId, editedContent);
    setEditMode(false);
    setHasUnsavedChanges(false);
  };

  const handleCancel = () => {
    setEditedContent(lessonData);
    setEditMode(false);
    setHasUnsavedChanges(false);
  };

  const handleReset = () => {
    resetLessonToDefault(lessonId);
    setEditedContent(getLessonContent(lessonId));
    setHasUnsavedChanges(false);
  };

  // Edit toggle button for header
  const editButton = (
    <button
      type="button"
      onClick={() => setEditMode(!editMode)}
      className={`tap inline-flex size-8 sm:size-9 items-center justify-center rounded-full border ${
        editMode 
          ? "bg-primary text-primary-foreground border-primary" 
          : "border-border bg-card text-foreground"
      } shadow-soft transition-colors hover:bg-accent/40`}
      aria-label={editMode ? "Exit edit mode" : "Enter edit mode"}
      title={editMode ? "Exit edit mode" : "Edit lesson"}
    >
      {editMode ? <X className="size-3.5 sm:size-4" /> : <Pencil className="size-3.5 sm:size-4" />}
    </button>
  );

  return (
    <PageShell
      title={t(lessonData.title.en, lessonData.title.bn)}
      subtitle={`${subject} · ${t("Chapter", "অধ্যায়")} ${chapter} · ${t("Lesson", "লেসন")} ${lesson}`}
      back="/study"
      action={editButton}
      hideNav={editMode}
    >
      <SectionCard className="gradient-card">
        <div className="flex flex-wrap gap-2">
          <Pill tone="primary">📖 {t("Text", "পাঠ")}</Pill>
          <Pill tone="accent">🎬 {t("Video", "ভিডিও")}</Pill>
          <Pill tone="success">🗣️ {t("Read Aloud", "পড়ে শোনাও")}</Pill>
        </div>
      </SectionCard>

      <SectionCard title={t("Lesson Text", "পাঠ")}>
        {editMode ? (
          <textarea
            value={lang === "bn" && editedContent.lessonText.bn ? editedContent.lessonText.bn : editedContent.lessonText.en}
            onChange={(e) => {
              const field = lang === "bn" ? "bn" : "en";
              setEditedContent({
                ...editedContent,
                lessonText: { ...editedContent.lessonText, [field]: e.target.value }
              });
            }}
            className="w-full text-sm leading-relaxed bg-background border border-border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none min-h-[100px]"
            rows={6}
          />
        ) : (
          <p className="text-sm leading-relaxed">
            {lang === "bn" && lessonData.lessonText.bn
              ? lessonData.lessonText.bn
              : lessonData.lessonText.en}
          </p>
        )}
      </SectionCard>

      <SectionCard title={t("Bangla Explanation", "বাংলা ব্যাখ্যা")}>
        {editMode ? (
          <textarea
            value={editedContent.banglaExplanation}
            onChange={(e) => setEditedContent({ ...editedContent, banglaExplanation: e.target.value })}
            className="w-full text-sm leading-relaxed bg-background border border-border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none min-h-[100px]"
            rows={4}
          />
        ) : (
          <p className="text-sm leading-relaxed">{lessonData.banglaExplanation}</p>
        )}
      </SectionCard>

      <SectionCard title={t("Easy English", "সহজ ইংরেজি")}>
        {editMode ? (
          <textarea
            value={editedContent.easyEnglish}
            onChange={(e) => setEditedContent({ ...editedContent, easyEnglish: e.target.value })}
            className="w-full text-sm leading-relaxed bg-background border border-border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none min-h-[80px]"
            rows={3}
          />
        ) : (
          <p className="text-sm leading-relaxed">{lessonData.easyEnglish}</p>
        )}
      </SectionCard>

      <SectionCard title={t("Pronunciation", "উচ্চারণ")}>
        {editMode ? (
          <div className="space-y-2">
            {editedContent.pronunciation.map((p, index) => (
              <div key={index} className="flex items-center gap-2 rounded-2xl bg-muted px-3 py-2">
                <button className="tap grid size-8 place-items-center rounded-full bg-primary text-primary-foreground">
                  <Volume2 className="size-4" />
                </button>
                <input
                  type="text"
                  value={p.word}
                  onChange={(e) => {
                    const newPronunciation = [...editedContent.pronunciation];
                    newPronunciation[index] = { ...p, word: e.target.value };
                    setEditedContent({ ...editedContent, pronunciation: newPronunciation });
                  }}
                  className="flex-1 text-sm font-semibold bg-background border border-border rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary/40"
                  placeholder="Word"
                />
                <input
                  type="text"
                  value={p.ipa}
                  onChange={(e) => {
                    const newPronunciation = [...editedContent.pronunciation];
                    newPronunciation[index] = { ...p, ipa: e.target.value };
                    setEditedContent({ ...editedContent, pronunciation: newPronunciation });
                  }}
                  className="w-24 text-xs bg-background border border-border rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary/40"
                  placeholder="IPA"
                />
                <button
                  type="button"
                  onClick={() => {
                    const newPronunciation = editedContent.pronunciation.filter((_, i) => i !== index);
                    setEditedContent({ ...editedContent, pronunciation: newPronunciation });
                  }}
                  className="tap text-muted-foreground hover:text-destructive transition-colors"
                  aria-label="Remove pronunciation"
                >
                  <X className="size-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                setEditedContent({
                  ...editedContent,
                  pronunciation: [...editedContent.pronunciation, { word: "", ipa: "" }]
                });
              }}
              className="tap w-full rounded-2xl border-2 border-dashed border-border bg-muted/50 py-2 text-sm font-semibold text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors"
            >
              + Add Pronunciation
            </button>
          </div>
        ) : (
          <ul className="space-y-2">
            {lessonData.pronunciation.map((p) => (
              <li key={p.word} className="flex items-center gap-3 rounded-2xl bg-muted px-3 py-2">
                <button className="tap grid size-8 place-items-center rounded-full bg-primary text-primary-foreground">
                  <Volume2 className="size-4" />
                </button>
                <span className="flex-1 text-sm font-semibold">{p.word}</span>
                <span className="text-xs text-muted-foreground">{p.ipa}</span>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      {(lessonData.vocabulary && lessonData.vocabulary.length > 0) || editMode ? (
        <SectionCard title={t("Vocabulary", "শব্দার্থ")}>
          {editMode ? (
            <div className="space-y-1.5 text-sm">
              {editedContent.vocabulary?.map((v, index) => (
                <div key={index} className="flex justify-between gap-2 border-b border-border pb-1.5 last:border-0">
                  <input
                    type="text"
                    value={v.word}
                    onChange={(e) => {
                      const newVocab = [...(editedContent.vocabulary || [])];
                      newVocab[index] = { ...v, word: e.target.value };
                      setEditedContent({ ...editedContent, vocabulary: newVocab });
                    }}
                    className="flex-1 font-semibold bg-background border border-border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary/40"
                    placeholder="Word"
                  />
                  <input
                    type="text"
                    value={v.meaning}
                    onChange={(e) => {
                      const newVocab = [...(editedContent.vocabulary || [])];
                      newVocab[index] = { ...v, meaning: e.target.value };
                      setEditedContent({ ...editedContent, vocabulary: newVocab });
                    }}
                    className="flex-1 text-muted-foreground bg-background border border-border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary/40"
                    placeholder="Meaning"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newVocab = (editedContent.vocabulary || []).filter((_, i) => i !== index);
                      setEditedContent({ ...editedContent, vocabulary: newVocab });
                    }}
                    className="tap text-muted-foreground hover:text-destructive transition-colors"
                    aria-label="Remove vocabulary"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  setEditedContent({
                    ...editedContent,
                    vocabulary: [...(editedContent.vocabulary || []), { word: "", meaning: "" }]
                  });
                }}
                className="tap w-full rounded-lg border-2 border-dashed border-border bg-muted/50 py-2 text-sm font-semibold text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors"
              >
                + Add Vocabulary
              </button>
            </div>
          ) : (
            <ul className="space-y-1.5 text-sm">
              {lessonData.vocabulary?.map((v) => (
                <li key={v.word} className="flex justify-between gap-3 border-b border-border pb-1.5 last:border-0">
                  <span className="font-semibold">{v.word}</span>
                  <span className="text-muted-foreground">{v.meaning}</span>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      ) : null}

      <SectionCard title={t("Video / Animation", "ভিডিও / অ্যানিমেশন")}>
        <button className="tap flex aspect-video w-full items-center justify-center rounded-2xl gradient-hero text-primary-foreground">
          <Play className="size-8" />
        </button>
      </SectionCard>

      {(lessonData.importantNotes && lessonData.importantNotes.length > 0) || editMode ? (
        <SectionCard title={t("Important Notes", "গুরুত্বপূর্ণ নোট")}>
          {editMode ? (
            <div className="space-y-1 text-sm">
              {editedContent.importantNotes?.map((note, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="mt-1.5 text-muted-foreground">•</span>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => {
                      const newNotes = [...(editedContent.importantNotes || [])];
                      newNotes[index] = e.target.value;
                      setEditedContent({ ...editedContent, importantNotes: newNotes });
                    }}
                    className="flex-1 bg-background border border-border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary/40"
                    placeholder="Important note"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newNotes = (editedContent.importantNotes || []).filter((_, i) => i !== index);
                      setEditedContent({ ...editedContent, importantNotes: newNotes });
                    }}
                    className="tap text-muted-foreground hover:text-destructive transition-colors"
                    aria-label="Remove note"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  setEditedContent({
                    ...editedContent,
                    importantNotes: [...(editedContent.importantNotes || []), ""]
                  });
                }}
                className="tap w-full rounded-lg border-2 border-dashed border-border bg-muted/50 py-2 text-sm font-semibold text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors"
              >
                + Add Note
              </button>
            </div>
          ) : (
            <ul className="list-disc space-y-1 pl-5 text-sm">
              {lessonData.importantNotes?.map((note, index) => (
                <li key={index}>{note}</li>
              ))}
            </ul>
          )}
        </SectionCard>
      ) : null}

      <SectionCard title={t("Common Mistakes", "সাধারণ ভুল")}>
        <ul className="space-y-2 text-sm">
          <li className="rounded-2xl bg-destructive/10 px-3 py-2">
            ❌ He go to school → ✅ He <strong>goes</strong> to school
          </li>
          <li className="rounded-2xl bg-destructive/10 px-3 py-2">
            ❌ She don't like → ✅ She <strong>doesn't</strong> like
          </li>
        </ul>
      </SectionCard>

      <SectionCard title={t("Teacher Notes", "শিক্ষকের নোট")}>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {t(
            "Ms. Nabila: practise 10 sentences aloud before the class test.",
            "মিস নাবিলা: ক্লাস টেস্টের আগে ১০টি বাক্য মুখে বলে অনুশীলন করবে।",
          )}
        </p>
      </SectionCard>

      <SectionCard title={t("Parent Tips", "অভিভাবকের টিপস")} className="border-accent/40 bg-accent/10">
        <p className="text-sm leading-relaxed">
          {t(
            "Ask your child to describe their daily routine in 5 sentences. Correct only the -s ending.",
            "সন্তানকে ৫টি বাক্যে তার দৈনন্দিন রুটিন বলতে বলুন। শুধু -s যুক্ত হওয়ার ভুলটা ঠিক করে দিন।",
          )}
        </p>
      </SectionCard>

      {/* Edit Mode Actions */}
      {editMode && (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-sm pb-[env(safe-area-inset-bottom)]">
          <div className="mx-auto max-w-[800px] px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {isLessonEdited(lessonId) && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="tap px-4 py-2 rounded-xl border border-border bg-muted text-sm font-semibold text-foreground hover:bg-muted/80 transition-colors"
                  >
                    Reset to Default
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="tap px-4 py-2 rounded-xl border border-border bg-card text-sm font-semibold text-foreground hover:bg-muted/80 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!hasUnsavedChanges}
                  className="tap px-4 py-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  <Check className="size-4" />
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}
