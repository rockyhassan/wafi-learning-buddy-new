import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Printer,
  Plus,
  Trash2,
  FolderOpen,
  Save,
  Eye,
  EyeOff,
  CheckCircle2,
  Upload,
  FileText,
  BookMarked,
  ListChecks,
  HelpCircle,
  Table2,
  PenTool,
  Download,
  ClipboardPaste,
  Type,
  Copy,
  X,
  Search,
  Clock,
  Layers,
  Sparkles,
  Cloud,
  CloudOff,
  Lock,
  ArrowLeft,
  CheckSquare
} from 'lucide-react';

// --- Section Types for Textbook Exercises ---
const SECTION_TYPES = [
  { id: 'short_qa', label: 'Short / Broad Q&A', icon: HelpCircle },
  { id: 'fill_blanks', label: 'Fill in the Blanks', icon: PenTool },
  { id: 'true_false', label: 'True / False', icon: CheckCircle2 },
  { id: 'matching', label: 'Match Column A & B', icon: Table2 },
  { id: 'mcq', label: 'Multiple Choice (MCQ)', icon: ListChecks },
  { id: 'word_meaning', label: 'Word Meanings / Sentences', icon: Type },
  { id: 'math_box', label: 'Math / Work Space', icon: FileText },
  { id: 'passage_cloze', label: 'Passage / Cloze', icon: BookMarked },
  { id: 'tick_sentence', label: 'Tick Correct Sentence', icon: CheckSquare }
];

// --- Starter Textbook Chapter (Works 100% Offline) ---
const DEFAULT_WORKSHEET = {
  id: 'default-sci-ch4',
  updatedAt: '2026-11-15T12:00:00.000Z',
  header: {
    title: 'HOMEWORK PRACTICE SHEET',
    studentName: 'Wafi',
    grade: 'Grade 3',
    subject: 'Science',
    chapter: 'Chapter 4: Water for Life (Book Exercise)'
  },
  sections: [
    {
      id: 'sec-1',
      type: 'fill_blanks',
      title: 'A. Fill in the blanks.',
      items: [
        {
          id: 'fb-1',
          prompt: 'Water exists in __________ states in nature.',
          answer: 'three'
        },
        {
          id: 'fb-2',
          prompt: 'Sea water is __________ in taste, so we cannot drink it.',
          answer: 'salty'
        },
        {
          id: 'fb-3',
          prompt: 'The main natural source of fresh water on Earth is __________.',
          answer: 'rain'
        },
        {
          id: 'fb-4',
          prompt: 'When water freezes, it turns into solid __________.',
          answer: 'ice'
        },
        {
          id: 'fb-5',
          prompt: 'We should always boil or filter water before __________.',
          answer: 'drinking'
        }
      ]
    },
    {
      id: 'sec-2',
      type: 'true_false',
      title: 'B. Write True or False.',
      items: [
        {
          id: 'tf-1',
          prompt: 'About three-fourths of the Earth’s surface is covered with water.',
          answer: 'True'
        },
        {
          id: 'tf-2',
          prompt: 'We should leave the water tap open while brushing our teeth.',
          answer: 'False'
        },
        {
          id: 'tf-3',
          prompt: 'Steam is the gaseous form of water.',
          answer: 'True'
        },
        {
          id: 'tf-4',
          prompt: 'Plants do not need water to make their food.',
          answer: 'False'
        }
      ]
    },
    {
      id: 'sec-3',
      type: 'matching',
      title: 'C. Match the items in Column A with Column B.',
      items: [
        { id: 'm-1', left: '1. Ice', right: 'a. Gaseous form of water', answer: '1 - c' },
        { id: 'm-2', left: '2. Water vapour', right: 'b. Main source of fresh water', answer: '2 - a' },
        { id: 'm-3', left: '3. Rain', right: 'c. Solid form of water', answer: '3 - b' },
        { id: 'm-4', left: '4. River and pond', right: 'd. Sources of surface water', answer: '4 - d' }
      ]
    },
    {
      id: 'sec-4',
      type: 'short_qa',
      title: 'D. Answer the following questions in short.',
      items: [
        {
          id: 'qa-1',
          prompt: 'Name the three states of water with one example of each.',
          lines: 3,
          answer: 'The three states of water are solid (ice), liquid (water), and gas (water vapour).'
        },
        {
          id: 'qa-2',
          prompt: 'Write three daily uses of water at home.',
          lines: 3,
          answer: 'We use water for drinking, cooking food, and washing clothes.'
        },
        {
          id: 'qa-3',
          prompt: 'Why is sea water not suitable for drinking?',
          lines: 3,
          answer: 'Sea water contains a lot of dissolved salt, which makes it salty and unfit for drinking.'
        }
      ]
    }
  ]
};

const STORAGE_KEY_BANK = 'wafi_hybrid_book_bank_v2';
const STORAGE_KEY_ACTIVE = 'wafi_hybrid_active_sheet_v2';

// --- Estimate vertical height (in mm) per block so content flows across A4 pages ---
const A4_CONTENT_BUDGET_MM = 274;
const PAGE_1_HEADER_MM = 38;

function estimateItemHeightMm(sectionType, item) {
  const promptLen = (item.prompt || item.passage || '').length;
  const wrappedTextLines = Math.max(1, Math.ceil(promptLen / 68));

  switch (sectionType) {
    case 'fill_blanks':
      return wrappedTextLines * 8.2 + 3.8;
    case 'true_false':
      return wrappedTextLines * 5.8 + 4.2;
    case 'short_qa':
      return wrappedTextLines * 5.8 + (Number(item.lines) || 3) * 9.5 + 3.8;
    case 'mcq':
      return wrappedTextLines * 5.8 + 13.5;
    case 'math_box':
      return wrappedTextLines * 5.4 + (Number(item.boxHeight) || 26) + 4;
    case 'passage_cloze':
      // Passage with generous line height (2.65): 7.4mm per line + padding
      return wrappedTextLines * 7.4 + 6;
    case 'matching':
      // Header (~7mm) + separator (~4.5mm) + per item (8.5mm including borders)
      return 7.6 + (item && item.left ? 8.5 : 0);
    case 'word_meaning':
      return 7.6;
    case 'tick_sentence':
      // Two sentences per item (~20 chars each avg), ~4.5mm each + spacing
      const sentenceALen = (item.sentenceA || '').length;
      const sentenceBLen = (item.sentenceB || '').length;
      const wrappedA = Math.ceil(sentenceALen / 68);
      const wrappedB = Math.ceil(sentenceBLen / 68);
      return (Math.max(1, wrappedA) + Math.max(1, wrappedB)) * 5.7 + 4.2;
    default:
      return wrappedTextLines * 5.5 + 5;
  }
}

function formatLastModified(dateString) {
  if (!dateString) return 'Recently';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return 'Recently';
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return 'Recently';
  }
}

function countWorksheetItems(sheet) {
  if (!sheet || !Array.isArray(sheet.sections)) return 0;
  return sheet.sections.reduce((total, sec) => total + (sec.items?.length || 0), 0);
}

function paginateWorksheet(worksheet) {
  const pages = [];
  let currentPage = { pageNumber: 1, sections: [] };
  let remainingMm = A4_CONTENT_BUDGET_MM - PAGE_1_HEADER_MM;

  const pushNewPage = () => {
    if (currentPage.sections.length > 0) {
      pages.push(currentPage);
    }
    currentPage = { pageNumber: pages.length + 1, sections: [] };
    remainingMm = A4_CONTENT_BUDGET_MM;
  };

  for (const section of worksheet.sections) {
    const sectionHeaderMm =
      section.type === 'matching' || section.type === 'word_meaning' ? 16.5 : 10.5;

    if (!section.items || section.items.length === 0) {
      if (remainingMm < sectionHeaderMm) pushNewPage();
      currentPage.sections.push({
        ...section,
        startIndex: 0,
        isContinuation: false,
        items: []
      });
      remainingMm -= sectionHeaderMm + 4;
      continue;
    }

    if (section.type === 'matching') {
      const totalMatchingMm =
        sectionHeaderMm +
        section.items.reduce((sum, it) => sum + estimateItemHeightMm('matching', it), 0) +
        4;
      if (remainingMm < totalMatchingMm && currentPage.sections.length > 0) {
        pushNewPage();
      }
    }

    let itemIdx = 0;
    let isContinuation = false;

    while (itemIdx < section.items.length) {
      const firstItemMm = estimateItemHeightMm(section.type, section.items[itemIdx]);
      const minNeededMm = (isContinuation ? 10 : sectionHeaderMm) + firstItemMm;

      if (remainingMm < minNeededMm && currentPage.sections.length > 0) {
        pushNewPage();
      }

      const headerCost = isContinuation ? 10 : sectionHeaderMm;
      remainingMm -= headerCost;

      const pageItems = [];
      const startIndex = itemIdx;

      while (itemIdx < section.items.length) {
        const itemMm = estimateItemHeightMm(section.type, section.items[itemIdx]);
        if (remainingMm < itemMm && pageItems.length > 0) {
          break;
        }
        pageItems.push(section.items[itemIdx]);
        remainingMm -= itemMm;
        itemIdx += 1;
      }

      currentPage.sections.push({
        ...section,
        startIndex,
        isContinuation,
        items: pageItems
      });

      remainingMm -= 4;
      isContinuation = true;
    }
  }

  if (currentPage.sections.length > 0 || pages.length === 0) {
    pages.push(currentPage);
  }

  return pages;
}

/**
 * WafiWorksheetBuilder Component
 * 
 * Props (optional, for Firestore integration):
 * - isAdmin: boolean - whether user is an admin (default: true for backward compatibility)
 * - isOnline: boolean - whether Firestore is available
 * - worksheets: array - shared worksheets from Firestore
 * - onBack: function - callback to navigate back
 * - onSaveToFirestore: async function to save worksheet to Firestore
 * - onDeleteFromFirestore: async function to delete worksheet from Firestore
 * - onSaveActiveLocally: function to save active worksheet to localStorage
 */
export function WafiWorksheetBuilder({
  isAdmin = true,
  isOnline = true,
  isLoading = false,
  worksheets: firestoreWorksheets = [],
  onBack = null,
  onSaveToFirestore = null,
  onDeleteFromFirestore = null,
  onSaveActiveLocally = null,
  ...otherProps
} = {}) {
  // Active worksheet state (persisted locally for 100% offline use)
  const [worksheet, setWorksheet] = useState(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = localStorage.getItem(STORAGE_KEY_ACTIVE);
        if (saved) {
          const parsed = JSON.parse(saved);
          return {
            ...parsed,
            id: parsed.id || `sheet-${Date.now()}`,
            updatedAt: parsed.updatedAt || new Date().toISOString()
          };
        }
      }
      return { ...DEFAULT_WORKSHEET, updatedAt: new Date().toISOString() };
    } catch {
      return { ...DEFAULT_WORKSHEET, updatedAt: new Date().toISOString() };
    }
  });

  // Saved chapter question bank (from Firestore for shared, or localStorage for local)
  const [savedChapters, setSavedChapters] = useState(() => {
    // Prefer Firestore worksheets if available, otherwise fall back to localStorage
    if (firestoreWorksheets && firestoreWorksheets.length > 0) {
      return firestoreWorksheets;
    }

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = localStorage.getItem(STORAGE_KEY_BANK);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.map((item, idx) => ({
              ...item,
              id: item.id || `sheet-${Date.now()}-${idx}`,
              updatedAt: item.updatedAt || new Date().toISOString()
            }));
          }
        }
      }
      return [{ ...DEFAULT_WORKSHEET, updatedAt: new Date().toISOString() }];
    } catch {
      return [{ ...DEFAULT_WORKSHEET, updatedAt: new Date().toISOString() }];
    }
  });

  // Sync Firestore worksheets to state when they update
  useEffect(() => {
    if (firestoreWorksheets && firestoreWorksheets.length > 0) {
      setSavedChapters(firestoreWorksheets);
    }
  }, [firestoreWorksheets]);

  // Active saved worksheet tracking
  const [editingSavedId, setEditingSavedId] = useState(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = localStorage.getItem(STORAGE_KEY_ACTIVE);
        if (saved) {
          const parsed = JSON.parse(saved);
          return parsed.id || null;
        }
      }
      return DEFAULT_WORKSHEET.id;
    } catch {
      return DEFAULT_WORKSHEET.id;
    }
  });

  // Saved sheets modal / drawer & search & delete confirmation state
  const [isSavedDrawerOpen, setIsSavedDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Studio navigation
  const [activeTab, setActiveTab] = useState(DEFAULT_WORKSHEET.sections[0]?.id || 'sec-1');
  const [mobileView, setMobileView] = useState('studio');
  const [showAnswerKey, setShowAnswerKey] = useState(false);
  const [paperFontStyle, setPaperFontStyle] = useState('serif');
  const [toast, setToast] = useState(null);
  const [showHeaderSettings, setShowHeaderSettings] = useState(true);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  // Offline Bulk Paste modal state
  const [bulkModalSectionId, setBulkModalSectionId] = useState(null);
  const [bulkText, setBulkText] = useState('');

  const importFileRef = useRef(null);
  const backupFileInputRef = useRef(null);
  const printAreaRef = useRef(null);

  // Identify whether active worksheet matches a saved entry
  const activeSavedSheet = useMemo(
    () => savedChapters.find((s) => s.id === editingSavedId),
    [savedChapters, editingSavedId]
  );

  // Filter saved worksheets by search query
  const filteredSavedWorksheets = useMemo(() => {
    if (!searchQuery.trim()) return savedChapters;
    const q = searchQuery.toLowerCase();
    return savedChapters.filter((sheet) => {
      const chapter = (sheet.header?.chapter || '').toLowerCase();
      const subject = (sheet.header?.subject || '').toLowerCase();
      const student = (sheet.header?.studentName || '').toLowerCase();
      const grade = (sheet.header?.grade || '').toLowerCase();
      return chapter.includes(q) || subject.includes(q) || student.includes(q) || grade.includes(q);
    });
  }, [savedChapters, searchQuery]);

  // Sync changes to localStorage automatically
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(STORAGE_KEY_ACTIVE, JSON.stringify(worksheet));
      }
    } catch {
      // Ignore storage quota issues
    }

    // If Firestore callback is available and user is admin, also save to cloud (debounced)
    if (onSaveActiveLocally && typeof onSaveActiveLocally === 'function') {
      onSaveActiveLocally(worksheet);
    }
  }, [worksheet, onSaveActiveLocally]);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(STORAGE_KEY_BANK, JSON.stringify(savedChapters));
      }
    } catch {
      // Ignore storage quota issues
    }
  }, [savedChapters]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3200);
  };

  // Close modals on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isSavedDrawerOpen) {
          setIsSavedDrawerOpen(false);
          setDeleteConfirmId(null);
        }
        if (bulkModalSectionId) setBulkModalSectionId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSavedDrawerOpen, bulkModalSectionId]);

  // --- Add a new Section ---
  const addSection = (typeId) => {
    const sectionConfig = SECTION_TYPES.find((t) => t.id === typeId);
    const newSectionId = `sec-${Date.now()}`;
    const nextLetter = String.fromCharCode(65 + worksheet.sections.length);
    const defaultTitle = `${nextLetter}. ${sectionConfig ? sectionConfig.label : 'New Section'}`;
    const newSection = {
      id: newSectionId,
      type: typeId,
      title: defaultTitle,
      items: []
    };
    setWorksheet((prev) => ({
      ...prev,
      sections: [...prev.sections, newSection]
    }));
    setActiveTab(newSectionId);
    showToast(`Added ${sectionConfig?.label || 'section'}`);
  };

  // --- Delete a Section ---
  const deleteSection = (sectionId) => {
    if (worksheet.sections.length <= 1) {
      showToast('Worksheet must have at least one section', 'error');
      return;
    }
    setWorksheet((prev) => {
      const filtered = prev.sections.filter((s) => s.id !== sectionId);
      if (activeTab === sectionId) {
        setActiveTab(filtered[0]?.id || 'manual');
      }
      return { ...prev, sections: filtered };
    });
    showToast('Section removed');
  };

  // --- Sandbox-Safe Standalone Self-Styled A4 Print Handler ---
  const handlePrintWorksheet = () => {
    if (typeof window === 'undefined') return;
    const printContainer = printAreaRef.current;
    if (!printContainer) {
      window.print();
      return;
    }

    const printWindow = window.open('', '_blank', 'width=920,height=1150');
    if (!printWindow) {
      window.print();
      return;
    }

    const doc = printWindow.document;
    doc.open();
    doc.close();

    doc.title = worksheet.header.chapter || 'Wafi Homework Sheet';

    const fontLink = doc.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href =
      'https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,400;0,600;0,700;1,400&family=Hind+Siliguri:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap';
    doc.head.appendChild(fontLink);

    const fontStack =
      paperFontStyle === 'serif'
        ? "'Crimson Pro', 'Hind Siliguri', Georgia, serif"
        : "'Plus Jakarta Sans', 'Hind Siliguri', sans-serif";

    const styleEl = doc.createElement('style');
    styleEl.textContent = `
      @page { size: A4 portrait; margin: 6mm 6mm 4mm 6mm; }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        padding: 0;
        background: #ffffff;
        color: #020617;
        font-family: ${fontStack};
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      h1, h2, h3, h4, h5, h6, p {
        margin: 0;
        padding: 0;
      }
      .a4-sheet {
        width: 198mm;
        height: 286.5mm;
        min-height: 286.5mm;
        position: relative;
        padding: 5mm 4mm 1.5mm 12mm;
        margin: 0 auto;
        background: #ffffff;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        page-break-after: always;
        break-after: page;
      }
      .a4-sheet:last-child {
        page-break-after: auto;
        break-after: auto;
      }
      .a4-sheet > div:first-child > .border-2 {
        border: 2px solid #0f172a;
        padding: 14px 16px;
        margin-bottom: 18px;
      }
      .text-center { text-align: center; }
      .border-b.border-slate-400 {
        border-bottom: 1px solid #94a3b8;
        padding-bottom: 8px;
        margin-bottom: 10px;
      }
      .sheet-header-title {
        margin: 0;
        font-size: 10.5pt;
        font-weight: 600;
        letter-spacing: 0.15em;
        text-transform: uppercase;
        color: #475569;
        text-align: center;
        line-height: 1.25;
      }
      .sheet-header-chapter {
        margin: 3px 0 0 0;
        font-size: 17.5pt;
        font-weight: 700;
        letter-spacing: 0.01em;
        color: #0f172a;
        text-align: center;
        line-height: 1.25;
      }
      h2 { font-size: 18px; font-weight: 700; }
      h3 { font-size: 15px; font-weight: 700; }
      h4 { font-size: 16px; font-weight: 700; }
      .grid-cols-3 {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 16px;
        font-size: 15.5px;
      }
      .grid-cols-3 > div { display: flex; align-items: baseline; gap: 6px; }
      .font-bold { font-weight: 700; }
      .font-semibold { font-weight: 600; }
      .font-medium { font-weight: 500; }
      .italic { font-style: italic; }
      .border-dotted {
        flex: 1;
        border-bottom: 1px dotted #475569;
        padding: 0 4px;
      }
      .border-dotted.font-bold {
        font-weight: 700;
      }
      section { margin-bottom: 18px; }
      section > .border-b {
        border-bottom: none !important;
        margin-bottom: 8px;
        padding-bottom: 0;
      }
      section > .border-b h4 {
        font-size: 16px;
        margin: 0;
        padding: 0;
        padding-bottom: 3px;
        border-bottom: 1px solid #94a3b8;
        line-height: 1.2;
      }
      ol { list-style: none; margin: 0; padding: 0 0 0 4px; }
      li {
        margin-bottom: 8px;
        font-size: 16px;
        break-inside: avoid;
        page-break-inside: avoid;
      }
      li > div:first-child, li.flex {
        display: flex;
        align-items: baseline;
        gap: 10px;
      }
      li.justify-between { justify-content: space-between; gap: 16px; }
      .flex-1 { flex: 1; }
      .shrink-0 { flex-shrink: 0; }
      .w-5 { width: 20px; display: inline-block; }
      .pl-7 { padding-left: 30px; }
      .fill-blanks-item,
      li.fill-blanks-item {
        line-height: 1.95;
        margin-bottom: 12px !important;
      }
      .fill-blanks-item span {
        line-height: 1.95;
      }
      .leading-\[2\.6\] {
        line-height: 1.95 !important;
      }
      .mb-4 {
        margin-bottom: 16px !important;
      }
      span[aria-label="blank writing space"] {
        display: inline-block;
        min-width: 90px;
        border-bottom: 1.5px solid #0f172a;
        margin: 0 6px;
        vertical-align: baseline;
      }
      span[aria-label="Write True or False"] {
        display: inline-block;
        width: 135px;
        border-bottom: 1.5px solid #0f172a;
        flex-shrink: 0;
      }
      .h-\\[11mm\\] {
        height: 9.5mm;
        border-bottom: 1px solid #64748b;
        width: 100%;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        font-size: 15.5px;
      }
      th, td {
        border: 1px solid #1e293b;
        padding: 6px 10px;
        text-align: left;
      }
      thead tr { background: #f1f5f9; }
      .grid-cols-2 {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 6px 24px;
        margin-top: 6px;
        font-size: 15px;
      }
      .grid-cols-2 > div { display: flex; align-items: center; gap: 8px; }
      
      /* === MATCHING SECTION CSS (Inline styles used instead) === */
      .matching-col-header { border-bottom: 1.5px solid #1e293b !important; }
      
      .border-r-0 { border-right: 0 !important; }
      .border-l-0 { border-left: 0 !important; }
      .border-t-0 { border-top: 0 !important; }
      .rounded-l-none { border-radius: 0 !important; }
      .rounded-r-none { border-radius: 0 !important; }
      
      .rounded-full {
        display: inline-block;
        width: 13px;
        height: 13px;
        border-radius: 9999px;
        border: 1px solid #0f172a;
        flex-shrink: 0;
      }
      .ml-7 {
        margin-left: 30px;
        margin-top: 6px;
        border: 1px solid #94a3b8;
        position: relative;
      }
      .ml-7 span {
        position: absolute;
        top: 4px;
        right: 8px;
        font-size: 10px;
        text-transform: uppercase;
        color: #94a3b8;
      }
      
      /* === FLEX UTILITIES === */
      .flex {
        display: flex;
      }
      .flex-col {
        flex-direction: column;
      }
      .flex-1 {
        flex: 1;
      }
      .items-baseline {
        align-items: baseline;
      }
      .items-center {
        align-items: center;
      }
      .gap-1\.5 {
        gap: 6px;
      }
      .gap-2 {
        gap: 8px;
      }
      .gap-3 {
        gap: 12px;
      }
      .pt-0\.5 {
        padding-top: 2px;
      }
      
      /* === TEXT UTILITIES === */
      .text-sm { font-size: 15.5px; line-height: 1.45; }
      .text-xs { font-size: 12px; line-height: 1.3333; }
      .text-justify { text-align: justify; }
      .text-slate-600 { color: #475569; }
      .text-slate-800 { color: #1e293b; }
      
      /* === LAYOUT & SPACING === */
      .mb-1 { margin-bottom: 4px; }
      .mb-1\.5 { margin-bottom: 6px; }
      .mb-2 { margin-bottom: 8px; }
      .mb-4 { margin-bottom: 16px; }
      .p-2 { padding: 8px; }
      .px-1 { padding-left: 4px; padding-right: 4px; }
      .mx-0\.5 { margin-left: 2px; margin-right: 2px; }
      .mx-1 { margin-left: 4px; margin-right: 4px; }
      
      /* === BORDER & ROUNDED === */
      .rounded { border-radius: 4px; }
      .border { border: 1px solid #d1d5db; }
      .border-slate-300 { border-color: #cbd5e1; }
      .border-slate-400 { border-color: #94a3b8; }
      .border-2.border-slate-900.rounded { 
        display: inline-block;
        width: 16px;
        height: 16px;
        border-radius: 4px;
        border: 2px solid #0f172a;
      }
      
      /* === LEAD/LINE HEIGHT === */
      .leading-\[2\.3\] { line-height: 2.3; }
      .leading-\[2\.65\] { line-height: 2.65; }
      

      /* === INLINE STYLES === */
      span[style*="width"] {
        display: inline-block;
      }
      
      /* === ALIGN BASELINE === */
      .align-baseline { vertical-align: baseline; }
      
      /* === TICK SENTENCE CHECKBOX STYLING === */
      .inline-block.h-3\\.5.w-3\\.5.rounded-full.border.border-slate-900.shrink-0 {
        width: 13px;
        height: 13px;
        border: 1px solid #0f172a;
      }
      
      /* Space-y utility */
      .space-y-1 > * + * { margin-top: 4px; }
      .space-y-2 > * + * { margin-top: 8px; }
      .space-y-3 > * + * { margin-top: 12px; }
      .space-y-4 > * + * { margin-top: 16px; }

      .text-right {
        text-align: right;
        font-size: 11px;
        color: #64748b;
        padding-top: 8px;
      }
      .answer-key-page {
        width: 198mm;
        padding: 5mm 4mm 3mm 12mm;
        margin: 0 auto;
        page-break-before: always;
        break-before: page;
      }
      .answer-key-page > div:first-child {
        border-bottom: 2px solid #0f172a;
        padding-bottom: 8px;
        margin-bottom: 14px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .answer-key-page ul { padding-left: 20px; margin: 6px 0 12px 0; font-size: 13.5px; }
      .answer-key-page li { font-size: 13.5px; margin-bottom: 4px; display: list-item; list-style-type: disc; }
    `;
    doc.head.appendChild(styleEl);

    const clonedNode = doc.importNode(printContainer, true);
    doc.body.appendChild(clonedNode);

    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 350);
  };

  // --- Direct One-Click A4 PDF Download (Pure Canvas + jsPDF — Never White Page) ---
  const handleDownloadPdf = async () => {
    if (isDownloadingPdf) return;
    setIsDownloadingPdf(true);
    showToast('Generating crisp A4 PDF...');

    try {
      if (typeof window === 'undefined') {
        throw new Error('PDF download requires a browser environment.');
      }

      // Load standalone jsPDF if not already available
      if (!window.jspdf?.jsPDF) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
          script.onload = resolve;
          script.onerror = () => reject(new Error('Failed to load jsPDF'));
          document.head.appendChild(script);
        });
      }

      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }

      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });

      // High-DPI A4 Canvas (210mm x 297mm @ ~150 DPI -> 1240 x 1754 px)
      const DPI_SCALE = 1240 / 210; // ~5.90476 px per mm
      const PAGE_W = 210;
      const PAGE_H = 297;
      const MARGIN_LEFT = 22;
      const MARGIN_RIGHT = 13;
      const CONTENT_W = PAGE_W - MARGIN_LEFT - MARGIN_RIGHT;

      const fontStack =
        paperFontStyle === 'serif'
          ? "'Crimson Pro', 'Hind Siliguri', Georgia, 'Times New Roman', serif"
          : "'Plus Jakarta Sans', 'Hind Siliguri', Arial, sans-serif";

      const createPageCanvas = () => {
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(PAGE_W * DPI_SCALE);
        canvas.height = Math.round(PAGE_H * DPI_SCALE);
        const ctx = canvas.getContext('2d');
        ctx.scale(DPI_SCALE, DPI_SCALE);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, PAGE_W, PAGE_H);
        ctx.fillStyle = '#020617';
        ctx.strokeStyle = '#0f172a';
        ctx.textBaseline = 'alphabetic';
        return { canvas, ctx };
      };

      const wrapTextLines = (ctx, text, maxWidth) => {
        const words = String(text || '').split(/\s+/);
        const lines = [];
        let current = '';
        for (const word of words) {
          const test = current ? `${current} ${word}` : word;
          if (ctx.measureText(test).width > maxWidth && current) {
            lines.push(current);
            current = word;
          } else {
            current = test;
          }
        }
        if (current) lines.push(current);
        return lines.length ? lines : [''];
      };

      paginatedPages.forEach((page, pIdx) => {
        if (pIdx > 0) pdf.addPage();
        const { canvas, ctx } = createPageCanvas();
        let y = 13;

        // --- Page 1 Header Box ---
        if (page.pageNumber === 1) {
          const boxTop = y;
          const boxHeight = 31;
          ctx.lineWidth = 0.55;
          ctx.strokeStyle = '#0f172a';
          ctx.strokeRect(MARGIN_LEFT, boxTop, CONTENT_W, boxHeight);

          ctx.textAlign = 'center';
          ctx.fillStyle = '#475569';
          ctx.font = `600 3.7px ${fontStack}`;
          if ('letterSpacing' in ctx) ctx.letterSpacing = '0.6px';
          ctx.fillText(
            (worksheet.header.title || 'HOMEWORK PRACTICE SHEET').toUpperCase(),
            MARGIN_LEFT + CONTENT_W / 2,
            boxTop + 6.3
          );
          if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';

          ctx.font = `700 6.1px ${fontStack}`;
          ctx.fillStyle = '#0f172a';
          ctx.fillText(worksheet.header.chapter || '', MARGIN_LEFT + CONTENT_W / 2, boxTop + 13.8);

          // Divider inside header box
          ctx.beginPath();
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 0.25;
          ctx.moveTo(MARGIN_LEFT + 4, boxTop + 16.8);
          ctx.lineTo(MARGIN_LEFT + CONTENT_W - 4, boxTop + 16.8);
          ctx.stroke();

          // Name | Class | Subject row
          ctx.textAlign = 'left';
          const colW = (CONTENT_W - 12) / 3;
          const metaFields = [
            { label: 'Name:', value: worksheet.header.studentName || '' },
            { label: 'Class:', value: worksheet.header.grade || '' },
            { label: 'Subject:', value: worksheet.header.subject || '' }
          ];

          metaFields.forEach((f, idx) => {
            const xStart = MARGIN_LEFT + 4 + idx * (colW + 2);
            const rowY = boxTop + 24.5;
            ctx.font = `700 3.8px ${fontStack}`;
            ctx.fillStyle = '#020617';
            ctx.fillText(f.label, xStart, rowY);
            const labelW = ctx.measureText(f.label).width + 1.8;

            const isSubject = idx === 2 || f.label === 'Subject:';
            ctx.font = `${isSubject ? '700' : idx === 0 ? '600' : '400'} 3.8px ${fontStack}`;
            ctx.fillStyle = isSubject ? '#020617' : idx === 0 ? '#0f172a' : '#1e293b';
            ctx.fillText(f.value, xStart + labelW + 1, rowY);

            ctx.save();
            ctx.setLineDash([0.6, 0.6]);
            ctx.strokeStyle = '#475569';
            ctx.lineWidth = 0.25;
            ctx.beginPath();
            ctx.moveTo(xStart + labelW, rowY + 1.1);
            ctx.lineTo(xStart + colW, rowY + 1.1);
            ctx.stroke();
            ctx.restore();
          });

          y = boxTop + boxHeight + 7;
        } else {
          y = 16;
        }

        // --- Sections on Page ---
        page.sections.forEach((section) => {
          ctx.textAlign = 'left';
          ctx.fillStyle = '#020617';
          ctx.font = `700 4.2px ${fontStack}`;
          ctx.fillText(section.title, MARGIN_LEFT, y);
          if (section.isContinuation) {
            const titleW = ctx.measureText(section.title).width;
            ctx.font = `italic 400 3.4px ${fontStack}`;
            ctx.fillStyle = '#475569';
            ctx.fillText(' (continued)', MARGIN_LEFT + titleW + 1, y);
          }

          ctx.beginPath();
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 0.25;
          ctx.moveTo(MARGIN_LEFT, y + 1.2);
          ctx.lineTo(MARGIN_LEFT + CONTENT_W, y + 1.2);
          ctx.stroke();
          y += 5.2;

          // 1. FILL IN THE BLANKS
          if (section.type === 'fill_blanks') {
            section.items.forEach((item, idx) => {
              const numStr = `${section.startIndex + idx + 1}.`;
              ctx.fillStyle = '#020617';
              ctx.font = `700 4.0px ${fontStack}`;
              ctx.fillText(numStr, MARGIN_LEFT + 1, y);

              const textStartX = MARGIN_LEFT + 7.5;
              const maxLineX = MARGIN_LEFT + CONTENT_W;
              let cursorX = textStartX;

              const tokens = (item.prompt || '').split(/(_+)/g);
              ctx.font = `400 4.0px ${fontStack}`;

              tokens.forEach((tok) => {
                if (/^_+$/.test(tok)) {
                  const underscoreCount = tok.length;
                  const blankWidth = Math.min(
                    CONTENT_W - 8,
                    Math.max(24, Math.round(underscoreCount * 3.7 * 10) / 10)
                  );
                  if (cursorX + blankWidth > maxLineX) {
                    y += 10.5;
                    cursorX = textStartX;
                  }
                  ctx.beginPath();
                  ctx.strokeStyle = '#0f172a';
                  ctx.lineWidth = 0.35;
                  ctx.moveTo(cursorX + 1, y + 0.8);
                  ctx.lineTo(cursorX + blankWidth - 1, y + 0.8);
                  ctx.stroke();
                  cursorX += blankWidth;
                } else if (tok) {
                  const words = tok.split(/(\s+)/);
                  words.forEach((w) => {
                    if (!w) return;
                    const wWidth = ctx.measureText(w).width;
                    if (cursorX + wWidth > maxLineX && w.trim()) {
                      y += 10.5;
                      cursorX = textStartX;
                    }
                    if (!(cursorX === textStartX && !w.trim())) {
                      ctx.fillText(w, cursorX, y);
                      cursorX += wWidth;
                    }
                  });
                }
              });

              y += 15.0;
            });
          }

          // 2. TRUE / FALSE (Written Blank Space)
          if (section.type === 'true_false') {
            const blankW = 36;
            const textMaxW = CONTENT_W - blankW - 12;
            section.items.forEach((item, idx) => {
              const numStr = `${section.startIndex + idx + 1}.`;
              ctx.fillStyle = '#020617';
              ctx.font = `700 3.9px ${fontStack}`;
              ctx.fillText(numStr, MARGIN_LEFT + 1, y);

              ctx.font = `400 3.9px ${fontStack}`;
              const lines = wrapTextLines(ctx, item.prompt, textMaxW);
              lines.forEach((line, lIdx) => {
                ctx.fillText(line, MARGIN_LEFT + 7.5, y + lIdx * 5.2);
              });

              const lastLineY = y + (lines.length - 1) * 5.2;
              ctx.beginPath();
              ctx.strokeStyle = '#0f172a';
              ctx.lineWidth = 0.35;
              ctx.moveTo(MARGIN_LEFT + CONTENT_W - blankW, lastLineY + 0.8);
              ctx.lineTo(MARGIN_LEFT + CONTENT_W, lastLineY + 0.8);
              ctx.stroke();

              y = lastLineY + 10.2;
            });
          }

          // 3. MATCH COLUMN A & B
          if (section.type === 'matching') {
            const boxW = (CONTENT_W - 9) / 2; // Two boxes with ~9mm center gap
            const gapW = 9; // Center gap for drawing lines
            const itemRowH = 8.5; // Row height per item

            if (!section.isContinuation) {
              // Header row with light slate background
              const headerH = 7;
              ctx.fillStyle = '#f1f5f9';
              ctx.fillRect(MARGIN_LEFT, y - 4.2, boxW, headerH);
              ctx.fillRect(MARGIN_LEFT + boxW + gapW, y - 4.2, boxW, headerH);

              // Header borders - crisp 0.35mm
              ctx.strokeStyle = '#334155';
              ctx.lineWidth = 0.35;
              ctx.strokeRect(MARGIN_LEFT, y - 4.2, boxW, headerH);
              ctx.strokeRect(MARGIN_LEFT + boxW + gapW, y - 4.2, boxW, headerH);

              // Header text - bold, centered
              ctx.fillStyle = '#020617';
              ctx.font = `700 3.9px ${fontStack}`;
              ctx.textAlign = 'center';
              ctx.fillText('Column A', MARGIN_LEFT + boxW / 2, y + 0.8);
              ctx.fillText('Column B', MARGIN_LEFT + boxW + gapW + boxW / 2, y + 0.8);
              ctx.textAlign = 'left';

              // Header bottom border (divider between header and items)
              ctx.beginPath();
              ctx.strokeStyle = '#64748b';
              ctx.lineWidth = 0.25;
              ctx.moveTo(MARGIN_LEFT, y + 2.8);
              ctx.lineTo(MARGIN_LEFT + boxW, y + 2.8);
              ctx.stroke();
              ctx.beginPath();
              ctx.moveTo(MARGIN_LEFT + boxW + gapW, y + 2.8);
              ctx.lineTo(MARGIN_LEFT + boxW + gapW + boxW, y + 2.8);
              ctx.stroke();

              y += 7;
            }

            // Item rows
            section.items.forEach((item, itemIdx) => {
              const itemY = y - 4.2;
              
              // Left box with border
              ctx.strokeStyle = '#334155';
              ctx.lineWidth = 0.35;
              ctx.strokeRect(MARGIN_LEFT, itemY, boxW, itemRowH);
              ctx.fillStyle = '#020617';
              ctx.font = `400 3.9px ${fontStack}`;
              ctx.textAlign = 'center';
              ctx.fillText(item.left || '', MARGIN_LEFT + boxW / 2, y + 0.6);

              // Right box with border
              ctx.strokeStyle = '#334155';
              ctx.lineWidth = 0.35;
              ctx.strokeRect(MARGIN_LEFT + boxW + gapW, itemY, boxW, itemRowH);
              ctx.fillStyle = '#020617';
              ctx.font = `400 3.9px ${fontStack}`;
              ctx.fillText(item.right || '', MARGIN_LEFT + boxW + gapW + boxW / 2, y + 0.6);
              ctx.textAlign = 'left';

              // Horizontal divider between items (if not the last item)
              if (itemIdx < section.items.length - 1) {
                ctx.beginPath();
                ctx.strokeStyle = '#64748b';
                ctx.lineWidth = 0.25;
                ctx.moveTo(MARGIN_LEFT, itemY + itemRowH);
                ctx.lineTo(MARGIN_LEFT + boxW, itemY + itemRowH);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(MARGIN_LEFT + boxW + gapW, itemY + itemRowH);
                ctx.lineTo(MARGIN_LEFT + boxW + gapW + boxW, itemY + itemRowH);
                ctx.stroke();
              }

              y += itemRowH;
            });
            y += 2;
          }

          // 4. WORD MEANINGS / SENTENCES
          if (section.type === 'word_meaning') {
            const c1 = CONTENT_W * 0.24;
            const c2 = CONTENT_W * 0.32;
            const c3 = CONTENT_W * 0.44;
            if (!section.isContinuation) {
              ctx.fillStyle = '#f1f5f9';
              ctx.fillRect(MARGIN_LEFT, y - 4.2, CONTENT_W, 7);
              ctx.strokeStyle = '#0f172a';
              ctx.lineWidth = 0.3;
              ctx.strokeRect(MARGIN_LEFT, y - 4.2, c1, 7);
              ctx.strokeRect(MARGIN_LEFT + c1, y - 4.2, c2, 7);
              ctx.strokeRect(MARGIN_LEFT + c1 + c2, y - 4.2, c3, 7);

              ctx.fillStyle = '#020617';
              ctx.font = `700 3.8px ${fontStack}`;
              ctx.fillText('Word', MARGIN_LEFT + 2.5, y + 0.5);
              ctx.fillText('Meaning', MARGIN_LEFT + c1 + 2.5, y + 0.5);
              ctx.fillText('Make Sentence', MARGIN_LEFT + c1 + c2 + 2.5, y + 0.5);
              y += 7;
            }

            section.items.forEach((item, idx) => {
              ctx.strokeStyle = '#0f172a';
              ctx.lineWidth = 0.3;
              ctx.strokeRect(MARGIN_LEFT, y - 4.2, c1, 8.5);
              ctx.strokeRect(MARGIN_LEFT + c1, y - 4.2, c2, 8.5);
              ctx.strokeRect(MARGIN_LEFT + c1 + c2, y - 4.2, c3, 8.5);

              ctx.fillStyle = '#020617';
              ctx.font = `600 3.8px ${fontStack}`;
              ctx.fillText(`${section.startIndex + idx + 1}. ${item.word || ''}`, MARGIN_LEFT + 2.5, y + 1.2);
              ctx.font = `400 3.8px ${fontStack}`;
              ctx.fillStyle = '#475569';
              ctx.fillText(item.meaning || '', MARGIN_LEFT + c1 + 2.5, y + 1.2);
              y += 8.5;
            });
            y += 2;
          }

          // 5. SHORT / BROAD Q&A (11mm line height)
          if (section.type === 'short_qa') {
            section.items.forEach((item, idx) => {
              const numStr = `${section.startIndex + idx + 1}.`;
              ctx.fillStyle = '#020617';
              ctx.font = `700 3.9px ${fontStack}`;
              ctx.fillText(numStr, MARGIN_LEFT + 1, y);

              ctx.font = `500 3.9px ${fontStack}`;
              const lines = wrapTextLines(ctx, item.prompt, CONTENT_W - 8);
              lines.forEach((line, lIdx) => {
                ctx.fillText(line, MARGIN_LEFT + 7.5, y + lIdx * 5.2);
              });
              y += lines.length * 5.2 + 1;

              const lineCount = item.lines ?? 3;
              for (let l = 0; l < lineCount; l += 1) {
                y += 11;
                ctx.beginPath();
                ctx.strokeStyle = '#64748b';
                ctx.lineWidth = 0.25;
                ctx.moveTo(MARGIN_LEFT + 7.5, y);
                ctx.lineTo(MARGIN_LEFT + CONTENT_W, y);
                ctx.stroke();
              }
              y += 6.5;
            });
          }

          // 6. MULTIPLE CHOICE (MCQ)
          if (section.type === 'mcq') {
            section.items.forEach((item, idx) => {
              const numStr = `${section.startIndex + idx + 1}.`;
              ctx.fillStyle = '#020617';
              ctx.font = `700 3.9px ${fontStack}`;
              ctx.fillText(numStr, MARGIN_LEFT + 1, y);

              ctx.font = `500 3.9px ${fontStack}`;
              const lines = wrapTextLines(ctx, item.prompt, CONTENT_W - 8);
              lines.forEach((line, lIdx) => {
                ctx.fillText(line, MARGIN_LEFT + 7.5, y + lIdx * 5.2);
              });
              y += lines.length * 5.2 + 1.5;

              const opts = item.options || [];
              const colWidth = (CONTENT_W - 8) / 2;
              opts.forEach((opt, oIdx) => {
                const col = oIdx % 2;
                const row = Math.floor(oIdx / 2);
                const ox = MARGIN_LEFT + 7.5 + col * colWidth;
                const oy = y + row * 5.8;

                ctx.beginPath();
                ctx.strokeStyle = '#0f172a';
                ctx.lineWidth = 0.3;
                ctx.arc(ox + 1.8, oy - 1.2, 1.7, 0, Math.PI * 2);
                ctx.stroke();

                ctx.font = `400 3.7px ${fontStack}`;
                ctx.fillText(`(${String.fromCharCode(97 + oIdx)}) ${opt}`, ox + 5, oy);
              });
              y += Math.ceil(opts.length / 2) * 5.8 + 4;
            });
          }

          // 7. MATH / WORK BOX
          if (section.type === 'math_box') {
            section.items.forEach((item, idx) => {
              const numStr = `${section.startIndex + idx + 1}.`;
              ctx.fillStyle = '#020617';
              ctx.font = `700 3.9px ${fontStack}`;
              ctx.fillText(numStr, MARGIN_LEFT + 1, y);

              ctx.font = `500 3.9px ${fontStack}`;
              const lines = wrapTextLines(ctx, item.prompt, CONTENT_W - 8);
              lines.forEach((line, lIdx) => {
                ctx.fillText(line, MARGIN_LEFT + 7.5, y + lIdx * 5.2);
              });
              y += lines.length * 5.2 + 1.5;

              const boxH = Number(item.boxHeight) || 26;
              ctx.strokeStyle = '#94a3b8';
              ctx.lineWidth = 0.3;
              ctx.strokeRect(MARGIN_LEFT + 7.5, y, CONTENT_W - 7.5, boxH);
              ctx.fillStyle = '#94a3b8';
              ctx.font = `400 2.6px ${fontStack}`;
              ctx.textAlign = 'right';
              ctx.fillText('WORK / ANSWER', MARGIN_LEFT + CONTENT_W - 2, y + 3.5);
              ctx.textAlign = 'left';
              y += boxH + 5.5;
            });
          }

          // 8. PASSAGE / CLOZE
          if (section.type === 'passage_cloze') {
            section.items.forEach((item) => {
              const passage = item.passage || '';
              const hasBrackets = /\(\s*[^/]+\s*\/\s*[^)]+\s*\)/g.test(passage);
              const hasBlanks = /_+/.test(passage);
              
              ctx.font = `400 3.8px ${fontStack}`;
              ctx.fillStyle = '#020617';
              ctx.textAlign = 'left';

              if (hasBrackets) {
                // Render with bracket choices
                const bracketRegex = /(\(\s*[^/]+\s*\/\s*[^)]+\s*\))/g;
                const parts = passage.split(bracketRegex);
                let lineStart = MARGIN_LEFT;
                let lineY = y;
                const maxWidth = MARGIN_LEFT + CONTENT_W;

                parts.forEach((part) => {
                  if (!part) return;

                  if (/^\(\s*[^/]+\s*\/\s*[^)]+\s*\)$/.test(part)) {
                    // Bracket choice
                    const brackW = ctx.measureText(part).width + 3;
                    if (lineStart + brackW > maxWidth) {
                      lineY += 5.8;
                      lineStart = MARGIN_LEFT;
                    }
                    ctx.strokeStyle = '#0f172a';
                    ctx.lineWidth = 0.3;
                    ctx.strokeRect(lineStart, lineY - 3, brackW, 4.5);
                    ctx.fillStyle = '#020617';
                    ctx.font = `600 3.7px ${fontStack}`;
                    ctx.fillText(part, lineStart + 1.5, lineY);
                    lineStart += brackW + 1;
                  } else {
                    // Regular text
                    const words = part.split(/(\s+)/);
                    words.forEach((w) => {
                      if (!w) return;
                      const wW = ctx.measureText(w).width;
                      if (lineStart + wW > maxWidth && w.trim()) {
                        lineY += 5.8;
                        lineStart = MARGIN_LEFT;
                      }
                      ctx.font = `400 3.8px ${fontStack}`;
                      ctx.fillStyle = '#020617';
                      ctx.fillText(w, lineStart, lineY);
                      lineStart += wW;
                    });
                  }
                });
                y = lineY + 5.8;
              } else if (hasBlanks) {
                // Render with underline blanks
                const blankRegex = /(_+)/g;
                const parts = passage.split(blankRegex);
                let lineStart = MARGIN_LEFT;
                let lineY = y;

                parts.forEach((part) => {
                  if (!part) return;

                  if (/^_+$/.test(part)) {
                    // Blank line
                    const blankW = Math.max(20, part.length * 3.5);
                    if (lineStart + blankW > maxWidth) {
                      lineY += 5.8;
                      lineStart = MARGIN_LEFT;
                    }
                    ctx.strokeStyle = '#0f172a';
                    ctx.lineWidth = 0.35;
                    ctx.beginPath();
                    ctx.moveTo(lineStart + 1, lineY + 0.5);
                    ctx.lineTo(lineStart + blankW - 1, lineY + 0.5);
                    ctx.stroke();
                    lineStart += blankW + 1;
                  } else {
                    // Regular text
                    const words = part.split(/(\s+)/);
                    words.forEach((w) => {
                      if (!w) return;
                      const wW = ctx.measureText(w).width;
                      if (lineStart + wW > maxWidth && w.trim()) {
                        lineY += 5.8;
                        lineStart = MARGIN_LEFT;
                      }
                      ctx.fillStyle = '#020617';
                      ctx.font = `400 3.8px ${fontStack}`;
                      ctx.fillText(w, lineStart, lineY);
                      lineStart += wW;
                    });
                  }
                });
                y = lineY + 5.8;
              } else {
                // Plain text (just in case)
                const passageLines = wrapTextLines(ctx, passage, CONTENT_W);
                passageLines.forEach((line) => {
                  ctx.fillText(line, MARGIN_LEFT, y);
                  y += 5.8;
                });
              }
              y += 3;
            });
          }

          // 9. TICK SENTENCE
          if (section.type === 'tick_sentence') {
            const checkboxSize = 4.2; // mm (15px equivalent)
            const itemNumberWidth = 6; // mm for item number
            const itemNumberX = MARGIN_LEFT + 1;
            const rightStackX = MARGIN_LEFT + itemNumberWidth + 4; // after item number + gap
            const checkboxX = rightStackX;
            const labelX = checkboxX + checkboxSize + 2; // after checkbox + small gap
            const sentenceStartX = labelX + 3.5; // after label + gap
            const maxSentenceWidth = MARGIN_LEFT + CONTENT_W - sentenceStartX;
            const lineHeight = 5.2; // mm per text line
            const verticalRowGap = 6; // mm gap between Row A and Row B
            
            section.items.forEach((item, idxItem) => {
              const itemNumStr = `${section.startIndex + idxItem + 1}.`;
              
              // Calculate line counts for each sentence
              const sentenceALines = wrapTextLines(ctx, item.sentenceA, maxSentenceWidth);
              const sentenceBLines = wrapTextLines(ctx, item.sentenceB, maxSentenceWidth);
              
              // Calculate actual row heights
              const rowAHeight = Math.max(1, sentenceALines.length) * lineHeight;
              const rowBHeight = Math.max(1, sentenceBLines.length) * lineHeight;
              const totalItemHeight = rowAHeight + verticalRowGap + rowBHeight;
              
              // === ROW A ===
              const rowAY = y;
              
              // Checkbox A
              ctx.strokeStyle = '#0f172a';
              ctx.lineWidth = 0.35;
              ctx.strokeRect(checkboxX, rowAY + (rowAHeight - checkboxSize) / 2, checkboxSize, checkboxSize);
              
              // Label A (bold)
              ctx.fillStyle = '#020617';
              ctx.font = `700 3.9px ${fontStack}`;
              ctx.textAlign = 'left';
              ctx.fillText('A', labelX, rowAY + rowAHeight / 2 + 1.2);
              
              // Sentence A (wrapped text, baseline centered)
              ctx.font = `400 3.8px ${fontStack}`;
              ctx.fillStyle = '#020617';
              sentenceALines.forEach((line, lIdx) => {
                const lineY = rowAY + rowAHeight / 2 - (sentenceALines.length - 1) * lineHeight / 2 + lIdx * lineHeight;
                ctx.fillText(line, sentenceStartX, lineY + 1.1);
              });
              
              // === ROW B ===
              const rowBY = y + rowAHeight + verticalRowGap;
              
              // Checkbox B
              ctx.strokeStyle = '#0f172a';
              ctx.lineWidth = 0.35;
              ctx.strokeRect(checkboxX, rowBY + (rowBHeight - checkboxSize) / 2, checkboxSize, checkboxSize);
              
              // Label B (bold)
              ctx.fillStyle = '#020617';
              ctx.font = `700 3.9px ${fontStack}`;
              ctx.textAlign = 'left';
              ctx.fillText('B', labelX, rowBY + rowBHeight / 2 + 1.2);
              
              // Sentence B (wrapped text, baseline centered)
              ctx.font = `400 3.8px ${fontStack}`;
              ctx.fillStyle = '#020617';
              sentenceBLines.forEach((line, lIdx) => {
                const lineY = rowBY + rowBHeight / 2 - (sentenceBLines.length - 1) * lineHeight / 2 + lIdx * lineHeight;
                ctx.fillText(line, sentenceStartX, lineY + 1.1);
              });
              
              // === Item Number (vertically centered between rows) ===
              const itemNumberCenterY = y + totalItemHeight / 2;
              ctx.fillStyle = '#020617';
              ctx.font = `700 4.0px ${fontStack}`;
              ctx.textAlign = 'left';
              ctx.fillText(itemNumStr, itemNumberX, itemNumberCenterY + 1.2);
              
              // Advance y for next item
              y += totalItemHeight + 5;
            });
          }

          y += 3.5;
        });

        // Page Number Footer (Only if multi-page)
        if (paginatedPages.length > 1) {
          ctx.textAlign = 'right';
          ctx.fillStyle = '#94a3b8';
          ctx.font = `400 3.2px ${fontStack}`;
          ctx.fillText(`Page ${page.pageNumber} of ${paginatedPages.length}`, MARGIN_LEFT + CONTENT_W - 2, PAGE_H - 6);
        }

        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, PAGE_W, PAGE_H);
      });

      // --- Optional Answer Key Pages ---
      if (showAnswerKey) {
        pdf.addPage();
        const { canvas, ctx } = createPageCanvas();
        let y = 18;

        ctx.fillStyle = '#020617';
        ctx.font = `700 5.2px ${fontStack}`;
        ctx.fillText('ANSWER KEY', 22, y);
        ctx.font = `400 3.6px ${fontStack}`;
        ctx.fillStyle = '#475569';
        ctx.fillText(`[${worksheet.header.chapter || 'Chapter'}]`, 22, y + 6);

        ctx.beginPath();
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 0.4;
        ctx.moveTo(22, y + 9);
        ctx.lineTo(22 + CONTENT_W, y + 9);
        ctx.stroke();

        y += 18;

        worksheet.sections.forEach((section) => {
          ctx.fillStyle = '#020617';
          ctx.font = `700 4.1px ${fontStack}`;
          ctx.fillText(`${section.title}`, 22, y);

          ctx.beginPath();
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 0.25;
          ctx.moveTo(22, y + 1.8);
          ctx.lineTo(22 + CONTENT_W, y + 1.8);
          ctx.stroke();
          y += 7.5;

          if (section.items && section.items.length > 0) {
            ctx.font = `400 3.8px ${fontStack}`;
            section.items.forEach((item, idx) => {
              const ans = item.answer || '(no answer)';
              const numStr = `${idx + 1}. `;
              ctx.fillStyle = '#020617';
              ctx.fillText(numStr, 26, y);

              ctx.fillStyle = '#1e293b';
              ctx.font = `600 3.8px ${fontStack}`;
              const lineW = ctx.measureText(numStr).width;
              const wrappedAns = wrapTextLines(ctx, ans, CONTENT_W - 10);
              wrappedAns.forEach((line, lIdx) => {
                ctx.fillText(line, 26 + (lIdx === 0 ? lineW : 0), y + lIdx * 5.1);
              });

              y += Math.max(wrappedAns.length * 5.1, 5.1) + 2.8;
              ctx.font = `400 3.8px ${fontStack}`;
            });
          }

          y += 4;
          if (y > PAGE_H - 24) {
            pdf.addPage();
            const newCanvas = createPageCanvas();
            pdf.addImage(newCanvas.canvas.toDataURL('image/png'), 'PNG', 0, 0, PAGE_W, PAGE_H);
            y = 18;
          }
        });

        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, PAGE_W, PAGE_H);
      }

      // Generate filename
      const fname =
        `${worksheet.header.chapter || 'Worksheet'}_${new Date().toISOString().split('T')[0]}.pdf`.replace(/[^a-z0-9_\-\.]/gi, '_');

      pdf.save(fname);
      showToast(`PDF saved as ${fname}`);
    } catch (err) {
      console.error('PDF Error:', err);
      showToast(`PDF Error: ${err.message}`, 'error');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  // --- Paginate on worksheet change ---
  const paginatedPages = useMemo(() => paginateWorksheet(worksheet), [worksheet]);

  // --- Update a section ---
  const updateSection = (sectionId, updates) => {
    setWorksheet((prev) => ({
      ...prev,
      sections: prev.sections.map((s) => (s.id === sectionId ? { ...s, ...updates } : s))
    }));
  };

  // --- Update an item within a section ---
  const updateItem = (sectionId, itemId, updates) => {
    setWorksheet((prev) => ({
      ...prev,
      sections: prev.sections.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              items: s.items.map((item) => (item.id === itemId ? { ...item, ...updates } : item))
            }
          : s
      )
    }));
  };

  // --- Add item to section ---
  const addItem = (sectionId) => {
    setWorksheet((prev) => ({
      ...prev,
      sections: prev.sections.map((s) => {
        if (s.id !== sectionId) return s;
        const newId = `item-${Date.now()}`;
        const newItem =
          s.type === 'true_false'
            ? { id: newId, prompt: 'Question here...', answer: 'True' }
            : s.type === 'matching'
            ? { id: newId, left: 'Left item', right: 'Right item', answer: '1 - a' }
            : s.type === 'word_meaning'
            ? { id: newId, word: 'word', meaning: 'definition', sentence: 'example' }
            : s.type === 'mcq'
            ? { id: newId, prompt: 'Question?', options: ['Option A', 'Option B'], answer: 'a' }
            : s.type === 'math_box'
            ? { id: newId, prompt: 'Problem:', boxHeight: 26, answer: '' }
            : s.type === 'passage_cloze'
            ? { id: newId, passage: 'The men worked ( patient / patiently ) under the hot sun. They were very ___________.', answer: 'patiently' }
            : s.type === 'tick_sentence'
            ? { id: newId, sentenceA: 'Sentence A here...', sentenceB: 'Sentence B here...', answer: 'A' }
            : { id: newId, prompt: 'Question...', answer: '', lines: 3 };
        return { ...s, items: [...s.items, newItem] };
      })
    }));
  };

  // --- Delete item ---
  const deleteItem = (sectionId, itemId) => {
    setWorksheet((prev) => ({
      ...prev,
      sections: prev.sections.map((s) =>
        s.id === sectionId ? { ...s, items: s.items.filter((item) => item.id !== itemId) } : s
      )
    }));
  };

  // --- Bulk paste handler ---
  const handleBulkPaste = () => {
    if (!bulkText.trim() || !bulkModalSectionId) return;
    const section = worksheet.sections.find((s) => s.id === bulkModalSectionId);
    if (!section) return;

    const lines = bulkText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const newItems = lines.map((line) => {
      const id = `item-${Date.now()}-${Math.random()}`;
      if (section.type === 'fill_blanks') {
        return { id, prompt: line, answer: '' };
      } else if (section.type === 'true_false') {
        return { id, prompt: line, answer: 'True' };
      } else if (section.type === 'short_qa') {
        return { id, prompt: line, answer: '', lines: 3 };
      } else if (section.type === 'mcq') {
        return { id, prompt: line, options: ['Option A', 'Option B'], answer: 'a' };
      } else if (section.type === 'matching') {
        const parts = line.split('|');
        return { id, left: parts[0]?.trim() || '', right: parts[1]?.trim() || '', answer: '1 - a' };
      } else if (section.type === 'word_meaning') {
        const parts = line.split('|');
        return { id, word: parts[0]?.trim() || '', meaning: parts[1]?.trim() || '', sentence: '' };
      } else if (section.type === 'passage_cloze') {
        return { id, passage: line, answer: '' };
      } else if (section.type === 'tick_sentence') {
        const parts = line.split('|');
        return { id, sentenceA: parts[0]?.trim() || '', sentenceB: parts[1]?.trim() || '', answer: 'A' };
      } else {
        return { id, prompt: line, answer: '', boxHeight: 26 };
      }
    });

    setWorksheet((prev) => ({
      ...prev,
      sections: prev.sections.map((s) =>
        s.id === bulkModalSectionId
          ? {
              ...s,
              items: [...s.items, ...newItems]
            }
          : s
      )
    }));

    setBulkModalSectionId(null);
    setBulkText('');
    showToast(`Added ${newItems.length} items`);
  };

  // --- Saved Worksheets Management Actions (with Firestore support) ---
  const handleUpdateSaved = async () => {
    if (!worksheet.header.chapter?.trim()) {
      showToast('Please set the chapter name first', 'error');
      return;
    }

    const updatedSheet = {
      ...worksheet,
      updatedAt: new Date().toISOString()
    };
    setWorksheet(updatedSheet);

    // Save to Firestore if admin and callback available
    if (isAdmin && onSaveToFirestore && typeof onSaveToFirestore === 'function') {
      const success = await onSaveToFirestore(updatedSheet);
      if (!success) return;
    }

    if (editingSavedId && savedChapters.some((s) => s.id === editingSavedId)) {
      setSavedChapters((prev) =>
        prev.map((s) => (s.id === editingSavedId ? updatedSheet : s))
      );
      showToast(`Updated "${worksheet.header.chapter}"`);
    } else {
      const newId = worksheet.id || `sheet-${Date.now()}`;
      const newSheet = { ...updatedSheet, id: newId };
      setWorksheet(newSheet);
      setEditingSavedId(newId);
      setSavedChapters((prev) => [newSheet, ...prev.filter((s) => s.id !== newId)]);
      showToast(`Saved "${worksheet.header.chapter}" to saved worksheets`);
    }
  };

  const handleSaveAsNew = async () => {
    if (!worksheet.header.chapter?.trim()) {
      showToast('Please set the chapter name first', 'error');
      return;
    }
    const newId = `sheet-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newSheet = {
      ...JSON.parse(JSON.stringify(worksheet)),
      id: newId,
      updatedAt: new Date().toISOString()
    };

    // Save to Firestore if admin and callback available
    if (isAdmin && onSaveToFirestore && typeof onSaveToFirestore === 'function') {
      const success = await onSaveToFirestore(newSheet);
      if (!success) return;
    }

    setWorksheet(newSheet);
    setEditingSavedId(newId);
    setSavedChapters((prev) => [newSheet, ...prev]);
    showToast(`Saved as new worksheet: "${newSheet.header.chapter}"`);
  };

  const loadAndEditWorksheet = (sheet) => {
    // Non-admins can load but cannot edit
    if (!isAdmin) {
      showToast('Read-only mode. Contact an admin to edit worksheets.', 'info');
    }

    const cloned = JSON.parse(JSON.stringify(sheet));
    const targetId = cloned.id || `sheet-${Date.now()}`;
    cloned.id = targetId;
    cloned.updatedAt = cloned.updatedAt || new Date().toISOString();
    setWorksheet(cloned);
    setEditingSavedId(targetId);
    setActiveTab(cloned.sections[0]?.id || 'sec-1');
    setIsSavedDrawerOpen(false);
    setMobileView('studio');
    showToast(`Loaded "${cloned.header?.chapter || 'Worksheet'}" for viewing`);
  };

  const duplicateSavedWorksheet = async (sheet) => {
    if (!isAdmin) {
      showToast('Only admins can duplicate worksheets', 'error');
      return;
    }

    const newId = `sheet-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const cloned = JSON.parse(JSON.stringify(sheet));
    const dupTitle = cloned.header?.chapter ? `${cloned.header.chapter} (Copy)` : 'Worksheet (Copy)';
    const duplicated = {
      ...cloned,
      id: newId,
      updatedAt: new Date().toISOString(),
      header: {
        ...cloned.header,
        chapter: dupTitle
      }
    };

    // Save to Firestore if callback available
    if (onSaveToFirestore && typeof onSaveToFirestore === 'function') {
      const success = await onSaveToFirestore(duplicated);
      if (!success) return;
    }

    setSavedChapters((prev) => [duplicated, ...prev]);
    showToast(`Duplicated: "${dupTitle}"`);
  };

  const deleteSavedWorksheet = async (id) => {
    if (!isAdmin) {
      showToast('Only admins can delete worksheets', 'error');
      return;
    }

    // Delete from Firestore if callback available
    if (onDeleteFromFirestore && typeof onDeleteFromFirestore === 'function') {
      const success = await onDeleteFromFirestore(id);
      if (!success) return;
    }

    setSavedChapters((prev) => prev.filter((w) => w.id !== id));
    if (editingSavedId === id) {
      setEditingSavedId(null);
    }
    setDeleteConfirmId(null);
    showToast('Worksheet deleted');
  };

  const handleCreateNewWorksheet = () => {
    const newId = `sheet-${Date.now()}`;
    const blankSheet = {
      id: newId,
      updatedAt: new Date().toISOString(),
      header: {
        title: 'HOMEWORK PRACTICE SHEET',
        studentName: worksheet.header?.studentName || 'Wafi',
        grade: worksheet.header?.grade || 'Grade 3',
        subject: worksheet.header?.subject || 'Science',
        chapter: 'New Practice Chapter'
      },
      sections: [
        {
          id: `sec-${Date.now()}`,
          type: 'short_qa',
          title: 'A. Answer the following questions in short.',
          items: [
            {
              id: `qa-${Date.now()}`,
              prompt: 'Enter question here...',
              lines: 3,
              answer: ''
            }
          ]
        }
      ]
    };
    setWorksheet(blankSheet);
    setEditingSavedId(newId);
    setActiveTab(blankSheet.sections[0].id);
    setSavedChapters((prev) => [blankSheet, ...prev]);
    setIsSavedDrawerOpen(false);
    setMobileView('studio');
    showToast('Created new blank worksheet and added to Saved Sheets');
  };

  const exportBackupJson = () => {
    try {
      const backupData = {
        appName: 'WafiWorksheetBuilder',
        backupVersion: 1,
        exportedAt: new Date().toISOString(),
        totalWorksheets: savedChapters.length,
        worksheets: savedChapters
      };
      const dataStr = JSON.stringify(backupData, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const dateStr = new Date().toISOString().split('T')[0];
      a.download = `wafi_worksheets_backup_${dateStr}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast(`Exported backup with ${savedChapters.length} worksheet(s)`);
    } catch (err) {
      console.error('Backup export error:', err);
      showToast('Failed to export backup file', 'error');
    }
  };

  const handleImportBackup = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const raw = JSON.parse(evt.target?.result);
        let incoming = [];
        if (raw && Array.isArray(raw.worksheets)) {
          incoming = raw.worksheets;
        } else if (Array.isArray(raw)) {
          incoming = raw;
        } else if (raw && raw.header && raw.sections) {
          incoming = [raw];
        }

        if (!incoming || incoming.length === 0) {
          showToast('No valid worksheets found in JSON file', 'error');
          return;
        }

        const validated = incoming.map((item, idx) => ({
          ...item,
          id: item.id || `sheet-import-${Date.now()}-${idx}`,
          updatedAt: item.updatedAt || new Date().toISOString(),
          header: {
            title: item.header?.title || 'HOMEWORK PRACTICE SHEET',
            studentName: item.header?.studentName || 'Wafi',
            grade: item.header?.grade || 'Grade 3',
            subject: item.header?.subject || 'General',
            chapter: item.header?.chapter || `Imported Sheet ${idx + 1}`
          },
          sections: Array.isArray(item.sections) ? item.sections : []
        }));

        setSavedChapters((prev) => {
          const map = new Map();
          prev.forEach((p) => map.set(p.id, p));
          validated.forEach((v) => map.set(v.id, v));
          return Array.from(map.values());
        });

        showToast(`Successfully imported ${validated.length} worksheet(s)`);
      } catch (err) {
        console.error('Backup import error:', err);
        showToast('Invalid JSON file format', 'error');
      } finally {
        if (backupFileInputRef.current) {
          backupFileInputRef.current.value = '';
        }
      }
    };
    reader.readAsText(file);
  };

  // Backwards compatible aliases
  const saveToBank = handleUpdateSaved;
  const deleteFromBank = deleteSavedWorksheet;
  const loadFromBank = loadAndEditWorksheet;

  // --- Export/Import Handlers ---
  const exportAsJson = () => {
    const data = JSON.stringify(worksheet, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${worksheet.header.chapter || 'worksheet'}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Downloaded as JSON');
  };

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = JSON.parse(evt.target?.result);
        if (data.header && data.sections) {
          setWorksheet(data);
          setActiveTab(data.sections[0]?.id || 'sec-1');
          showToast('Imported successfully');
        } else {
          showToast('Invalid worksheet format', 'error');
        }
      } catch {
        showToast('Failed to parse file', 'error');
      }
    };
    reader.readAsText(file);
  };

  const fontStack =
    paperFontStyle === 'serif'
      ? "'Crimson Pro', 'Hind Siliguri', Georgia, serif"
      : "'Plus Jakarta Sans', 'Hind Siliguri', Arial, sans-serif";

  // --- Main Render ---
  return (
    <div className="flex h-screen flex-col bg-gradient-to-br from-slate-50 to-slate-100 font-sans">
      {/* CONSOLIDATED HEADER */}
      <div className="border-b border-slate-200 bg-white shadow-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Back Button */}
            {onBack && (
              <button
                onClick={onBack}
                className="inline-flex items-center justify-center rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 transition-colors shrink-0"
                title="Go back to homework"
                aria-label="Back to homework"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            {/* Title with Book Icon */}
            <BookMarked className="h-6 w-6 text-indigo-600 shrink-0" />
            <h1 className="text-lg sm:text-2xl font-bold text-slate-900 truncate">Wafi Worksheet Builder</h1>
            {/* Editing Status Badge */}
            {activeSavedSheet && (
              <span className="hidden xl:inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 truncate max-w-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Editing: {worksheet.header.chapter || 'Worksheet'}
              </span>
            )}
            {/* Sync Status Badge */}
            {isLoading ? (
              <div className="hidden md:flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium shrink-0">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <span>Syncing...</span>
              </div>
            ) : isAdmin ? (
              <div className="hidden md:flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium shrink-0">
                {isOnline ? (
                  <>
                    <Cloud className="w-3 h-3" />
                    <span>Cloud Synced</span>
                  </>
                ) : (
                  <>
                    <CloudOff className="w-3 h-3" />
                    <span>Offline</span>
                  </>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-1 px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-medium shrink-0">
                <Eye className="w-3 h-3" />
                <span>Read-Only</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* SAVED SHEETS BUTTON */}
            <button
              onClick={() => setIsSavedDrawerOpen(true)}
              className="flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50/90 px-3 py-2 text-xs sm:text-sm font-semibold text-indigo-700 hover:bg-indigo-100 hover:border-indigo-300 transition-all shadow-2xs"
              title="View and manage all saved worksheets"
            >
              <FolderOpen className="h-4 w-4 text-indigo-600" />
              <span className="hidden xs:inline">Saved Sheets</span>
              <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-xs font-bold text-white leading-none">
                {savedChapters.length}
              </span>
            </button>

            <button
              onClick={() => setShowHeaderSettings(!showHeaderSettings)}
              className="rounded-lg border border-slate-300 px-2.5 sm:px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              title="Edit worksheet header"
            >
              Header
            </button>
            <button
              onClick={() => setShowAnswerKey(!showAnswerKey)}
              className={`flex items-center gap-1.5 rounded-lg border px-2.5 sm:px-3 py-2 text-xs sm:text-sm font-medium transition-colors ${
                showAnswerKey
                  ? 'border-amber-500 bg-amber-50 text-amber-800'
                  : 'border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
              title="Toggle Answer Key inclusion in preview and PDF"
            >
              {showAnswerKey ? <Eye className="h-4 w-4 text-amber-600" /> : <EyeOff className="h-4 w-4" />}
              <span className="hidden sm:inline">Answer Key</span>
            </button>
            <button
              onClick={handlePrintWorksheet}
              className="flex items-center gap-1.5 rounded-lg bg-slate-700 px-3 sm:px-3.5 py-2 text-white text-xs sm:text-sm font-medium hover:bg-slate-800 transition-colors"
              title="Print using browser dialog"
            >
              <Printer className="h-4 w-4" />
              <span className="hidden sm:inline">Print</span>
            </button>
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 sm:px-4 py-2 text-white text-xs sm:text-sm font-medium hover:bg-indigo-700 disabled:bg-slate-400 transition-colors"
              title="Download as crisp A4 PDF"
            >
              <Download className="h-4 w-4" />
              <span>{isDownloadingPdf ? 'Generating...' : 'PDF'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* TOAST */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 rounded-lg px-4 py-3 text-white font-medium shadow-lg transition-all ${
            toast.type === 'error' ? 'bg-red-500' : 'bg-green-600'
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* MOBILE VIEW TOGGLE */}
      <div className="lg:hidden border-b border-slate-200 bg-white px-4 py-2">
        <div className="flex gap-2">
          <button
            onClick={() => setMobileView('studio')}
            className={`flex-1 rounded px-3 py-2 text-sm font-medium ${
              mobileView === 'studio' ? 'bg-indigo-600 text-white' : 'border border-slate-300 text-slate-700'
            }`}
          >
            Studio
          </button>
          <button
            onClick={() => setMobileView('preview')}
            className={`flex-1 rounded px-3 py-2 text-sm font-medium ${
              mobileView === 'preview' ? 'bg-indigo-600 text-white' : 'border border-slate-300 text-slate-700'
            }`}
          >
            Preview
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex flex-1 overflow-hidden">
        {/* STUDIO PANEL (Admin Edit Mode) */}
        {isAdmin ? (
          <div
            className={`w-full lg:w-2/5 overflow-y-auto border-r border-slate-200 bg-white p-6 lg:block ${
              mobileView !== 'studio' ? 'hidden' : ''
            }`}
          >
          {/* ACTIVE EDITING BANNER & SAVE ACTIONS */}
          {activeSavedSheet ? (
            <div className="mb-5 rounded-xl border border-indigo-200 bg-gradient-to-r from-indigo-50/90 via-white to-purple-50/60 p-3.5 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white shadow-xs shrink-0">
                    <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                    Editing:
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-indigo-700">
                      {worksheet.header.subject || 'Worksheet'}
                    </p>
                    <p className="text-sm font-bold text-slate-900 truncate" title={worksheet.header.chapter}>
                      {worksheet.header.chapter || 'Untitled Worksheet'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleUpdateSaved}
                    className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-700 shadow-xs transition-colors"
                    title="Overwrite and update the existing saved worksheet"
                  >
                    <Save className="h-3.5 w-3.5" />
                    <span>Update Saved</span>
                  </button>
                  <button
                    onClick={handleSaveAsNew}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-400 shadow-2xs transition-colors"
                    title="Save as a brand-new copy"
                  >
                    <Copy className="h-3.5 w-3.5 text-slate-500" />
                    <span>Save as New</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-5 rounded-xl border border-slate-200 bg-slate-50 p-3.5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="inline-flex items-center rounded-full bg-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 shrink-0">
                  Unsaved Sheet
                </span>
                <p className="text-sm font-bold text-slate-800 truncate">
                  {worksheet.header.chapter || 'Untitled Worksheet'}
                </p>
              </div>
              <button
                onClick={handleSaveAsNew}
                className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-700 shadow-xs transition-colors shrink-0"
              >
                <Save className="h-3.5 w-3.5" />
                <span>Save to Saved Sheets</span>
              </button>
            </div>
          )}
          {showHeaderSettings && (
            <div className="mb-6 rounded-lg border border-indigo-200 bg-indigo-50/70 p-4">
              <h3 className="mb-3 font-bold text-slate-900">Header Settings</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Title</label>
                  <input
                    type="text"
                    value={worksheet.header.title}
                    onChange={(e) =>
                      setWorksheet({ ...worksheet, header: { ...worksheet.header, title: e.target.value } })
                    }
                    className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Student Name</label>
                    <input
                      type="text"
                      value={worksheet.header.studentName}
                      onChange={(e) =>
                        setWorksheet({ ...worksheet, header: { ...worksheet.header, studentName: e.target.value } })
                      }
                      className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Grade / Class</label>
                    <input
                      type="text"
                      value={worksheet.header.grade}
                      onChange={(e) =>
                        setWorksheet({ ...worksheet, header: { ...worksheet.header, grade: e.target.value } })
                      }
                      className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Subject</label>
                    <input
                      type="text"
                      value={worksheet.header.subject}
                      onChange={(e) =>
                        setWorksheet({ ...worksheet, header: { ...worksheet.header, subject: e.target.value } })
                      }
                      className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Chapter / Topic</label>
                    <input
                      type="text"
                      value={worksheet.header.chapter}
                      onChange={(e) =>
                        setWorksheet({ ...worksheet, header: { ...worksheet.header, chapter: e.target.value } })
                      }
                      className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ADD SECTION BUTTONS */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Add New Section
            </label>
            <div className="flex flex-wrap gap-1.5">
              {SECTION_TYPES.map((st) => {
                const IconComp = st.icon;
                return (
                  <button
                    key={st.id}
                    onClick={() => addSection(st.id)}
                    className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:border-indigo-500 hover:text-indigo-600 transition-colors shadow-2xs"
                  >
                    <IconComp className="h-3.5 w-3.5 text-indigo-500" />
                    <span>+ {st.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION EDITOR TABS */}
          <div className="mb-4 flex flex-wrap items-center gap-1.5 border-b border-slate-200 pb-2">
            {worksheet.sections.map((section, sIdx) => (
              <button
                key={section.id}
                onClick={() => setActiveTab(section.id)}
                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                  activeTab === section.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {String.fromCharCode(65 + sIdx)}. {section.title.replace(/^[A-Z]\.\s*/, '').slice(0, 14)}
              </button>
            ))}
            <button
              onClick={() => setActiveTab('manual')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                activeTab === 'manual'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Saved Sheets ({savedChapters.length})
            </button>
          </div>

          {/* SECTION EDITING */}
          {activeTab !== 'manual' && (
            <div className="space-y-6">
              {worksheet.sections.map((section) =>
                section.id === activeTab ? (
                  <div key={section.id} className="rounded-lg border border-slate-200 p-4">
                    <div className="mb-4 flex items-center justify-between gap-3 border-b border-slate-200 pb-3">
                      <div className="flex-1">
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                          Section Title
                        </label>
                        <input
                          type="text"
                          value={section.title}
                          onChange={(e) => updateSection(section.id, { title: e.target.value })}
                          className="w-full rounded border border-slate-300 px-3 py-1.5 text-sm font-bold text-slate-900 focus:border-indigo-500 focus:outline-none"
                        />
                      </div>
                      <button
                        onClick={() => deleteSection(section.id)}
                        className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50 mt-4 transition-colors"
                        title="Delete this section"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {section.items.map((item, idx) => (
                      <div key={item.id} className="mb-4 rounded-lg bg-slate-50 p-3 text-sm">
                        <div className="mb-2 flex items-start justify-between gap-2">
                          <span className="font-medium text-slate-700">Item {idx + 1}</span>
                          <button
                            onClick={() => deleteItem(section.id, item.id)}
                            className="text-red-600 hover:text-red-700"
                            title="Delete item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        {section.type === 'matching' && (
                          <>
                            <input
                              type="text"
                              placeholder="Column A item..."
                              value={item.left || ''}
                              onChange={(e) => updateItem(section.id, item.id, { left: e.target.value })}
                              className="mb-2 block w-full rounded border border-slate-300 px-2 py-1 text-xs"
                            />
                            <input
                              type="text"
                              placeholder="Column B item..."
                              value={item.right || ''}
                              onChange={(e) => updateItem(section.id, item.id, { right: e.target.value })}
                              className="mb-2 block w-full rounded border border-slate-300 px-2 py-1 text-xs"
                            />
                          </>
                        )}

                        {section.type === 'word_meaning' && (
                          <>
                            <input
                              type="text"
                              placeholder="Word..."
                              value={item.word || ''}
                              onChange={(e) => updateItem(section.id, item.id, { word: e.target.value })}
                              className="mb-2 block w-full rounded border border-slate-300 px-2 py-1 text-xs"
                            />
                            <input
                              type="text"
                              placeholder="Meaning..."
                              value={item.meaning || ''}
                              onChange={(e) => updateItem(section.id, item.id, { meaning: e.target.value })}
                              className="mb-2 block w-full rounded border border-slate-300 px-2 py-1 text-xs"
                            />
                            <input
                              type="text"
                              placeholder="Example sentence..."
                              value={item.sentence || ''}
                              onChange={(e) => updateItem(section.id, item.id, { sentence: e.target.value })}
                              className="mb-2 block w-full rounded border border-slate-300 px-2 py-1 text-xs"
                            />
                          </>
                        )}

                        {section.type === 'tick_sentence' && (
                          <>
                            <div className="mb-2">
                              <label className="block text-xs font-semibold text-slate-600 mb-1">Sentence A</label>
                              <textarea
                                placeholder="Enter first sentence..."
                                value={item.sentenceA || ''}
                                onChange={(e) => updateItem(section.id, item.id, { sentenceA: e.target.value })}
                                className="w-full rounded border border-slate-300 px-2 py-1 text-xs"
                                rows={2}
                              />
                            </div>
                            <div className="mb-2">
                              <label className="block text-xs font-semibold text-slate-600 mb-1">Sentence B</label>
                              <textarea
                                placeholder="Enter second sentence..."
                                value={item.sentenceB || ''}
                                onChange={(e) => updateItem(section.id, item.id, { sentenceB: e.target.value })}
                                className="w-full rounded border border-slate-300 px-2 py-1 text-xs"
                                rows={2}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-600 mb-1">Correct Sentence</label>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => updateItem(section.id, item.id, { answer: 'A' })}
                                  className={`flex-1 rounded px-2 py-1 text-xs font-semibold transition-colors ${
                                    item.answer === 'A'
                                      ? 'bg-indigo-600 text-white'
                                      : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                                  }`}
                                >
                                  A
                                </button>
                                <button
                                  onClick={() => updateItem(section.id, item.id, { answer: 'B' })}
                                  className={`flex-1 rounded px-2 py-1 text-xs font-semibold transition-colors ${
                                    item.answer === 'B'
                                      ? 'bg-indigo-600 text-white'
                                      : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                                  }`}
                                >
                                  B
                                </button>
                              </div>
                            </div>
                          </>
                        )}

                        {section.type === 'mcq' && (
                          <>
                            <textarea
                              placeholder="Question..."
                              value={item.prompt || ''}
                              onChange={(e) => updateItem(section.id, item.id, { prompt: e.target.value })}
                              className="mb-2 block w-full rounded border border-slate-300 px-2 py-1 text-xs"
                              rows={2}
                            />
                            <div className="space-y-1 mb-2">
                              {(item.options || []).map((opt, oIdx) => (
                                <input
                                  key={oIdx}
                                  type="text"
                                  placeholder={`Option ${String.fromCharCode(97 + oIdx)}`}
                                  value={opt}
                                  onChange={(e) => {
                                    const newOpts = [...(item.options || [])];
                                    newOpts[oIdx] = e.target.value;
                                    updateItem(section.id, item.id, { options: newOpts });
                                  }}
                                  className="mb-1 block w-full rounded border border-slate-300 px-2 py-1 text-xs"
                                />
                              ))}
                            </div>
                            <button
                              onClick={() => {
                                const newOpts = [...(item.options || []), ''];
                                updateItem(section.id, item.id, { options: newOpts });
                              }}
                              className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                            >
                              + Add option
                            </button>
                          </>
                        )}

                        {section.type === 'math_box' && (
                          <>
                            <textarea
                              placeholder="Problem..."
                              value={item.prompt || ''}
                              onChange={(e) => updateItem(section.id, item.id, { prompt: e.target.value })}
                              className="mb-2 block w-full rounded border border-slate-300 px-2 py-1 text-xs"
                              rows={2}
                            />
                            <input
                              type="number"
                              placeholder="Box height (mm)"
                              value={item.boxHeight || 26}
                              onChange={(e) =>
                                updateItem(section.id, item.id, { boxHeight: parseInt(e.target.value, 10) || 26 })
                              }
                              className="mb-2 block w-full rounded border border-slate-300 px-2 py-1 text-xs"
                            />
                          </>
                        )}

                        {section.type === 'passage_cloze' && (
                          <div className="space-y-2 mb-2">
                            <div>
                              <label className="block text-xs font-semibold text-slate-600 mb-1">Passage Text</label>
                              <textarea
                                placeholder="Paste or type the passage here. Use (word1 / word2) for bracket choices or ____ for blanks. Example: The men worked (patient / patiently) under the hot sun..."
                                value={item.passage || ''}
                                onChange={(e) => updateItem(section.id, item.id, { passage: e.target.value })}
                                className="mb-2 block w-full rounded border border-slate-300 px-2 py-1 text-xs"
                                rows={6}
                              />
                            </div>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  const textarea = document.getElementById(`passage-${item.id}`);
                                  const currentText = item.passage || '';
                                  const blank = '______';
                                  if (textarea) {
                                    const start = textarea.selectionStart ?? currentText.length;
                                    const end = textarea.selectionEnd ?? currentText.length;
                                    const newText = currentText.slice(0, start) + blank + currentText.slice(end);
                                    updateItem(section.id, item.id, { passage: newText });
                                    setTimeout(() => {
                                      textarea.focus();
                                      textarea.setSelectionRange(start + blank.length, start + blank.length);
                                    }, 0);
                                  } else {
                                    updateItem(section.id, item.id, { passage: currentText ? `${currentText} ${blank}` : blank });
                                  }
                                }}
                                className="inline-flex items-center gap-1 rounded bg-indigo-50 px-2 py-1 text-[11px] font-semibold text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition-colors shadow-2xs"
                                title="Insert blank (6 underscores)"
                              >
                                <Plus className="h-3 w-3" />
                                <span>Insert Blank</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const textarea = document.getElementById(`passage-${item.id}`);
                                  const currentText = item.passage || '';
                                  const bracket = ' ( / ) ';
                                  if (textarea) {
                                    const start = textarea.selectionStart ?? currentText.length;
                                    const end = textarea.selectionEnd ?? currentText.length;
                                    const newText = currentText.slice(0, start) + bracket + currentText.slice(end);
                                    updateItem(section.id, item.id, { passage: newText });
                                    setTimeout(() => {
                                      textarea.focus();
                                      textarea.setSelectionRange(start + 3, start + 3);
                                    }, 0);
                                  } else {
                                    updateItem(section.id, item.id, { passage: currentText ? `${currentText} ${bracket}` : bracket });
                                  }
                                }}
                                className="inline-flex items-center gap-1 rounded bg-indigo-50 px-2 py-1 text-[11px] font-semibold text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition-colors shadow-2xs"
                                title="Insert bracket choice ( / )"
                              >
                                <Plus className="h-3 w-3" />
                                <span>Insert Bracket ( / )</span>
                              </button>
                            </div>
                          </div>
                        )}

                        {section.type === 'fill_blanks' && (
                          <div className="mb-1.5 flex items-center justify-between text-xs">
                            <span className="text-[11px] text-slate-500">
                              Tip: Type underscores <code>___</code> for blanks (more = wider)
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const textarea = document.getElementById(`prompt-fb-${item.id}`);
                                const currentText = item.prompt || '';
                                const blank = '____________';
                                if (textarea) {
                                  const start = textarea.selectionStart ?? currentText.length;
                                  const end = textarea.selectionEnd ?? currentText.length;
                                  const newText = currentText.slice(0, start) + blank + currentText.slice(end);
                                  updateItem(section.id, item.id, { prompt: newText });
                                  setTimeout(() => {
                                    textarea.focus();
                                    textarea.setSelectionRange(start + blank.length, start + blank.length);
                                  }, 0);
                                } else {
                                  updateItem(section.id, item.id, { prompt: currentText ? `${currentText} ${blank}` : blank });
                                }
                              }}
                              className="inline-flex items-center gap-1 rounded bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition-colors shadow-2xs"
                              title="Insert 12 underscores at cursor"
                            >
                              <Plus className="h-3 w-3" />
                              <span>Insert Blank</span>
                            </button>
                          </div>
                        )}

                        {!['matching', 'word_meaning', 'mcq', 'math_box', 'passage_cloze', 'tick_sentence'].includes(section.type) && (
                          <textarea
                            id={section.type === 'fill_blanks' ? `prompt-fb-${item.id}` : undefined}
                            placeholder={
                              section.type === 'fill_blanks'
                                ? 'Question with blank (e.g. Water exists in ____________ states)...'
                                : 'Question / Prompt...'
                            }
                            value={item.prompt || ''}
                            onChange={(e) => updateItem(section.id, item.id, { prompt: e.target.value })}
                            className="mb-2 block w-full rounded border border-slate-300 px-2 py-1 text-xs"
                            rows={2}
                          />
                        )}

                        {section.type === 'short_qa' && (
                          <input
                            type="number"
                            min="1"
                            max="10"
                            placeholder="Lines"
                            value={item.lines || 3}
                            onChange={(e) =>
                              updateItem(section.id, item.id, { lines: parseInt(e.target.value, 10) || 3 })
                            }
                            className="mb-2 block w-full rounded border border-slate-300 px-2 py-1 text-xs"
                          />
                        )}

                        <textarea
                          placeholder="Answer (for answer key)..."
                          value={item.answer || ''}
                          onChange={(e) => updateItem(section.id, item.id, { answer: e.target.value })}
                          className="block w-full rounded border border-slate-300 px-2 py-1 text-xs"
                          rows={2}
                        />
                      </div>
                    ))}

                    <div className="space-y-2 border-t border-slate-200 pt-4">
                      <button
                        onClick={() => addItem(section.id)}
                        className="w-full rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
                      >
                        <Plus className="mr-2 inline h-4 w-4" />
                        Add Item
                      </button>
                      <button
                        onClick={() => setBulkModalSectionId(section.id)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <ClipboardPaste className="mr-2 inline h-4 w-4" />
                        Bulk Paste
                      </button>
                      <button
                        onClick={handleUpdateSaved}
                        className="w-full rounded-lg border border-indigo-200 bg-indigo-50/70 px-3 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors"
                      >
                        <Save className="mr-2 inline h-4 w-4" />
                        {activeSavedSheet ? 'Update Saved Worksheet' : 'Save Worksheet'}
                      </button>
                    </div>
                  </div>
                ) : null
              )}
            </div>
          )}

          {/* SAVED WORKSHEETS TAB VIEW */}
          {activeTab === 'manual' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-base">Saved Worksheets</h3>
                    <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-bold text-indigo-700">
                      {savedChapters.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCreateNewWorksheet}
                      className="rounded-lg bg-indigo-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors"
                      title="Create a new blank worksheet"
                    >
                      + New Sheet
                    </button>
                    <button
                      onClick={() => setIsSavedDrawerOpen(true)}
                      className="rounded-lg border border-slate-300 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                      title="Open full Saved Sheets window"
                    >
                      Full View
                    </button>
                  </div>
                </div>

                {/* SEARCH INPUT */}
                <div className="relative mb-3">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search saved sheets..."
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-7 py-1 text-xs text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>

                {/* BACKUP BUTTONS */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <button
                    onClick={exportBackupJson}
                    className="flex items-center justify-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors shadow-2xs"
                    title="Export all saved worksheets as JSON backup"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Export Backup (.json)</span>
                  </button>
                  <button
                    onClick={() => backupFileInputRef.current?.click()}
                    className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
                    title="Import worksheets from JSON backup"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    <span>Import Backup (.json)</span>
                  </button>
                </div>

                {/* SAVED CARDS */}
                {filteredSavedWorksheets.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-500">
                    {searchQuery ? `No sheets matching "${searchQuery}"` : 'No saved worksheets yet.'}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredSavedWorksheets.map((chap) => {
                      const isCurrentlyActive = chap.id === editingSavedId;
                      const totalItems = countWorksheetItems(chap);
                      const isConfirmingDelete = deleteConfirmId === chap.id;

                      return (
                        <div
                          key={chap.id}
                          className={`rounded-lg border p-3 text-sm transition-all ${
                            isCurrentlyActive
                              ? 'border-indigo-400 bg-indigo-50/30 ring-1 ring-indigo-200'
                              : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
                          }`}
                        >
                          {/* CARD HEADER */}
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="inline-flex rounded bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                              {chap.header?.subject || 'General'}
                            </span>
                            {isCurrentlyActive && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                Active in Editor
                              </span>
                            )}
                          </div>

                          <p className="font-bold text-slate-900 leading-snug mb-1">
                            {chap.header?.chapter || 'Untitled Worksheet'}
                          </p>

                          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500 mb-2.5">
                            <span>{chap.sections?.length || 0} sections ({totalItems} items)</span>
                            <span>•</span>
                            <span>{formatLastModified(chap.updatedAt)}</span>
                          </div>

                          {/* ACTION BUTTONS */}
                          <div className="border-t border-slate-200/60 pt-2">
                            {isConfirmingDelete ? (
                              <div className="flex items-center justify-between gap-2 bg-red-50 p-1.5 rounded border border-red-200">
                                <span className="text-[11px] font-semibold text-red-700">Delete this worksheet?</span>
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => deleteSavedWorksheet(chap.id)}
                                    className="rounded bg-red-600 px-2 py-0.5 text-[11px] font-bold text-white hover:bg-red-700"
                                  >
                                    Yes
                                  </button>
                                  <button
                                    onClick={() => setDeleteConfirmId(null)}
                                    className="rounded border border-slate-300 bg-white px-2 py-0.5 text-[11px] text-slate-700"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between gap-1">
                                <button
                                  onClick={() => loadAndEditWorksheet(chap)}
                                  className="flex-1 flex items-center justify-center gap-1 rounded bg-indigo-600 px-2 py-1 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors"
                                  title="Load and edit this worksheet"
                                >
                                  <FolderOpen className="h-3 w-3" />
                                  <span>Load & Edit</span>
                                </button>
                                <button
                                  onClick={() => duplicateSavedWorksheet(chap)}
                                  className="flex items-center gap-1 rounded border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                                  title="Create an editable duplicate copy"
                                >
                                  <Copy className="h-3 w-3 text-slate-500" />
                                  <span>Duplicate</span>
                                </button>
                                <button
                                  onClick={() => setDeleteConfirmId(chap.id)}
                                  className="flex items-center gap-1 rounded border border-red-200 bg-white px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                                  title="Delete worksheet"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* SINGLE WORKSHEET IMPORT / EXPORT */}
              <div className="flex gap-2">
                <button
                  onClick={exportAsJson}
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Download className="mr-1.5 inline h-3.5 w-3.5" />
                  Active as JSON
                </button>
                <button
                  onClick={() => importFileRef.current?.click()}
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Upload className="mr-1.5 inline h-3.5 w-3.5" />
                  Import JSON
                </button>
              </div>
              <input ref={importFileRef} type="file" accept=".json" onChange={handleImportFile} className="hidden" />
            </div>
          )}
        </div>
        ) : (
          // READ-ONLY MODE FOR NON-ADMINS
          <div
            className={`w-full lg:w-2/5 overflow-y-auto border-r border-slate-200 bg-white p-6 lg:block ${
              mobileView !== 'studio' ? 'hidden' : ''
            }`}
          >
            <div className="flex items-center gap-3 mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <Eye className="h-5 w-5 text-blue-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-blue-900 text-sm">View-Only Mode</p>
                <p className="text-xs text-blue-700 mt-1">You can view and print worksheets. Contact an admin to edit.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-2">Saved Worksheets</label>
                {savedChapters.length === 0 ? (
                  <p className="text-sm text-slate-500 italic">No worksheets available</p>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {savedChapters.map((sheet) => (
                      <button
                        key={sheet.id}
                        onClick={() => loadAndEditWorksheet(sheet)}
                        className="w-full p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 text-left transition-colors"
                      >
                        <p className="font-semibold text-sm text-slate-900 truncate">
                          {sheet.header?.chapter || 'Untitled'}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {sheet.header?.subject} • {countWorksheetItems(sheet)} items
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Updated: {formatLastModified(sheet.updatedAt)}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* PREVIEW PANEL */}
        <div
          className={`w-full lg:w-3/5 overflow-y-auto bg-slate-100 p-6 lg:block ${
            mobileView !== 'preview' ? 'hidden' : ''
          }`}
        >
          <div className="mx-auto max-w-2xl">
            {/* Font Style Toggle */}
            <div className="mb-4 flex justify-end gap-2">
              <button
                onClick={() => setPaperFontStyle('serif')}
                className={`rounded px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors ${
                  paperFontStyle === 'serif'
                    ? 'bg-indigo-600 text-white'
                    : 'border border-slate-300 text-slate-700 bg-white hover:bg-slate-50'
                }`}
              >
                Serif Font
              </button>
              <button
                onClick={() => setPaperFontStyle('sans')}
                className={`rounded px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors ${
                  paperFontStyle === 'sans'
                    ? 'bg-indigo-600 text-white'
                    : 'border border-slate-300 text-slate-700 bg-white hover:bg-slate-50'
                }`}
              >
                Sans Font
              </button>
            </div>

            {/* Print Area */}
            <div ref={printAreaRef} style={{ fontFamily: fontStack }} className="space-y-6">
              {paginatedPages.map((page) => (
                <div key={page.pageNumber} className="a4-sheet break-inside-avoid rounded-lg bg-white p-6 shadow-lg">
                  <div>
                    {page.pageNumber === 1 && (
                      <div className="border-2 border-slate-900 p-4 mb-4">
                        <p className="sheet-header-title text-center text-xs sm:text-sm uppercase tracking-widest font-semibold text-slate-600">
                          {worksheet.header.title}
                        </p>
                        <h2 className="sheet-header-chapter text-center text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                          {worksheet.header.chapter}
                        </h2>
                        <div className="my-2 border-b border-slate-400"></div>
                        <div className="grid grid-cols-3 gap-4 text-xs">
                          <div className="flex items-baseline gap-2">
                            <span className="font-bold">Name:</span>
                            <span className="border-dotted flex-1 border-b border-slate-500">
                              {worksheet.header.studentName ? ` ${worksheet.header.studentName}` : ''}
                            </span>
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="font-bold">Class:</span>
                            <span className="border-dotted flex-1 border-b border-slate-500">
                              {worksheet.header.grade ? ` ${worksheet.header.grade}` : ''}
                            </span>
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="font-bold">Subject:</span>
                            <span className="border-dotted flex-1 border-b border-slate-500 font-bold">
                              {worksheet.header.subject ? ` ${worksheet.header.subject}` : ''}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {page.sections.map((section) => (
                      <section key={section.id} className="mb-5">
                        <div className="border-b border-slate-400">
                          <h4 className="text-base font-bold">
                            {section.title}
                            {section.isContinuation && (
                              <span className="text-xs italic font-normal text-slate-500"> (continued)</span>
                            )}
                          </h4>
                        </div>

                        {/* 1. Fill in the Blanks */}
                        {section.type === 'fill_blanks' && (
                          <ol className="fill-blanks-list text-[16px]">
                            {section.items.map((item, idx) => {
                              const hasBlanks = /_+/.test(item.prompt || '');
                              return (
                                <li
                                  key={item.id}
                                  className="fill-blanks-item flex items-baseline gap-3 mb-4 leading-[2.6]"
                                >
                                  <span className="font-bold shrink-0">{section.startIndex + idx + 1}.</span>
                                  {hasBlanks ? (
                                    <span className="leading-[2.6]">
                                      {(item.prompt || '').split(/(_+)/g).map((part, pIdx) =>
                                        /^_+$/.test(part) ? (
                                          <span
                                            key={pIdx}
                                            aria-label="blank writing space"
                                            style={{
                                              width: `${Math.max(90, part.length * 14)}px`,
                                              maxWidth: '100%'
                                            }}
                                            className="inline-block border-b-2 border-slate-900 mx-1 align-baseline"
                                          />
                                        ) : (
                                          <span key={pIdx}>{part}</span>
                                        )
                                      )}
                                    </span>
                                  ) : (
                                    <span className="leading-[2.6]">{item.prompt}</span>
                                  )}
                                </li>
                              );
                            })}
                          </ol>
                        )}

                        {/* 2. True / False */}
                        {section.type === 'true_false' && (
                          <ol className="space-y-4 text-[16px]">
                            {section.items.map((item, idx) => (
                              <li key={item.id} className="flex items-baseline justify-between gap-3">
                                <div className="flex items-baseline gap-3">
                                  <span className="font-bold">{section.startIndex + idx + 1}.</span>
                                  <span>{item.prompt}</span>
                                </div>
                                <span
                                  aria-label="Write True or False"
                                  className="inline-block border-b-2 border-slate-900 w-24 shrink-0"
                                />
                              </li>
                            ))}
                          </ol>
                        )}

                        {/* 3. Match Column A & B */}
                        {section.type === 'matching' && (
                          <div className="text-[15.5px]" style={{ display: 'grid', gridTemplateColumns: '1fr 20px 1fr', gap: '20px', marginTop: '8px' }}>
                            {/* Left Box (Column A) */}
                            <div style={{ border: '1.5px solid #1e293b', borderRadius: '4px', overflow: 'hidden' }}>
                              {!section.isContinuation && (
                                <div className="matching-col-header" style={{ borderBottom: '1.5px solid #1e293b', background: '#f1f5f9', fontWeight: 700, textAlign: 'center', padding: '7px 10px' }}>Column A</div>
                              )}
                              <div>
                                {section.items.map((item, itemIdx) => (
                                  <div
                                    key={item.id}
                                    style={{
                                      background: '#ffffff',
                                      textAlign: 'center',
                                      padding: '7px 10px',
                                      borderTop: itemIdx === 0 ? '1.5px solid #1e293b' : 'none',
                                      borderBottom: itemIdx < section.items.length - 1 ? '1px solid #64748b' : 'none'
                                    }}
                                  >
                                    {item.left}
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Center Gap (Empty) */}
                            <div></div>

                            {/* Right Box (Column B) */}
                            <div style={{ border: '1.5px solid #1e293b', borderRadius: '4px', overflow: 'hidden' }}>
                              {!section.isContinuation && (
                                <div className="matching-col-header" style={{ borderBottom: '1.5px solid #1e293b', background: '#f1f5f9', fontWeight: 700, textAlign: 'center', padding: '7px 10px' }}>Column B</div>
                              )}
                              <div>
                                {section.items.map((item, itemIdx) => (
                                  <div
                                    key={item.id}
                                    style={{
                                      background: '#ffffff',
                                      textAlign: 'center',
                                      padding: '7px 10px',
                                      borderTop: itemIdx === 0 ? '1.5px solid #1e293b' : 'none',
                                      borderBottom: itemIdx < section.items.length - 1 ? '1px solid #64748b' : 'none'
                                    }}
                                  >
                                    {item.right}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 4. Word Meanings / Sentences */}
                        {section.type === 'word_meaning' && (
                          <div className="text-[15.5px]">
                            {!section.isContinuation && (
                              <div className="grid grid-cols-3 gap-2 mb-2 bg-slate-100 p-2 font-bold rounded">
                                <div>Word</div>
                                <div>Meaning</div>
                                <div>Make Sentence</div>
                              </div>
                            )}
                            <div className="space-y-1">
                              {section.items.map((item, idx) => (
                                <div key={item.id} className="grid grid-cols-3 gap-2 border border-slate-300 p-2 rounded">
                                  <div className="font-semibold">{section.startIndex + idx + 1}. {item.word}</div>
                                  <div className="text-slate-600">{item.meaning}</div>
                                  <div className="border-b border-dotted border-slate-400"></div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 5. Short / Broad Q&A */}
                        {section.type === 'short_qa' && (
                          <ol className="space-y-3 text-[16px]">
                            {section.items.map((item, idx) => (
                              <li key={item.id}>
                                <div className="flex items-baseline gap-3 mb-2">
                                  <span className="font-bold">{section.startIndex + idx + 1}.</span>
                                  <span>{item.prompt}</span>
                                </div>
                                {Array.from({ length: item.lines || 3 }).map((_, lIdx) => (
                                  <div key={lIdx} className="h-[11mm] border-b border-slate-400 mb-1"></div>
                                ))}
                              </li>
                            ))}
                          </ol>
                        )}

                        {/* 6. Multiple Choice (MCQ) */}
                        {section.type === 'mcq' && (
                          <ol className="space-y-3 text-[16px]">
                            {section.items.map((item, idx) => (
                              <li key={item.id}>
                                <div className="flex items-baseline gap-3 mb-1.5">
                                  <span className="font-bold">{section.startIndex + idx + 1}.</span>
                                  <span>{item.prompt}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 pl-6">
                                  {(item.options || []).map((opt, oIdx) => (
                                    <div key={oIdx} className="flex items-center gap-2">
                                      <span className="inline-block h-3.5 w-3.5 rounded-full border border-slate-900 shrink-0"></span>
                                      <span>({String.fromCharCode(97 + oIdx)}) {opt}</span>
                                    </div>
                                  ))}
                                </div>
                              </li>
                            ))}
                          </ol>
                        )}

                        {/* 7. Math / Work Box */}
                        {section.type === 'math_box' && (
                          <ol className="space-y-3 text-[16px]">
                            {section.items.map((item, idx) => (
                              <li key={item.id}>
                                <div className="flex items-baseline gap-3 mb-2">
                                  <span className="font-bold">{section.startIndex + idx + 1}.</span>
                                  <span>{item.prompt}</span>
                                </div>
                                <div
                                  style={{ height: `${item.boxHeight || 26}mm` }}
                                  className="relative ml-7 border border-slate-400 rounded p-2"
                                >
                                  <span className="absolute right-2 top-1 text-[10px] uppercase text-slate-400">
                                    Work / Answer
                                  </span>
                                </div>
                              </li>
                            ))}
                          </ol>
                        )}

                        {/* 8. Passage / Cloze */}
                        {section.type === 'passage_cloze' && (
                          <div className="text-[15.5px]">
                            {section.items.map((item) => {
                              const hasBrackets = /\(\s*[^/]+\s*\/\s*[^)]+\s*\)/g.test(item.passage || '');
                              const hasBlanks = /_+/.test(item.passage || '');
                              return (
                                <div key={item.id} className="mb-4 text-justify leading-[2.65] text-slate-800">
                                  {hasBrackets ? (
                                    // Render with bracket choices
                                    <span>
                                      {(item.passage || '').split(/(\(\s*[^/]+\s*\/\s*[^)]+\s*\))/g).map((part, pIdx) => {
                                        if (/^\(\s*[^/]+\s*\/\s*[^)]+\s*\)$/.test(part)) {
                                          const options = part
                                            .slice(1, -1)
                                            .split('/')
                                            .map((s) => s.trim());
                                          return (
                                            <span key={pIdx} className="font-semibold">
                                              {`( ${options.join(' / ')} )`}
                                            </span>
                                          );
                                        }
                                        return <span key={pIdx}>{part}</span>;
                                      })}
                                    </span>
                                  ) : hasBlanks ? (
                                    // Render with underline blanks
                                    <span>
                                      {(item.passage || '').split(/(_+)/g).map((part, pIdx) =>
                                        /^_+$/.test(part) ? (
                                          <span
                                            key={pIdx}
                                            aria-label="blank writing space"
                                            style={{
                                              width: `${Math.max(60, part.length * 12)}px`,
                                              maxWidth: '100%'
                                            }}
                                            className="inline-block border-b-2 border-slate-900 mx-1 align-baseline"
                                          />
                                        ) : (
                                          <span key={pIdx}>{part}</span>
                                        )
                                      )}
                                    </span>
                                  ) : (
                                    <span>{item.passage}</span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* 9. Tick Correct Sentence */}
                        {section.type === 'tick_sentence' && (
                          <ol className="text-[16px]" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                            {section.items.map((item, idx) => (
                              <li 
                                key={item.id} 
                                className="mb-6"
                                style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}
                              >
                                {/* Item Number (far left) */}
                                <span 
                                  className="font-bold"
                                  style={{ 
                                    minWidth: '20px',
                                    lineHeight: '1.35', 
                                    fontWeight: 700,
                                    color: '#020617'
                                  }}
                                >
                                  {section.startIndex + idx + 1}.
                                </span>
                                
                                {/* Right Stack: 2 independent horizontal rows */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                                  {/* Row A */}
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {/* Checkbox A */}
                                    <div 
                                      style={{
                                        width: '15px',
                                        height: '15px',
                                        border: '1.5px solid #0f172a',
                                        borderRadius: '2px',
                                        flexShrink: 0
                                      }}
                                    />
                                    {/* Label A */}
                                    <span 
                                      className="font-bold"
                                      style={{ 
                                        fontWeight: 700,
                                        color: '#020617',
                                        flexShrink: 0
                                      }}
                                    >
                                      A
                                    </span>
                                    {/* Sentence A */}
                                    <span 
                                      className="text-slate-800"
                                      style={{ 
                                        color: '#1e293b',
                                        lineHeight: '1.35'
                                      }}
                                    >
                                      {item.sentenceA}
                                    </span>
                                  </div>
                                  
                                  {/* Row B */}
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {/* Checkbox B */}
                                    <div 
                                      style={{
                                        width: '15px',
                                        height: '15px',
                                        border: '1.5px solid #0f172a',
                                        borderRadius: '2px',
                                        flexShrink: 0
                                      }}
                                    />
                                    {/* Label B */}
                                    <span 
                                      className="font-bold"
                                      style={{ 
                                        fontWeight: 700,
                                        color: '#020617',
                                        flexShrink: 0
                                      }}
                                    >
                                      B
                                    </span>
                                    {/* Sentence B */}
                                    <span 
                                      className="text-slate-800"
                                      style={{ 
                                        color: '#1e293b',
                                        lineHeight: '1.35'
                                      }}
                                    >
                                      {item.sentenceB}
                                    </span>
                                  </div>
                                </div>
                              </li>
                            ))}
                          </ol>
                        )}
                      </section>
                    ))}
                  </div>

                  {paginatedPages.length > 1 && (
                    <div className="text-right text-xs text-slate-500" style={{ flexShrink: 0, width: '100%', textAlign: 'right', paddingTop: '4px', lineHeight: 1 }}>
                      Page {page.pageNumber} of {paginatedPages.length}
                    </div>
                  )}
                </div>
              ))}

              {/* ANSWER KEY IN PREVIEW (If Enabled) */}
              {showAnswerKey && (
                <div className="a4-sheet answer-key-page break-before-page rounded-lg bg-white p-6 shadow-lg">
                  <div className="border-b-2 border-slate-900 pb-2 mb-4 flex justify-between items-center">
                    <div>
                      <h2 className="text-lg font-bold uppercase tracking-wide">Answer Key</h2>
                      <p className="text-xs text-slate-600">{worksheet.header.chapter || 'Chapter'}</p>
                    </div>
                    <span className="text-xs font-semibold px-2 py-1 bg-amber-100 text-amber-800 rounded">
                      Teacher / Parent Reference
                    </span>
                  </div>
                  <div className="space-y-4">
                    {worksheet.sections.map((section) => (
                      <div key={section.id}>
                        <h4 className="text-sm font-bold border-b border-slate-300 pb-1 mb-2">{section.title}</h4>
                        <ol className="list-decimal pl-5 space-y-1 text-xs">
                          {section.items.map((item, idx) => (
                            <li key={item.id} className="text-slate-800">
                              <span className="font-semibold text-slate-900">
                                {section.type === 'tick_sentence'
                                  ? `${item.answer || 'N/A'}`
                                  : item.answer || '(No answer provided)'}
                              </span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* BULK PASTE MODAL */}
      {bulkModalSectionId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="rounded-xl bg-white shadow-xl w-full max-w-md mx-auto overflow-hidden">
            <div className="border-b border-slate-200 px-6 py-4">
              <h2 className="text-lg font-bold text-slate-900">Bulk Paste Items</h2>
              <p className="text-xs text-slate-600 mt-1">
                {bulkModalSectionId && worksheet.sections.find(s => s.id === bulkModalSectionId)?.type === 'tick_sentence'
                  ? 'One pair per line (format: "Sentence A | Sentence B")'
                  : bulkModalSectionId && worksheet.sections.find(s => s.id === bulkModalSectionId)?.type === 'matching'
                  ? 'One pair per line (format: "A | B")'
                  : bulkModalSectionId && worksheet.sections.find(s => s.id === bulkModalSectionId)?.type === 'word_meaning'
                  ? 'One word per line (format: "Word | Meaning")'
                  : 'One item per line'}
              </p>
            </div>
            <div className="p-6">
              <textarea
                autoFocus
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder="Paste items here (one per line)..."
                className="w-full h-48 rounded border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div className="flex gap-2 border-t border-slate-200 px-6 py-4">
              <button
                onClick={() => {
                  setBulkModalSectionId(null);
                  setBulkText('');
                }}
                className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkPaste}
                className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
              >
                Add Items
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SAVED WORKSHEETS MODAL / DRAWER */}
      {isSavedDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="relative flex flex-col w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            {/* MODAL HEADER */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50/80">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
                  <BookMarked className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900">Saved Worksheets</h2>
                    <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-bold text-indigo-700">
                      {savedChapters.length} {savedChapters.length === 1 ? 'sheet' : 'sheets'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Manage, load, duplicate, or export your saved practice sheets
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={exportBackupJson}
                  className="flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-white px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-50 hover:border-indigo-300 transition-colors shadow-2xs"
                  title="Export all saved worksheets as a single .json backup"
                >
                  <Download className="h-3.5 w-3.5 text-indigo-600" />
                  <span className="hidden sm:inline">Export Backup (.json)</span>
                  <span className="sm:hidden">Export</span>
                </button>
                <button
                  onClick={() => backupFileInputRef.current?.click()}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
                  title="Import worksheets from a .json backup"
                >
                  <Upload className="h-3.5 w-3.5 text-slate-500" />
                  <span className="hidden sm:inline">Import Backup (.json)</span>
                  <span className="sm:hidden">Import</span>
                </button>
                <button
                  onClick={() => {
                    setIsSavedDrawerOpen(false);
                    setDeleteConfirmId(null);
                  }}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                  title="Close modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* SEARCH AND NEW BAR */}
            <div className="border-b border-slate-200 bg-white px-6 py-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by chapter title, subject, or student..."
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-8 py-1.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:outline-none transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <button
                onClick={handleCreateNewWorksheet}
                className="flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-white hover:bg-indigo-700 shadow-2xs transition-colors shrink-0"
              >
                <Plus className="h-4 w-4" />
                <span>New Blank Worksheet</span>
              </button>
            </div>

            {/* WORKSHEET CARDS LIST */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50">
              {filteredSavedWorksheets.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500 mb-3">
                    <FolderOpen className="h-7 w-7" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800">
                    {searchQuery ? 'No matching worksheets found' : 'No saved worksheets yet'}
                  </h3>
                  <p className="text-xs text-slate-500 max-w-xs mt-1">
                    {searchQuery
                      ? `No worksheets matched "${searchQuery}". Try a different keyword.`
                      : 'Save your active worksheet or import a backup file to get started.'}
                  </p>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="mt-3 text-xs font-semibold text-indigo-600 hover:underline"
                    >
                      Clear search filter
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredSavedWorksheets.map((sheet) => {
                    const isCurrentlyActive = sheet.id === editingSavedId;
                    const totalItems = countWorksheetItems(sheet);
                    const isConfirmingDelete = deleteConfirmId === sheet.id;

                    return (
                      <div
                        key={sheet.id}
                        className={`flex flex-col justify-between rounded-xl border bg-white p-4 transition-all shadow-xs hover:shadow-md ${
                          isCurrentlyActive
                            ? 'border-indigo-400 ring-2 ring-indigo-200'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div>
                          {/* CARD TOP META */}
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-bold text-indigo-700 border border-indigo-100">
                              {sheet.header?.subject || 'General'}
                            </span>
                            {isCurrentlyActive && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Active in Editor
                              </span>
                            )}
                          </div>

                          {/* CHAPTER TITLE */}
                          <h4 className="text-sm sm:text-base font-bold text-slate-900 line-clamp-2 leading-snug mb-2">
                            {sheet.header?.chapter || 'Untitled Worksheet'}
                          </h4>

                          {/* META DETAILS (Subject, Student, Date, Sections) */}
                          <div className="space-y-1 mb-4 text-xs text-slate-600">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-slate-500">Student:</span>
                              <span className="text-slate-800 font-semibold">{sheet.header?.studentName || 'Wafi'}</span>
                              <span className="text-slate-300">•</span>
                              <span className="text-slate-500">{sheet.header?.grade || 'Grade 3'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Layers className="h-3.5 w-3.5 text-slate-400" />
                              <span>
                                {sheet.sections?.length || 0} {sheet.sections?.length === 1 ? 'section' : 'sections'}
                                <span className="text-slate-400 ml-1">({totalItems} items)</span>
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-500">
                              <Clock className="h-3.5 w-3.5 text-slate-400" />
                              <span>Modified: {formatLastModified(sheet.updatedAt)}</span>
                            </div>
                          </div>
                        </div>

                        {/* THREE ACTION BUTTONS: Load & Edit, Duplicate, Delete */}
                        <div className="border-t border-slate-100 pt-3">
                          {isConfirmingDelete ? (
                            <div className="flex items-center justify-between gap-2 rounded-lg bg-red-50 p-2 border border-red-200">
                              <span className="text-xs font-semibold text-red-700">Delete this sheet?</span>
                              <div className="flex gap-1.5">
                                <button
                                  onClick={() => deleteSavedWorksheet(sheet.id)}
                                  className="rounded-md bg-red-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-red-700 transition-colors"
                                >
                                  Yes, Delete
                                </button>
                                <button
                                  onClick={() => setDeleteConfirmId(null)}
                                  className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between gap-1.5">
                              <button
                                onClick={() => loadAndEditWorksheet(sheet)}
                                className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-700 transition-all shadow-2xs"
                                title="Load this worksheet into the active editor"
                              >
                                <FolderOpen className="h-3.5 w-3.5" />
                                <span>Load & Edit</span>
                              </button>
                              <button
                                onClick={() => duplicateSavedWorksheet(sheet)}
                                className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-colors shadow-2xs"
                                title="Create an editable duplicate copy"
                              >
                                <Copy className="h-3.5 w-3.5 text-slate-500" />
                                <span>Duplicate</span>
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(sheet.id)}
                                className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 hover:border-red-300 transition-colors shadow-2xs"
                                title="Delete this saved worksheet"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                <span className="sr-only sm:not-sr-only">Delete</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* MODAL FOOTER */}
            <div className="border-t border-slate-200 bg-white px-6 py-3 flex items-center justify-between text-xs text-slate-500">
              <span>Persistent offline storage (localStorage)</span>
              <button
                onClick={() => {
                  setIsSavedDrawerOpen(false);
                  setDeleteConfirmId(null);
                }}
                className="rounded-lg border border-slate-300 px-4 py-1.5 font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HIDDEN BACKUP FILE INPUT */}
      <input
        ref={backupFileInputRef}
        type="file"
        accept=".json"
        onChange={handleImportBackup}
        className="hidden"
      />
    </div>
  );
}

export { WafiWorksheetBuilder as App };

export default WafiWorksheetBuilder;
