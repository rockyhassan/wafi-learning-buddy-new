import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell, Pill, SectionCard } from "@/components/app-shell";
import { useApp } from "@/lib/app-state";
import {
  useSchoolContent,
  calculateDaysRemaining,
  formatDaysRemaining,
  type ExamEntry,
} from "@/lib/school-content";
import { getSubjectSlugFromExam, parseChapterNumbers } from "@/lib/subjects";

export const Route = createFileRoute("/exams")({
  head: () => ({
    meta: [
      { title: "All Exams — Wafi" },
      {
        name: "description",
        content: "View all upcoming and past exams with dates, chapters, and countdowns.",
      },
      { property: "og:title", content: "All Exams — Wafi" },
      { property: "og:description", content: "Complete exam schedule with countdowns." },
    ],
  }),
  component: ExamsList,
});

function ExamsList() {
  const { t } = useApp();
  const { exams } = useSchoolContent();

  const safeExams = Array.isArray(exams) ? exams : [];

  // Sort exams by date (upcoming first, then past)
  const sortedExams = [...safeExams].sort((a, b) => {
    if (!a.date && !b.date) return 0;
    if (!a.date) return 1;
    if (!b.date) return -1;
    return a.date.localeCompare(b.date);
  });

  return (
    <PageShell title={t("All Exams", "সব পরীক্ষা")} back="/">
      <SectionCard
        title={t("Exams", "পরীক্ষা")}
        hint={<Pill tone="primary">{sortedExams.length}</Pill>}
      >
        {sortedExams.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t("No exams scheduled.", "কোনো পরীক্ষা নির্ধারিত নেই।")}
          </p>
        ) : (
          <ul className="space-y-3">
            {sortedExams.map((exam) => {
              const daysRemaining = calculateDaysRemaining(exam.date);
              const daysDisplay = formatDaysRemaining(daysRemaining);
              
              // Determine badge color based on exam status
              let badgeTone: "muted" | "primary" | "success" | "warning" | "info" | "destructive" = "primary";
              if (daysRemaining < 0) {
                badgeTone = "muted"; // Past exam
              } else if (daysRemaining === 0) {
                badgeTone = "destructive"; // Today
              } else if (daysRemaining <= 3) {
                badgeTone = "warning"; // Soon
              } else if (daysRemaining <= 7) {
                badgeTone = "info"; // This week
              }

              // Format date with day name
              const formatDateWithDay = (dateStr: string) => {
                try {
                  const parts = dateStr.split("-").map(Number);
                  const [year, month, day] = parts;
                  if (year === undefined || month === undefined || day === undefined) {
                    return dateStr;
                  }
                  const date = new Date(year, month - 1, day);
                  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
                  const dayName = dayNames[date.getDay()];
                  const monthNames = [
                    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
                  ];
                  const monthName = monthNames[date.getMonth()];
                  return `${day} ${monthName} ${year} · ${dayName}`;
                } catch {
                  return dateStr;
                }
              };

              const subjectSlug = getSubjectSlugFromExam(exam.name);
              const chapterNumbers = parseChapterNumbers(exam.chapter);
              
              return (
                <li key={exam.id}>
                  {subjectSlug ? (
                    <Link
                      to="/study/$subject"
                      params={{ subject: subjectSlug }}
                      search={{ exam: "1", chapters: chapterNumbers.join(",") }}
                      className="tap hover:bg-slate-50 transition cursor-pointer block rounded-2xl bg-muted p-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold leading-tight">{exam.name}</p>
                          <p className="mt-1 text-[11px] text-muted-foreground">{exam.chapter}</p>
                          {exam.description && (
                            <p className="mt-1 text-xs text-muted-foreground italic">{exam.description}</p>
                          )}
                          <p className="mt-2 text-xs font-semibold text-muted-foreground">
                            {formatDateWithDay(exam.date)}
                          </p>
                        </div>
                        <Pill tone={badgeTone}>{daysDisplay}</Pill>
                      </div>
                    </Link>
                  ) : (
                    <div className="rounded-2xl bg-muted p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold leading-tight">{exam.name}</p>
                          <p className="mt-1 text-[11px] text-muted-foreground">{exam.chapter}</p>
                          {exam.description && (
                            <p className="mt-1 text-xs text-muted-foreground italic">{exam.description}</p>
                          )}
                          <p className="mt-2 text-xs font-semibold text-muted-foreground">
                            {formatDateWithDay(exam.date)}
                          </p>
                        </div>
                        <Pill tone={badgeTone}>{daysDisplay}</Pill>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </SectionCard>
    </PageShell>
  );
}
