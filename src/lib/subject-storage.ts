import { type Subject, type Chapter, subjects as defaultSubjects } from "./mock-data";

const STORAGE_KEY = "wafi.editedSubjects";
const MASTER_SUBJECTS_KEY = "wafi.masterSubjects";

export function saveEditedSubject(slug: string, chapters: Chapter[]): void {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const editedSubjects = stored ? JSON.parse(stored) : {};
    editedSubjects[slug] = chapters;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(editedSubjects));
  } catch (error) {
    console.error("Failed to save edited subject:", error);
  }
}

export function getEditedSubject(slug: string): Chapter[] | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const editedSubjects = JSON.parse(stored);
    return editedSubjects[slug] || null;
  } catch (error) {
    console.error("Failed to get edited subject:", error);
    return null;
  }
}

export function resetSubjectToDefault(slug: string): void {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    const editedSubjects = JSON.parse(stored);
    delete editedSubjects[slug];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(editedSubjects));
  } catch (error) {
    console.error("Failed to reset subject:", error);
  }
}

/**
 * Save master subjects list to localStorage
 */
export function saveMasterSubjects(list: Subject[]): void {
  try {
    localStorage.setItem(MASTER_SUBJECTS_KEY, JSON.stringify(list));
  } catch (error) {
    console.error("Failed to save master subjects:", error);
  }
}

/**
 * Get master subjects list from localStorage
 * Returns stored items if present; otherwise returns default 12 subjects from mock data
 */
export function getMasterSubjects(): Subject[] {
  try {
    const stored = localStorage.getItem(MASTER_SUBJECTS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return defaultSubjects;
  } catch (error) {
    console.error("Failed to get master subjects:", error);
    return defaultSubjects;
  }
}

/**
 * Reset master subjects to the default 12 subjects
 */
export function resetMasterSubjects(): void {
  try {
    localStorage.removeItem(MASTER_SUBJECTS_KEY);
  } catch (error) {
    console.error("Failed to reset master subjects:", error);
  }
}
