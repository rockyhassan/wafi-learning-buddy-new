/**
 * useWorksheetSync Hook
 * 
 * Manages real-time Firestore synchronization for worksheets.
 * - Admins can create, edit, and delete worksheets
 * - Non-admins can only view worksheets
 * - Automatically migrates localStorage to Firestore on first sign-in
 * - Maintains offline access via localStorage caching
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import {
  subscribeToWorksheets,
  getWorksheets,
  getLocalStorageWorksheets,
  migrateLocalStorageToFirestore,
  isUserAdmin,
  Worksheet,
} from '@/lib/worksheet-firestore';

export interface UseWorksheetSyncReturn {
  worksheets: Worksheet[];
  isLoading: boolean;
  isOnline: boolean;
  error: Error | null;
  isAdmin: boolean;
  migrationStats: { migrated: number; failed: number } | null;
}

export function useWorksheetSync(userRole?: string): UseWorksheetSyncReturn {
  const [worksheets, setWorksheets] = useState<Worksheet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [migrationStats, setMigrationStats] = useState<{ migrated: number; failed: number } | null>(null);
  const isMountedRef = useRef(true);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const isAdmin = isUserAdmin(userRole);

  // Initialize and set up real-time listeners
  useEffect(() => {
    let mounted = true;
    isMountedRef.current = true;

    async function initialize() {
      try {
        setIsLoading(true);
        setError(null);

        // Step 1: Try to get worksheets from Firestore
        const firestoreWorksheets = await getWorksheets(true);

        if (mounted) {
          setWorksheets(firestoreWorksheets);
          setIsOnline(true);
        }

        // Step 2: If admin, migrate localStorage worksheets to Firestore
        if (isAdmin && mounted) {
          const stats = await migrateLocalStorageToFirestore();
          if (mounted) {
            setMigrationStats(stats);
            // Refresh worksheets after migration
            const updated = await getWorksheets(false);
            if (mounted) {
              setWorksheets(updated);
            }
          }
        }

        // Step 3: Set up real-time listener
        if (mounted) {
          unsubscribeRef.current = subscribeToWorksheets(
            (updated) => {
              if (mounted) {
                setWorksheets(updated);
                setIsOnline(true);
              }
            },
            (err) => {
              if (mounted) {
                console.warn('[useWorksheetSync] Real-time listener error:', err);
                setError(err);
                setIsOnline(false);

                // Fall back to localStorage
                const fallback = getLocalStorageWorksheets();
                if (mounted && fallback.length > 0) {
                  setWorksheets(fallback);
                }
              }
            }
          );
        }
      } catch (err) {
        if (mounted) {
          const error = err instanceof Error ? err : new Error(String(err));
          setError(error);
          setIsOnline(false);

          // Fall back to localStorage
          const fallback = getLocalStorageWorksheets();
          if (fallback.length > 0) {
            setWorksheets(fallback);
          }
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    initialize();

    return () => {
      mounted = false;
      isMountedRef.current = false;
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [isAdmin]);

  return {
    worksheets,
    isLoading,
    isOnline,
    error,
    isAdmin,
    migrationStats,
  };
}
