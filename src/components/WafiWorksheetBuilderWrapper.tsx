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
import { Cloud, CloudOff, Eye, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
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

/**
 * Info alert for non-admin users
 */
function ReadOnlyAlert() {
  return (
    <div className="mx-4 mb-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 flex items-start gap-3">
      <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
      <div className="text-sm text-blue-900 dark:text-blue-200">
        <p className="font-semibold">Read-Only Mode</p>
        <p className="text-xs mt-1 opacity-80">
          You can view, print, and download worksheets. Contact an admin to edit.
        </p>
      </div>
    </div>
  );
}

/**
 * Migration status indicator
 */
function MigrationStatus({
  stats,
}: {
  stats: { migrated: number; failed: number } | null;
}) {
  if (!stats) return null;

  if (stats.migrated === 0 && stats.failed === 0) {
    return null;
  }

  return (
    <div className="mx-4 mb-4 p-3 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 flex items-start gap-3">
      <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
      <div className="text-sm text-green-900 dark:text-green-200">
        <p className="font-semibold">
          Worksheets Synced to Cloud ☁️
        </p>
        <p className="text-xs mt-1 opacity-80">
          {stats.migrated} worksheets imported from local storage to Firestore.
          {stats.failed > 0 && ` (${stats.failed} failed)`}
        </p>
      </div>
    </div>
  );
}

/**
 * Error alert for connection issues
 */
function OfflineErrorAlert({ error }: { error: Error | null }) {
  if (!error) return null;

  return (
    <div className="mx-4 mb-4 p-3 rounded-lg bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 flex items-start gap-3">
      <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
      <div className="text-sm text-orange-900 dark:text-orange-200">
        <p className="font-semibold">Connection Issue</p>
        <p className="text-xs mt-1 opacity-80">
          Using cached data. Check your connection or try again later.
        </p>
      </div>
    </div>
  );
}

export function WafiWorksheetBuilderWrapper({
  WorksheetComponent = WafiWorksheetBuilder,
}: WafiWorksheetBuilderWrapperProps) {
  const { currentUser } = useAccess();
  const { worksheets, isLoading, isOnline, error, isAdmin, migrationStats } = useWorksheetSync(
    currentUser?.role
  );

  // State for managing Firestore integration
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);

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
      onSaveToFirestore: handleSaveToFirestore,
      onDeleteFromFirestore: handleDeleteFromFirestore,
      onSaveActiveLocally: handleSaveActiveLocally,
    }),
    [isAdmin, isOnline, isLoading, isSaving, worksheets, error, lastSaveTime, handleSaveToFirestore, handleDeleteFromFirestore, handleSaveActiveLocally]
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
    <div className="min-h-screen bg-background">
      {/* Header with sync status */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border py-3 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <h1 className="text-lg font-semibold">Worksheet Builder</h1>
          <SyncStatusBadge isAdmin={isAdmin} isOnline={isOnline} isLoading={isLoading || isSaving} />
        </div>
      </div>

      {/* Info alerts */}
      <div className="max-w-7xl mx-auto py-4">
        <MigrationStatus stats={migrationStats} />
        <OfflineErrorAlert error={error} />
        {!isAdmin && <ReadOnlyAlert />}
      </div>

      {/* Worksheet builder component */}
      <div className="max-w-7xl mx-auto">
        <WorksheetComponent
          {...wrapperProps}
          isAdmin={isAdmin}
          worksheets={worksheets}
          onSaveToFirestore={handleSaveToFirestore}
          onDeleteFromFirestore={handleDeleteFromFirestore}
          onSaveActiveLocally={handleSaveActiveLocally}
        />
      </div>
    </div>
  );
}

export default WafiWorksheetBuilderWrapper;
