import { createFileRoute, useNavigate } from '@tanstack/react-router';
import React, { useRef } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useAccess } from '@/lib/access-store';

// Import the wrapper component that adds Firestore cloud persistence
const WafiWorksheetBuilderWrapper = React.lazy(() =>
  import('../../components/WafiWorksheetBuilderWrapper').then((mod) => ({
    default: mod.default,
  }))
);

export const Route = createFileRoute('/homework/worksheet-builder')({
  head: () => ({
    meta: [
      { title: 'Worksheet Builder — Wafi Learning Buddy' },
      {
        name: 'description',
        content: 'Create and manage homework practice worksheets with complete exercise support including fill-in-the-blanks, matching, word meanings, MCQ, math boxes, and automatic PDF generation with answer keys.',
      },
      { property: 'og:title', content: 'Worksheet Builder — Wafi Learning Buddy' },
      {
        property: 'og:description',
        content: 'Complete worksheet builder with PDF export, answer keys, and cloud persistence',
      },
    ],
  }),
  component: WorksheetBuilderPage,
});

function WorksheetBuilderPage() {
  const navigate = useNavigate();
  const builderRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={builderRef} className="fixed inset-0 w-screen h-screen z-40 bg-slate-50 flex flex-col overflow-hidden">
      {/* Builder Content */}
      <div className="flex-1 w-full overflow-hidden">
        <React.Suspense
          fallback={
            <div className="fixed inset-0 flex items-center justify-center bg-slate-50">
              <div className="text-center">
                <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600 mx-auto" />
                <p className="text-slate-600 font-medium">Loading Worksheet Builder...</p>
              </div>
            </div>
          }
        >
          <WafiWorksheetBuilderWrapper onBack={() => navigate({ to: '/homework' })} />
        </React.Suspense>
      </div>
    </div>
  );
}
