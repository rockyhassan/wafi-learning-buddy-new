# Implementation Guide: Restoring Worksheet Builder Functionality

## Table of Contents
1. [Quick Start](#quick-start)
2. [Phase 1: Answer Key Pages](#phase-1-answer-key-pages)
3. [Phase 2: Missing Section Types (PDF)](#phase-2-missing-section-types-pdf)
4. [Phase 3: HTML Preview](#phase-3-html-preview)
5. [Phase 4: Polish & Details](#phase-4-polish--details)

---

## Quick Start

### Current Status Check
Run this to understand what's broken:
```bash
# In current file: worksheet-builder.tsx
# Search for these patterns to find stubs:

1. "if (section.type === 'fill_blanks')" → line ~1165
   Current: "y += 15.0;" (no rendering)
   
2. "if (showAnswerKey)" → line ~1250
   Current: Empty stub
   
3. "// Render sections on page" → line ~1125
   Current: Incomplete implementation

4. Preview section (line ~1850)
   Current: Only 3 of 7 section types rendered
```

### Key Functions Already In Place
- ✅ `wrapTextLines()` — Use for text wrapping in PDF
- ✅ `paginateWorksheet()` — Pagination logic complete
- ✅ `createPageCanvas()` — Canvas creation helper
- ✅ `handleDownloadPdf()` — Main function (needs restoration)

---

## Phase 1: Answer Key Pages

### Severity: **CRITICAL** 🔴

### What's Missing
The entire answer key rendering is stubbed out. When user enables "Answer Key", nothing is generated in the PDF.

### Implementation Steps

#### Step 1: Add Answer Key Page Creation Logic

**Location:** `worksheet-builder.tsx`, line ~1250 in `handleDownloadPdf()`

**Current Code:**
```typescript
// --- Optional Answer Key Pages ---
if (showAnswerKey) {
  pdf.addPage();
  const { canvas, ctx } = createPageCanvas();
  let y = 18;

  // TODO: Implement answer key rendering
  
  pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, PAGE_W, PAGE_H);
}
```

**Replacement Code:**
```typescript
// --- Optional Answer Key Pages ---
if (showAnswerKey) {
  const generateAnswerKeyPages = () => {
    const pages: any[] = [];
    let currentPageContent: any[] = [];
    let currentPageY = 18;
    const MAX_Y = PAGE_H - 24;

    // Helper to add page
    const addAnswerKeyPage = () => {
      if (currentPageContent.length > 0) {
        pages.push({ content: currentPageContent, y: currentPageY });
      }
      currentPageContent = [];
      currentPageY = 18;
    };

    // Page 1: Header
    currentPageContent.push({
      type: 'header',
      title: 'ANSWER KEY',
      chapter: worksheet.header.chapter || 'Chapter',
      y: currentPageY
    });
    currentPageY += 18;

    // For each section, add answers
    worksheet.sections.forEach((section, sIdx) => {
      if (currentPageY + 15 > MAX_Y) {
        addAnswerKeyPage();
      }

      currentPageContent.push({
        type: 'sectionTitle',
        title: section.title,
        y: currentPageY
      });
      currentPageY += 7.5;

      // Add all items' answers
      if (section.items && section.items.length > 0) {
        section.items.forEach((item, itemIdx) => {
          const ans = item.answer || '(no answer)';
          const wrappedLines = wrapTextLines(ctx, ans, CONTENT_W - 10);
          const answerHeight = Math.max(wrappedLines.length * 5.1, 5.1) + 2.8;

          if (currentPageY + answerHeight > MAX_Y && currentPageContent.length > 0) {
            addAnswerKeyPage();
          }

          currentPageContent.push({
            type: 'answer',
            number: itemIdx + 1,
            answer: ans,
            lines: wrappedLines,
            y: currentPageY
          });
          currentPageY += answerHeight;
        });
      }

      currentPageY += 4;
    });

    addAnswerKeyPage();
    return pages;
  };

  // Render answer key pages
  const answerKeyPages = generateAnswerKeyPages();
  
  answerKeyPages.forEach((page, pageIdx) => {
    if (pageIdx > 0) pdf.addPage();
    const { canvas, ctx } = createPageCanvas();
    let y = 18;

    // Render header
    const headerItem = page.content[0];
    ctx.fillStyle = '#020617';
    ctx.font = `700 5.2px ${fontStack}`;
    ctx.fillText('ANSWER KEY', 22, y);
    
    ctx.font = `400 3.6px ${fontStack}`;
    ctx.fillStyle = '#475569';
    ctx.fillText(`[${headerItem.chapter}]`, 22, y + 6);

    ctx.beginPath();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.4;
    ctx.moveTo(22, y + 9);
    ctx.lineTo(22 + CONTENT_W, y + 9);
    ctx.stroke();

    y += 18;

    // Render content
    page.content.slice(1).forEach((item) => {
      if (item.type === 'sectionTitle') {
        ctx.fillStyle = '#020617';
        ctx.font = `700 4.1px ${fontStack}`;
        ctx.fillText(item.title, 22, y);

        ctx.beginPath();
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 0.25;
        ctx.moveTo(22, y + 1.8);
        ctx.lineTo(22 + CONTENT_W, y + 1.8);
        ctx.stroke();
        y += 7.5;
      } else if (item.type === 'answer') {
        ctx.font = `400 3.8px ${fontStack}`;
        ctx.fillStyle = '#020617';
        const numStr = `${item.number}. `;
        ctx.fillText(numStr, 26, y);

        ctx.fillStyle = '#1e293b';
        ctx.font = `600 3.8px ${fontStack}`;
        const lineW = ctx.measureText(numStr).width;
        
        item.lines.forEach((line: string, lIdx: number) => {
          ctx.fillText(line, 26 + (lIdx === 0 ? lineW : 0), y + lIdx * 5.1);
        });

        y += Math.max(item.lines.length * 5.1, 5.1) + 2.8;
        ctx.font = `400 3.8px ${fontStack}`;
      }
    });

    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, PAGE_W, PAGE_H);
  });
}
```

#### Step 2: Update `wrapTextLines` Usage in Answer Key

The `wrapTextLines` function is already defined. Make sure it's called correctly:

```typescript
const wrapTextLines = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number) => {
  const words = String(text || '').split(/\s+/);
  const lines: string[] = [];
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
```

### Testing Answer Key
1. Create a worksheet with mixed section types
2. Add answers to several items
3. Enable "Answer Key" toggle
4. Generate PDF
5. Verify answer key appears at end with all answers formatted

---

## Phase 2: Missing Section Types (PDF)

### Severity: **CRITICAL** 🔴

### What's Missing
5 section types are not rendering in PDF:
- Matching
- Word Meanings
- MCQ
- Math Box
- Plus: Fill-in-the-Blanks and True/False are incomplete

### Implementation Plan

#### A. Matching Section (2-column table)

**Location:** Inside the section rendering loop, ~line 1165

**Current:**
```typescript
if (section.type === 'fill_blanks') {
  // ... 
} else if (section.type === 'matching') {
  // MISSING
}
```

**Add:**
```typescript
// 3. MATCH COLUMN A & B
if (section.type === 'matching') {
  const halfW = CONTENT_W / 2;
  
  // Render header row if first page
  if (!section.isContinuation) {
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(MARGIN_LEFT, y - 4.2, CONTENT_W, 7);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.3;
    ctx.strokeRect(MARGIN_LEFT, y - 4.2, halfW, 7);
    ctx.strokeRect(MARGIN_LEFT + halfW, y - 4.2, halfW, 7);

    ctx.fillStyle = '#020617';
    ctx.font = `700 3.9px ${fontStack}`;
    ctx.fillText('Column A', MARGIN_LEFT + 3, y + 0.5);
    ctx.fillText('Column B', MARGIN_LEFT + halfW + 3, y + 0.5);
    y += 7;
  }

  // Render items
  section.items.forEach((item) => {
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.3;
    ctx.strokeRect(MARGIN_LEFT, y - 4.2, halfW, 7.2);
    ctx.strokeRect(MARGIN_LEFT + halfW, y - 4.2, halfW, 7.2);

    ctx.fillStyle = '#020617';
    ctx.font = `400 3.9px ${fontStack}`;
    ctx.fillText(item.left || '', MARGIN_LEFT + 3, y + 0.6);
    ctx.fillText(item.right || '', MARGIN_LEFT + halfW + 3, y + 0.6);
    y += 7.2;
  });
  y += 2;
}
```

#### B. Word Meanings (3-column table)

**Add:**
```typescript
// 4. WORD MEANINGS / SENTENCES
if (section.type === 'word_meaning') {
  const c1 = CONTENT_W * 0.24;  // Word column
  const c2 = CONTENT_W * 0.32;  // Meaning column
  const c3 = CONTENT_W * 0.44;  // Sentence column
  
  // Header row
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

  // Items
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
```

#### C. MCQ (Option circles)

**Add:**
```typescript
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

      // Draw circle
      ctx.beginPath();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 0.3;
      ctx.arc(ox + 1.8, oy - 1.2, 1.7, 0, Math.PI * 2);
      ctx.stroke();

      // Draw text
      ctx.font = `400 3.7px ${fontStack}`;
      ctx.fillText(`(${String.fromCharCode(97 + oIdx)}) ${opt}`, ox + 5, oy);
    });
    y += Math.ceil(opts.length / 2) * 5.8 + 4;
  });
}
```

#### D. Math Box (Bordered box)

**Add:**
```typescript
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
```

#### E. Fix Fill-in-the-Blanks (Underscore parsing)

**Current:**
```typescript
if (section.type === 'fill_blanks') {
  section.items.forEach((item, idx) => {
    const numStr = `${section.startIndex + idx + 1}.`;
    ctx.fillStyle = '#020617';
    ctx.font = `700 4.0px ${fontStack}`;
    ctx.fillText(numStr, MARGIN_LEFT + 1, y);
    y += 15.0;  // STUB - no rendering
  });
}
```

**Replace with (from original):**
```typescript
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
```

### Testing Section PDF Rendering
For each section type:
1. Create a worksheet with that type
2. Add 2-3 items with various content lengths
3. Generate PDF
4. Verify rendering accuracy
5. Check multi-page handling

---

## Phase 3: HTML Preview

### Severity: **CRITICAL** 🔴

### What's Missing
The preview doesn't show 4 section types, so users can't verify layout before exporting.

### Implementation Plan

**Location:** Preview panel, around line ~1850

**Current:**
```typescript
{/* Matching */}
{section.type === 'matching' && (
  // MISSING
)}

{/* Word Meanings */}
{section.type === 'word_meaning' && (
  // MISSING
)}

{/* MCQ */}
{section.type === 'mcq' && (
  // MISSING
)}

{/* Math Box */}
{section.type === 'math_box' && (
  // MISSING
)}
```

#### A. Matching Preview

**Add:**
```typescript
{section.type === 'matching' && (
  <div className="text-sm space-y-0">
    <table className="w-full border-collapse">
      <thead>
        <tr className="bg-slate-100">
          <th className="border border-slate-400 px-3 py-2 text-left font-bold">
            Column A
          </th>
          <th className="border border-slate-400 px-3 py-2 text-left font-bold">
            Column B
          </th>
        </tr>
      </thead>
      <tbody>
        {section.items.map((item) => (
          <tr key={item.id}>
            <td className="border border-slate-400 px-3 py-2">{item.left}</td>
            <td className="border border-slate-400 px-3 py-2">{item.right}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}
```

#### B. Word Meanings Preview

**Add:**
```typescript
{section.type === 'word_meaning' && (
  <div className="text-sm space-y-0">
    <table className="w-full border-collapse">
      <thead>
        <tr className="bg-slate-100">
          <th className="border border-slate-400 px-3 py-2 text-left font-bold w-1/4">
            Word
          </th>
          <th className="border border-slate-400 px-3 py-2 text-left font-bold w-1/3">
            Meaning
          </th>
          <th className="border border-slate-400 px-3 py-2 text-left font-bold w-5/12">
            Make Sentence
          </th>
        </tr>
      </thead>
      <tbody>
        {section.items.map((item, idx) => (
          <tr key={item.id}>
            <td className="border border-slate-400 px-3 py-2 font-semibold">
              {section.startIndex + idx + 1}. {item.word}
            </td>
            <td className="border border-slate-400 px-3 py-2 text-slate-600">
              {item.meaning}
            </td>
            <td className="border border-slate-400 px-3 py-2 text-slate-500">
              {item.sentence}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}
```

#### C. MCQ Preview

**Add:**
```typescript
{section.type === 'mcq' && (
  <ol className="text-sm space-y-4">
    {section.items.map((item, idx) => (
      <li key={item.id} className="flex flex-col gap-2">
        <div className="flex gap-3">
          <span className="font-bold">{section.startIndex + idx + 1}.</span>
          <span>{item.prompt}</span>
        </div>
        <div className="grid grid-cols-2 gap-4 ml-6">
          {(item.options || []).map((opt, oIdx) => (
            <div key={oIdx} className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-slate-900 rounded-full flex-shrink-0" />
              <span className="text-sm">({String.fromCharCode(97 + oIdx)}) {opt}</span>
            </div>
          ))}
        </div>
      </li>
    ))}
  </ol>
)}
```

#### D. Math Box Preview

**Add:**
```typescript
{section.type === 'math_box' && (
  <ol className="text-sm space-y-4">
    {section.items.map((item, idx) => (
      <li key={item.id} className="flex flex-col gap-2">
        <div className="flex gap-3">
          <span className="font-bold">{section.startIndex + idx + 1}.</span>
          <span>{item.prompt}</span>
        </div>
        <div className="relative bg-white border-2 border-slate-400 rounded p-4 ml-6">
          <div 
            style={{ height: `${(item.boxHeight || 26) * 2}px` }}
            className="border-b border-slate-300"
          />
          <span className="absolute bottom-1 right-2 text-xs uppercase text-slate-400 font-semibold">
            Work / Answer
          </span>
        </div>
      </li>
    ))}
  </ol>
)}
```

### Testing HTML Preview
1. Create worksheet with all section types
2. Switch to preview mode
3. Verify all sections render correctly
4. Check text wrapping and alignment
5. Compare visual with expected output

---

## Phase 4: Polish & Details

### High Priority

#### 1. True/False Trailing Blank Line

**Current:** Basic rendering
**Fix:** Add proper blank line at end of statement

In PDF section rendering:
```typescript
if (section.type === 'true_false') {
  const blankW = 36;
  const textMaxW = CONTENT_W - blankW - 12;
  section.items.forEach((item, idx) => {
    // ... existing code ...
    
    const lastLineY = y + (lines.length - 1) * 5.2;
    ctx.beginPath();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.35;
    ctx.moveTo(MARGIN_LEFT + CONTENT_W - blankW, lastLineY + 0.8);
    ctx.lineTo(MARGIN_LEFT + CONTENT_W, lastLineY + 0.8);
    ctx.stroke();

    y = lastLineY + 7.2;
  });
}
```

#### 2. Insert Blank Helper Button

**Location:** Section item editor, for fill-in-the-blanks type

**Add to studio editor section:**
```typescript
{section.type === 'fill_blanks' && (
  <div className="mb-1.5 flex items-center justify-between text-xs">
    <span className="text-[11px] text-slate-500">
      Tip: Type underscores <code>___</code> for blanks
    </span>
    <button
      type="button"
      onClick={() => {
        const currentText = item.prompt || '';
        const blank = '____________';
        updateItem(section.id, item.id, { 
          prompt: currentText ? `${currentText} ${blank}` : blank 
        });
      }}
      className="inline-flex items-center gap-1 rounded bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition-colors"
    >
      <Plus className="h-3 w-3" />
      <span>Insert Blank</span>
    </button>
  </div>
)}
```

#### 3. Answer Key Multi-page Handling

Already covered in Phase 1 (included in implementation)

---

## Testing Checklist

### Before Final Commit

**Section Types:**
- [ ] Fill-in-the-Blanks: PDF shows underscores scaled correctly
- [ ] True/False: PDF shows blank line at end
- [ ] Short Q&A: PDF shows correct line spacing (11mm)
- [ ] Matching: PDF shows 2-column table
- [ ] Word Meanings: PDF shows 3-column table
- [ ] MCQ: PDF shows option circles + labels
- [ ] Math Box: PDF shows bordered box with label

**Preview:**
- [ ] All 7 section types display in preview
- [ ] Tables render correctly
- [ ] Text wrapping works

**Answer Key:**
- [ ] Shows when toggle enabled
- [ ] Doesn't show when toggle disabled
- [ ] Contains all answers
- [ ] Pagination works for long answer keys

**Export/Import:**
- [ ] PDF saves with correct filename
- [ ] Print dialog works
- [ ] Backup export works
- [ ] Backup import works

**Cross-browser:**
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari

---

## Common Issues & Solutions

### Issue: Canvas text not rendering
**Solution:** Ensure `ctx.fillStyle` is set before `ctx.fillText()`

### Issue: PDF looks blurry
**Solution:** Check DPI_SCALE constant (currently 1240/210 ≈ 5.9)

### Issue: Tables render outside page bounds
**Solution:** Update `y` position tracking; reference original code

### Issue: Answer key doesn't paginate
**Solution:** Check `if (y > PAGE_H - 24)` condition and `pdf.addPage()` call

### Issue: SVG circles not rendering
**Solution:** Use `ctx.arc()` method, not SVG; test with simple circle first

---

## Performance Considerations

### Large Worksheets (100+ items)
- Canvas rendering is fast (~100ms)
- PDF generation may take 1-2 seconds
- User sees "Generating crisp A4 PDF..." toast

### Memory
- Each canvas: ~5MB (1240 x 1754 px)
- Multiple pages: Add to PDF incrementally
- No issues expected for worksheets < 50 pages

### Optimization Tips
- Reuse canvas contexts where possible
- Cache font measurements
- Use `pdf.addImage()` only when needed

---

## Reference: Original Implementation

For detailed comparison, refer to original file:
- **File:** `D:\Wafi Worksheet\src\WafiWorksheetBuilder.jsx`
- **Key sections:** Lines 600-1310 (PDF generation)
- **Functions:** `handleDownloadPdf()`, `wrapTextLines()`, `paginateWorksheet()`

---

## Next Steps After Implementation

1. **Code Review:** Have another developer review PDF generation logic
2. **User Testing:** Have actual users create worksheets and export PDFs
3. **Regression Testing:** Ensure existing features still work
4. **Documentation:** Update user guide with new features
5. **Performance Testing:** Test with 100-page worksheets

---

## Questions?

If implementation gets stuck:
1. Check original file for reference implementation
2. Review this guide's Phase sections
3. Test canvas rendering separately (before PDF integration)
4. Check browser console for errors

**Success Criteria:**
- ✅ All 7 section types render in PDF
- ✅ Answer key page generates
- ✅ HTML preview complete
- ✅ No regressions in existing features
- ✅ PDF output quality matches original

