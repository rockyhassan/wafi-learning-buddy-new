/**
 * Wafi Worksheet Builder Wrapper with Firestore Cloud Persistence
 * 
 * Adds role-based access control and Firestore sync to the worksheet builder:
 * - Admins: Full edit/create/delete access with cloud persistence
 * - Non-admins: Read-only mode with print/download
 * - Automatic localStorage to Firestore migration on first sign-in (admin only)
 * - Real-time sync with offline fallback
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Cloud, CloudOff, Eye } from 'lucide-react';
import { useAccess } from '@/lib/access-store';
import { useWorksheetSync } from '@/hooks/useWorksheetSync';
import {
  saveWorksheet,
  deleteWorksheet,
  saveActiveWorksheetLocally,
  Worksheet,
} from '@/lib/worksheet-firestore';
import { toast } from 'sonner';
import { WafiWorksheetBuilder } from './WafiWorksheetBuilderFull';

export interface WafiWorksheetBuilderWrapperProps {
  // Optional: override the worksheet builder component
  WorksheetComponent?: typeof WafiWorksheetBuilder;
  // Optional: callback to navigate back
  onBack?: () => void;
}

/**
 * Header badge showing sync status and role
 */
function SyncStatusBadge({
  isAdmin,
  isOnline,
  isLoading,
}: {
  isAdmin: boolean;
  isOnline: boolean;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium">
        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
        <span>Syncing...</span>
      </div>
    );
  }

  if (isAdmin) {
    return (
      <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium">
        {isOnline ? (
          <>
            <Cloud className="w-3 h-3" />
            <span>Cloud Synced (Admin)</span>
          </>
        ) : (
          <>
            <CloudOff className="w-3 h-3" />
            <span>Offline (Admin)</span>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-medium">
      <Eye className="w-3 h-3" />
      <span>View & Print Mode</span>
    </div>
  );
}

export function WafiWorksheetBuilderWrapper({
  WorksheetComponent = WafiWorksheetBuilder,
  onBack,
}: WafiWorksheetBuilderWrapperProps) {
  const { currentUser } = useAccess();
  const { worksheets, isLoading, isOnline, error, isAdmin, migrationStats } = useWorksheetSync(
    currentUser?.role
  );

  // State for managing Firestore integration
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Show migration notification once on mount
  useEffect(() => {
    if (migrationStats && (migrationStats.migrated > 0 || migrationStats.failed > 0)) {
      toast.success(
        `${migrationStats.migrated} worksheets synced to cloud${
          migrationStats.failed > 0 ? ` (${migrationStats.failed} failed)` : ''
        }`,
        { duration: 5000 }
      );
    }
  }, []);

  // Callback for saving worksheets to Firestore (admin only)
  const handleSaveToFirestore = useCallback(
    async (worksheet: Worksheet): Promise<boolean> => {
      if (!isAdmin) {
        toast.error('Only admins can save worksheets');
        return false;
      }

      setIsSaving(true);
      try {
        const success = await saveWorksheet(worksheet);
        if (success) {
          setLastSaveTime(new Date());
          toast.success('Worksheet saved to cloud');
          return true;
        } else {
          toast.error('Failed to save worksheet (permission denied)');
          return false;
        }
      } catch (err) {
        toast.error('Error saving worksheet');
        console.error('Save error:', err);
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [isAdmin]
  );

  // Callback for deleting worksheets from Firestore (admin only)
  const handleDeleteFromFirestore = useCallback(
    async (worksheetId: string): Promise<boolean> => {
      if (!isAdmin) {
        toast.error('Only admins can delete worksheets');
        return false;
      }

      try {
        const success = await deleteWorksheet(worksheetId);
        if (success) {
          toast.success('Worksheet deleted');
          return true;
        } else {
          toast.error('Failed to delete worksheet (permission denied)');
          return false;
        }
      } catch (err) {
        toast.error('Error deleting worksheet');
        console.error('Delete error:', err);
        return false;
      }
    },
    [isAdmin]
  );

  // Callback for saving active worksheet locally (non-blocking, for all users)
  const handleSaveActiveLocally = useCallback((worksheet: Worksheet) => {
    saveActiveWorksheetLocally(worksheet);
  }, []);

  // Props for the worksheet builder component
  const wrapperProps = useMemo(
    () => ({
      isAdmin,
      isOnline,
      isLoading: isLoading || isSaving,
      worksheets,
      error,
      lastSaveTime,
      onBack,
      onSaveToFirestore: handleSaveToFirestore,
      onDeleteFromFirestore: handleDeleteFromFirestore,
      onSaveActiveLocally: handleSaveActiveLocally,
    }),
    [isAdmin, isOnline, isLoading, isSaving, worksheets, error, lastSaveTime, onBack, handleSaveToFirestore, handleDeleteFromFirestore, handleSaveActiveLocally]
  );

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">Please sign in to access the worksheet builder.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-background flex flex-col overflow-hidden">
      {/* Worksheet builder component fills full screen */}
      <WorksheetComponent
        {...wrapperProps}
        isAdmin={isAdmin}
        worksheets={worksheets}
        onSaveToFirestore={handleSaveToFirestore}
        onDeleteFromFirestore={handleDeleteFromFirestore}
        onSaveActiveLocally={handleSaveActiveLocally}
      />
    </div>
  );
}

export default WafiWorksheetBuilderWrapper;
