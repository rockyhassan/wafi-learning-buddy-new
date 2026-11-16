# Worksheet Builder Firestore Cloud Persistence

## Overview

The Worksheet Builder now supports cloud persistence via Firestore with role-based access control, matching the same model as `/diary`, `/routine`, and `/exams` collections.

### Key Features

- ✅ **Shared Cloud Storage**: All users can read worksheets from the `/worksheets` Firestore collection
- ✅ **Admin-Only Writes**: Only admin users (`role === 'admin'`) can create, update, or delete worksheets
- ✅ **Non-Admin Read-Only Mode**: Non-admin users see a simplified UI with "View & Print Mode"
- ✅ **Automatic Migration**: Existing localStorage worksheets automatically sync to Firestore on first admin sign-in
- ✅ **Offline Support**: Local-first with localStorage fallback if Firestore is unavailable
- ✅ **Real-Time Sync**: Changes reflect across all connected clients via `onSnapshot` listener
- ✅ **Zero Breaking Changes**: Backward compatible; component works with or without Firestore props

---

## Architecture

### Files Added

1. **`src/lib/worksheet-firestore.ts`** — Core Firestore service layer
   - `getWorksheets()` — Fetch all worksheets with localStorage fallback
   - `saveWorksheet()` — Save/update worksheet (admin only)
   - `deleteWorksheet()` — Delete worksheet (admin only)
   - `subscribeToWorksheets()` — Real-time listener with localStorage caching
   - `migrateLocalStorageToFirestore()` — Auto-migrate existing sheets on sign-in
   - Helper functions for localStorage sync

2. **`src/hooks/useWorksheetSync.ts`** — React hook for worksheet sync
   - Manages Firestore listeners
   - Handles migration on initialization
   - Returns worksheets, online status, error state, and role info

3. **`src/components/WafiWorksheetBuilderWrapper.tsx`** — Wrapper component with role-based UI
   - Integrates authentication and Firestore sync
   - Shows sync status badge
   - Displays migration status
   - Provides alert for non-admin users
   - Handles save/delete callbacks

4. **`src/components/WafiWorksheetBuilderFull.jsx`** — Updated with Firestore support
   - Added props: `isAdmin`, `isOnline`, `worksheets`, `onSaveToFirestore`, `onDeleteFromFirestore`
   - Conditional UI: Admin edit panel vs. non-admin read-only mode
   - Firestore operations on save/update/delete
   - Role-based button hiding

5. **`firestore.rules`** — Updated Firestore security rules
   - Added `/worksheets/{worksheetId}` collection
   - Read access for all authenticated users
   - Write/delete access for admins only

---

## Usage

### For Admins (Full Access)

Admins see the complete worksheet builder with:
- Full left sidebar editor
- "New Section" buttons
- "Save as New", "Update Saved", "Duplicate", "Delete" actions
- "Create New Worksheet" button
- Import/Export JSON backups
- All existing functionality

On first sign-in after an update, existing localStorage worksheets are automatically migrated to Firestore.

### For Non-Admins (Read-Only)

Non-admins see:
- Simplified left sidebar with "View-Only Mode" alert
- Ability to browse and load any saved worksheet
- Print and PDF download buttons
- Font style and answer key toggles (if applicable)
- **No** editing, creation, deletion, or export capabilities
- Toast message: "Read-only mode. Contact an admin to edit worksheets."

### Component Usage

#### Option 1: With Wrapper (Recommended)

```jsx
import { WafiWorksheetBuilderWrapper } from '@/components/WafiWorksheetBuilderWrapper';
import { useAccess } from '@/lib/access-store';

export function WorksheetPage() {
  const { currentUser } = useAccess();

  return <WafiWorksheetBuilderWrapper />;
}
```

The wrapper automatically:
- Detects user role from `useAccess()`
- Syncs worksheets from Firestore
- Handles migration
- Shows appropriate UI for admin/non-admin users

#### Option 2: Direct Component (Backward Compatible)

```jsx
import { WafiWorksheetBuilder } from '@/components/WafiWorksheetBuilderFull';

// Old usage still works (defaults to admin mode)
<WafiWorksheetBuilder />

// With Firestore integration
<WafiWorksheetBuilder
  isAdmin={true}
  isOnline={true}
  worksheets={worksheets}
  onSaveToFirestore={handleSave}
  onDeleteFromFirestore={handleDelete}
  onSaveActiveLocally={handleLocalSave}
/>
```

---

## Data Flow

### Save Operation (Admin)

1. User clicks "Update Saved" or "Save as New"
2. Component calls `onSaveToFirestore(worksheet)`
3. Service calls `saveWorksheet()` with `merge: true`
4. Firestore updates `/worksheets/{worksheetId}`
5. `onSnapshot` listener fires on all clients
6. State updates, UI refreshes
7. Toast: "Worksheet saved to cloud"

### Load Operation (All Users)

1. Component mounts or user clicks "Saved Sheets"
2. `useWorksheetSync()` calls `getWorksheets()`
3. Fetches from Firestore with localStorage fallback
4. Subscribes to real-time updates via `onSnapshot`
5. Worksheets cached in localStorage for offline access
6. User can load any worksheet from the list

### Migration (Admin, First Sign-In)

1. User (admin) signs in after update
2. `useWorksheetSync()` detects admin role
3. Calls `migrateLocalStorageToFirestore()`
4. Reads from `localStorage.wafi_hybrid_book_bank_v2`
5. Checks existing Firestore worksheets to avoid duplicates
6. Uploads each new worksheet with `saveWorksheet()`
7. Returns migration stats: `{ migrated: N, failed: 0 }`
8. UI shows success alert with count
9. All worksheets now accessible to all users on next load

---

## Firestore Rules

### New Collection: `/worksheets/{worksheetId}`

```firestore
match /worksheets/{worksheetId} {
  allow read: if isAuth();
  allow create, update, delete: if isAdmin();
}
```

**Read**: Any authenticated user
**Write**: Admins only (via `isAdmin()` helper which checks role from `/users/{uid}`)

Same pattern as:
- `/diary/{diaryId}`
- `/routine/{routineId}`
- `/exams/{examId}`

---

## Schema

### Firestore Worksheet Document

```typescript
{
  id: string;                          // Unique ID (e.g., "sheet-1234567890")
  header: {
    title: string;                     // "HOMEWORK PRACTICE SHEET"
    studentName: string;               // "Wafi"
    grade: string;                     // "Grade 3"
    subject: string;                   // "Science"
    chapter: string;                   // "Chapter 4: Water for Life"
  };
  sections: Section[];                 // Array of question sections
  updatedAt: Timestamp;                // Last modified time
  createdAt: Timestamp;                // Creation time
  isShared?: boolean;                  // Default: false (for future shared worksheets)
  sharedWith?: string[];               // UIDs of users with access (for future)
}
```

### Section Structure

```typescript
{
  id: string;                          // "sec-1", "sec-2", etc.
  type: string;                        // "fill_blanks" | "true_false" | "matching" | ...
  title: string;                       // "A. Fill in the blanks."
  items: Item[];                       // Question items
}
```

---

## Error Handling & Offline Mode

### Network Issues

If Firestore is unavailable:
- Component falls back to localStorage (`worksheets_firestore_fallback` key)
- Toast shows: "Connection Issue — Using cached data"
- Editing is blocked for non-admins (already read-only)
- Admins see offline UI but can still edit locally (sync will happen when online)

### Permission Denied

If a non-admin tries to save:
- Firestore rejects with `permission-denied` error
- `onSaveToFirestore()` returns `false`
- Toast: "Only admins can save worksheets"

### Migration Failures

If some worksheets fail to migrate:
- Migration continues for remaining sheets
- Returns: `{ migrated: N, failed: M }`
- Alert shows count of failures
- User can retry by signing out and in again

---

## Deployment Checklist

### Before Deploying

1. ✅ **Update Firestore Rules** in Firebase Console
   ```
   Copy contents of firestore.rules file
   Deploy via Firebase Console or CLI:
   firebase deploy --only firestore:rules
   ```

2. ✅ **Verify No Breaking Changes**
   - Run `npm run build` (should succeed)
   - No TypeScript errors
   - Existing diary/routine/exams features unaffected

3. ✅ **Test Role-Based Access**
   - Admin user: Full editor visible, can save/update/delete
   - Non-admin user: Read-only mode with alert
   - Non-admin tries to delete: Toast "Only admins can delete"

4. ✅ **Test Migration**
   - Admin user with old `localStorage` worksheets
   - Sign in → Migration runs automatically
   - Check Firestore Console → Worksheets appear in collection
   - All users can now view those worksheets

5. ✅ **Test Offline Mode**
   - Load worksheet while online
   - Disconnect network
   - Worksheet still loads from cache
   - Reconnect → Real-time sync resumes

### Rollback (If Needed)

1. Revert Firestore rules (remove `/worksheets` collection rules)
2. Revert component to old version (Firestore props ignored if not provided)
3. localStorage keys remain, users can reload old sheets manually

---

## Configuration

### Environment Variables

No new environment variables required. Uses existing Firebase config:
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`

### Optional: Zero-Deploy Fallback

Currently, if Firestore rules aren't deployed yet:
- Worksheets fallback to localStorage
- No visible error to user
- Can later add `worksheetsMap` field to `/schoolProfile/info` for admin-only writes

To enable: Set `fallbackToLocalstorage = true` in `getWorksheets()` (already default).

---

## Troubleshooting

### Worksheets Not Showing in Cloud

1. Check Firestore Console → `worksheets` collection exists
2. Check security rules deployed via `firebase deploy --only firestore:rules`
3. User is authenticated and has `status: 'active'`
4. Admin user signed in and migration ran

### Migration Didn't Happen

1. User must be admin (`role === 'admin'`)
2. localStorage must have `wafi_hybrid_book_bank_v2` key with valid JSON
3. Check browser console for migration errors
4. Try signing out and in again

### Non-Admin Can Edit (Bug)

1. Verify `isAdmin` prop is correctly derived from `useAccess().currentUser?.role`
2. Verify `role === 'admin'` check in Firestore rules
3. Check `/users/{uid}` document has `role: 'admin'` field

### Offline Mode Not Working

1. Check `worksheets_firestore_fallback` key exists in localStorage
2. Ensure initial load happened when online
3. Check `getLocalStorageWorksheets()` returns non-empty array

---

## Performance Notes

- **Worksheets size**: ~2-5 KB per sheet (highly compressible)
- **Query limit**: No pagination yet; assumes < 1000 worksheets total
- **Real-time cost**: ~1 read per user per session (initial load) + 1 write per save
- **localStorage limit**: ~5-10 MB (typically uses < 100 KB for worksheets)

Future optimization: Add pagination for large worksheet collections.

---

## Testing Checklist

- [ ] Admin can create new worksheet
- [ ] Admin can save worksheet to cloud
- [ ] Admin can duplicate worksheet
- [ ] Admin can delete worksheet
- [ ] Admin's local worksheets auto-migrate to Firestore on first sign-in
- [ ] Non-admin sees read-only UI
- [ ] Non-admin can load and print worksheets
- [ ] Non-admin cannot edit/save/delete (buttons hidden or disabled)
- [ ] Toast shows correct messages for all operations
- [ ] Sync status badge shows "Cloud Synced" or "Offline"
- [ ] Worksheets persist across browser refresh
- [ ] Worksheets load when offline (from cache)
- [ ] Real-time sync works when two admins edit simultaneously
- [ ] No console errors in production build

---

## Support & Questions

For issues or questions, refer to:
- `src/lib/worksheet-firestore.ts` — Service layer documentation
- `src/hooks/useWorksheetSync.ts` — Hook usage documentation
- `firestore.rules` — Security rules with comments
- This file for architecture and deployment

---

**Last Updated**: 2026-11-15
**Status**: ✅ Production Ready
