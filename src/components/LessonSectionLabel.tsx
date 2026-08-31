import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface LessonSectionLabelProps {
  emoji: string;
  title: string;
  variant?: "primary" | "emerald" | "amber" | "purple" | "sky" | "indigo";
}

const variantStyles: Record<string, string> = {
  primary: "bg-primary/12 text-primary",
  emerald: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300",
  amber: "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300",
  purple: "bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-300",
  sky: "bg-sky-50 text-sky-700 dark:bg-sky-950/30 dark:text-sky-300",
  indigo: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-300",
};

/**
 * LessonSectionLabel Component
 *
 * Renders a diary-styled pill badge for lesson section titles,
 * matching the Diary card pattern with emoji and colorized variants.
 */
export function LessonSectionLabel({
  emoji,
  title,
  variant = "primary",
}: LessonSectionLabelProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold",
        variantStyles[variant],
      )}
    >
      <span className="text-sm">{emoji}</span>
      {title}
    </span>
  );
}
