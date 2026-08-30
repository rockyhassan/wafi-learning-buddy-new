import type { LessonDetail } from "./curriculum-data";

const EDITED_LESSONS_KEY = "wafi.editedLessons";

/**
 * Get all edited lessons from localStorage
 */
function getEditedLessons(): Record<string, LessonDetail> {
  try {
    const stored = window.localStorage.getItem(EDITED_LESSONS_KEY);
    if (!stored) return {};
    return JSON.parse(stored);
  } catch (error) {
    console.error("[LESSON STORAGE] Failed to parse edited lessons:", error);
    return {};
  }
}

/**
 * Save an edited lesson to localStorage
 */
export function saveEditedLesson(lessonId: string, content: LessonDetail): void {
  try {
    const edited = getEditedLessons();
    edited[lessonId] = content;
    window.localStorage.setItem(EDITED_LESSONS_KEY, JSON.stringify(edited));
    console.debug(`[LESSON STORAGE] Saved edited lesson: ${lessonId}`);
  } catch (error) {
    console.error("[LESSON STORAGE] Failed to save edited lesson:", error);
  }
}

/**
 * Get an edited lesson from localStorage if it exists
 */
export function getEditedLesson(lessonId: string): LessonDetail | null {
  try {
    const edited = getEditedLessons();
    return edited[lessonId] || null;
  } catch (error) {
    console.error("[LESSON STORAGE] Failed to get edited lesson:", error);
    return null;
  }
}

/**
 * Reset a lesson to its default content by removing it from edited lessons
 */
export function resetLessonToDefault(lessonId: string): void {
  try {
    const edited = getEditedLessons();
    delete edited[lessonId];
    window.localStorage.setItem(EDITED_LESSONS_KEY, JSON.stringify(edited));
    console.debug(`[LESSON STORAGE] Reset lesson to default: ${lessonId}`);
  } catch (error) {
    console.error("[LESSON STORAGE] Failed to reset lesson:", error);
  }
}

/**
 * Check if a lesson has been edited
 */
export function isLessonEdited(lessonId: string): boolean {
  return getEditedLesson(lessonId) !== null;
}
