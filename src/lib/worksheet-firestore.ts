/**
 * Firestore Worksheet Cloud Persistence Service
 * 
 * Provides shared cloud storage for worksheets with admin-only write access.
 * Non-admin users have read-only access.
 * Implements zero-deploy fallback to localStorage if Firestore is unavailable.
 */

import { db } from './firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  Timestamp,
  FirebaseError,
} from 'firebase/firestore';

export interface WorksheetHeader {
  title: string;
  studentName: string;
  grade: string;
  subject: string;
  chapter: string;
}

export interface WorksheetItem {
  id: string;
  prompt?: string;
  answer?: string;
  lines?: number;
  boxHeight?: number;
  left?: string;
  right?: string;
  word?: string;
  meaning?: string;
  [key: string]: any;
}

export interface WorksheetSection {
  id: string;
  type: string;
  title: string;
  items: WorksheetItem[];
}

export interface Worksheet {
  id: string;
  header: WorksheetHeader;
  sections: WorksheetSection[];
  updatedAt: string;
  createdAt?: string;
  isShared?: boolean;
  sharedWith?: string[];
}

export interface FirestoreWorksheet extends Worksheet {
  id: string;
  updatedAt: Timestamp | string;
  createdAt?: Timestamp | string;
}

// Storage keys for localStorage fallback
const STORAGE_KEY_BANK = 'wafi_hybrid_book_bank_v2';
const STORAGE_KEY_ACTIVE = 'wafi_hybrid_active_sheet_v2';
const FALLBACK_STORAGE_KEY = 'worksheets_firestore_fallback';

/**
 * Check if a user is an admin
 */
export function isUserAdmin(userRole?: string): boolean {
  return userRole === 'admin';
}

/**
 * Get all worksheets from Firestore
 * Falls back to localStorage if Firestore is unavailable
 */
export async function getWorksheets(fallbackToLocalstorage = true): Promise<Worksheet[]> {
  try {
    const worksheetsRef = collection(db, 'worksheets');
    const snapshot = await getDocs(query(worksheetsRef));

    return snapshot.docs.map((doc) => {
      const data = doc.data() as FirestoreWorksheet;
      return {
        ...data,
        id: doc.id,
        updatedAt:
          data.updatedAt instanceof Timestamp
            ? data.updatedAt.toISOString()
            : data.updatedAt,
        createdAt:
          data.createdAt instanceof Timestamp
            ? data.createdAt.toISOString()
            : data.createdAt,
      };
    });
  } catch (error) {
    console.warn('[WORKSHEET_FIRESTORE] Failed to fetch worksheets from Firestore:', error);

    if (fallbackToLocalstorage && typeof window !== 'undefined') {
      try {
        const fallback = localStorage.getItem(FALLBACK_STORAGE_KEY);
        if (fallback) {
          const parsed = JSON.parse(fallback);
          console.log('[WORKSHEET_FIRESTORE] Using localStorage fallback:', parsed.length, 'worksheets');
          return parsed;
        }
      } catch (e) {
        console.warn('[WORKSHEET_FIRESTORE] Failed to read fallback from localStorage:', e);
      }
    }

    return [];
  }
}

/**
 * Get a single worksheet by ID
 */
export async function getWorksheetById(worksheetId: string): Promise<Worksheet | null> {
  try {
    const docRef = doc(db, 'worksheets', worksheetId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data() as FirestoreWorksheet;
      return {
        ...data,
        id: docSnap.id,
        updatedAt:
          data.updatedAt instanceof Timestamp
            ? data.updatedAt.toISOString()
            : data.updatedAt,
        createdAt:
          data.createdAt instanceof Timestamp
            ? data.createdAt.toISOString()
            : data.createdAt,
      };
    }

    return null;
  } catch (error) {
    console.warn('[WORKSHEET_FIRESTORE] Failed to fetch worksheet:', error);
    return null;
  }
}

/**
 * Save/update a worksheet to Firestore (admin only)
 * Uses merge: true to prevent overwrites of unrelated fields
 */
export async function saveWorksheet(worksheet: Worksheet): Promise<boolean> {
  try {
    const docRef = doc(db, 'worksheets', worksheet.id);
    await setDoc(
      docRef,
      {
        ...worksheet,
        updatedAt: Timestamp.now(),
        createdAt: worksheet.createdAt ? Timestamp.fromDate(new Date(worksheet.createdAt)) : Timestamp.now(),
      },
      { merge: true }
    );

    console.log('[WORKSHEET_FIRESTORE] Worksheet saved:', worksheet.id);
    return true;
  } catch (error: any) {
    if (error.code === 'permission-denied') {
      console.warn('[WORKSHEET_FIRESTORE] Permission denied. User is not an admin.');
      return false;
    }
    console.error('[WORKSHEET_FIRESTORE] Failed to save worksheet:', error);
    return false;
  }
}

/**
 * Delete a worksheet from Firestore (admin only)
 */
export async function deleteWorksheet(worksheetId: string): Promise<boolean> {
  try {
    const docRef = doc(db, 'worksheets', worksheetId);
    await deleteDoc(docRef);

    console.log('[WORKSHEET_FIRESTORE] Worksheet deleted:', worksheetId);
    return true;
  } catch (error: any) {
    if (error.code === 'permission-denied') {
      console.warn('[WORKSHEET_FIRESTORE] Permission denied. User is not an admin.');
      return false;
    }
    console.error('[WORKSHEET_FIRESTORE] Failed to delete worksheet:', error);
    return false;
  }
}

/**
 * Subscribe to worksheet changes in real-time
 * Automatically maintains localStorage fallback for offline access
 */
export function subscribeToWorksheets(
  onUpdate: (worksheets: Worksheet[]) => void,
  onError?: (error: Error) => void
): () => void {
  try {
    const worksheetsRef = collection(db, 'worksheets');

    const unsubscribe = onSnapshot(
      query(worksheetsRef),
      (snapshot) => {
        const worksheets = snapshot.docs.map((doc) => {
          const data = doc.data() as FirestoreWorksheet;
          return {
            ...data,
            id: doc.id,
            updatedAt:
              data.updatedAt instanceof Timestamp
                ? data.updatedAt.toISOString()
                : data.updatedAt,
            createdAt:
              data.createdAt instanceof Timestamp
                ? data.createdAt.toISOString()
                : data.createdAt,
          };
        });

        // Cache to localStorage for offline fallback
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(FALLBACK_STORAGE_KEY, JSON.stringify(worksheets));
          } catch (e) {
            console.warn('[WORKSHEET_FIRESTORE] Failed to cache to localStorage:', e);
          }
        }

        onUpdate(worksheets);
      },
      (error) => {
        console.error('[WORKSHEET_FIRESTORE] Snapshot listener error:', error);
        if (onError) {
          onError(error as Error);
        }
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error('[WORKSHEET_FIRESTORE] Failed to subscribe:', error);
    if (onError) {
      onError(error as Error);
    }
    return () => {};
  }
}

/**
 * Migrate worksheets from localStorage to Firestore (admin only)
 * Automatically called on first sign-in
 */
export async function migrateLocalStorageToFirestore(): Promise<{
  success: boolean;
  migrated: number;
  failed: number;
}> {
  const stats = { success: true, migrated: 0, failed: 0 };

  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return stats;
    }

    // Get locally saved worksheets
    const savedData = localStorage.getItem(STORAGE_KEY_BANK);
    if (!savedData) {
      return stats;
    }

    let worksheets: Worksheet[] = [];
    try {
      const parsed = JSON.parse(savedData);
      worksheets = Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.warn('[WORKSHEET_FIRESTORE] Failed to parse localStorage data:', e);
      return stats;
    }

    // Get existing Firestore worksheets to avoid duplicates
    const existingWorksheets = await getWorksheets(false);
    const existingIds = new Set(existingWorksheets.map((w) => w.id));

    // Migrate each worksheet
    for (const worksheet of worksheets) {
      // Skip if already in Firestore
      if (existingIds.has(worksheet.id)) {
        console.log('[WORKSHEET_FIRESTORE] Worksheet already in Firestore, skipping:', worksheet.id);
        continue;
      }

      try {
        const success = await saveWorksheet(worksheet);
        if (success) {
          stats.migrated++;
        } else {
          stats.failed++;
        }
      } catch (error) {
        console.error('[WORKSHEET_FIRESTORE] Migration error for worksheet:', worksheet.id, error);
        stats.failed++;
      }
    }

    console.log(
      '[WORKSHEET_FIRESTORE] Migration complete. Migrated:',
      stats.migrated,
      'Failed:',
      stats.failed
    );
    return stats;
  } catch (error) {
    console.error('[WORKSHEET_FIRESTORE] Migration failed:', error);
    stats.success = false;
    return stats;
  }
}

/**
 * Get localStorage fallback worksheets (for offline mode)
 */
export function getLocalStorageWorksheets(): Worksheet[] {
  if (typeof window === 'undefined') return [];

  try {
    // Try fallback first (from Firestore sync)
    const fallback = localStorage.getItem(FALLBACK_STORAGE_KEY);
    if (fallback) {
      return JSON.parse(fallback);
    }

    // Fall back to old localStorage keys
    const saved = localStorage.getItem(STORAGE_KEY_BANK);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn('[WORKSHEET_FIRESTORE] Failed to read localStorage:', e);
  }

  return [];
}

/**
 * Save active worksheet to localStorage (local-first, never synced to Firestore)
 */
export function saveActiveWorksheetLocally(worksheet: Worksheet): void {
  if (typeof window === 'undefined' || !window.localStorage) return;

  try {
    localStorage.setItem(STORAGE_KEY_ACTIVE, JSON.stringify(worksheet));
  } catch (e) {
    console.warn('[WORKSHEET_FIRESTORE] Failed to save active worksheet to localStorage:', e);
  }
}

/**
 * Get active worksheet from localStorage
 */
export function getActiveWorksheetLocally(): Worksheet | null {
  if (typeof window === 'undefined' || !window.localStorage) return null;

  try {
    const saved = localStorage.getItem(STORAGE_KEY_ACTIVE);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn('[WORKSHEET_FIRESTORE] Failed to read active worksheet from localStorage:', e);
  }

  return null;
}
