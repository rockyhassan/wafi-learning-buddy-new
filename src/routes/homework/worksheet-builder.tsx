import { createFileRoute, useNavigate } from '@tanstack/react-router';
import React, { useRef } from 'react';
import { ArrowLeft } from 'lucide-react';

// Import the complete, unmodified original worksheet builder component
// This is the full 122KB implementation with 100% feature parity
const WafiWorksheetBuilderFull = React.lazy(() =>
  import('../../components/WafiWorksheetBuilderFull').then((mod) => ({
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
        content: 'Complete worksheet builder with PDF export and answer keys',
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
      {/* Back Button Bar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 bg-white shadow-sm">
        <button
          onClick={() => navigate({ to: '/homework' })}
          className="inline-flex items-center justify-center rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 transition-colors"
          title="Go back to homework"
          aria-label="Back to homework"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold text-slate-900">Worksheet Builder</h1>
      </div>

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
          <WafiWorksheetBuilderFull />
        </React.Suspense>
      </div>
    </div>
  );
}
