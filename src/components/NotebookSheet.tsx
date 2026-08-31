import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface NotebookSheetProps {
  children: ReactNode;
  className?: string;
  [key: string]: any;
}

/**
 * NotebookSheet Component
 * 
 * Renders a school diary notebook-styled container with:
 * - Decorative punch holes on the left margin
 * - Red vertical margin line
 * - Proper content padding
 * - Notebook-like appearance with rounded corners and soft shadow
 */
export function NotebookSheet({ children, className, ...props }: NotebookSheetProps) {
  return (
    <section
      className={cn(
        "relative rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md shadow-slate-200/50 dark:shadow-none overflow-hidden transition-all",
        className
      )}
      {...props}
    >
      {/* Punch Holes - Left Margin (3 decorative circles) */}
      <div className="pointer-events-none absolute top-0 bottom-0 left-3.5 sm:left-5 flex flex-col justify-around py-6">
        <div className="size-3 sm:size-3.5 rounded-full bg-canvas border border-slate-300/80 dark:border-slate-700 shadow-inner" />
        <div className="size-3 sm:size-3.5 rounded-full bg-canvas border border-slate-300/80 dark:border-slate-700 shadow-inner" />
        <div className="size-3 sm:size-3.5 rounded-full bg-canvas border border-slate-300/80 dark:border-slate-700 shadow-inner" />
      </div>

      {/* Red Margin Line - Vertical line on left */}
      <div className="pointer-events-none absolute top-0 bottom-0 left-6 sm:left-10 w-[2px] bg-rose-400/60 dark:bg-rose-500/40 z-10" />

      {/* Content with proper padding */}
      <div className="pl-9 pr-4 sm:pl-14 sm:pr-8 py-4 sm:py-5">
        {children}
      </div>
    </section>
  );
}
