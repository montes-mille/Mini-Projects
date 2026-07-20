# Team Action Plan

A single-page team action-plan dashboard that serves as a front-facing UI for an
Excel spreadsheet. Actions are organized in three fixed categories — **Tasks &
Milestones**, **Risks & Concerns**, and **Commitments** — with inline editing,
click-to-cycle status/priority, review-cadence tracking, summary KPIs, a
progress-by-category chart, and lossless **Excel (.xlsx) export/import** so the
same spreadsheet can be edited in Excel and re-synced to the dashboard.

Built with **React + Vite**, using **SheetJS (`xlsx`)** for the Excel round-trip.

## Getting started

```bash
npm install
npm run dev      # start the dev server (http://localhost:5173)
npm run build    # production build to dist/
npm run preview  # preview the production build
```

## Features

- **Three categories** with per-category quick-add (button or Enter key).
- **Inline editing** of description, owner, and due date — saved on change and
  persisted to `localStorage` (key `actionplan-v1`).
- **Status dot** cycles Not started → In progress → Blocked → Done on click.
- **Priority pill** cycles A → B → C on click.
- **Sorting** within a category: status (Blocked → In progress → Not started →
  Done), then due date ascending (empty last), then priority A → B → C.
- **Summary KPIs**: open actions, due this week, overdue, done, and plan progress.
- **Review cadence**: next-review date computed from an anchor advanced by
  7 / 14 / 30 days; "Reviewed today" resets the anchor.
- **Overdue** items (due before today, not done) are flagged in red.

## Excel round-trip

**Export** writes `Team Action Plan.xlsx` with two sheets:

- **Action Plan** — header `Category | Action | Owner | Due | Status | Priority`,
  one row per item, grouped tasks → risks → commitments. Due is stored as ISO
  `YYYY-MM-DD` text.
- **Settings** — header `Review Cadence | Review Anchor`, one data row.

It uses the File System Access API (`showSaveFilePicker`) when available so the
user picks a location, otherwise falls back to a direct download.

**Import** reads the `Action Plan` sheet (or the first non-`Settings` sheet) and
**replaces** the current items (the spreadsheet is the source of truth). Parsing is
tolerant of category, status, and priority wording, and normalizes ISO strings,
Excel serial dates, and Date-parseable strings for the Due column. The `Settings`
sheet restores cadence/anchor when present.

## Project structure

```
index.html                  Entry HTML + Google Fonts
src/
  main.jsx                  React root
  App.jsx                   Top-level composition + Excel handlers
  index.css                 Base reset, fonts, hover/animation behaviors
  constants.js              Domain constants + design tokens
  hooks/
    useActionPlan.js        State container + localStorage persistence
  lib/
    compute.js              Date math, KPIs, sorting, chart geometry
    excel.js                SheetJS export/import
  components/
    Header.jsx              Navy header: brand, export/import, cadence
    SummaryStrip.jsx        Five KPI segments
    CategoryChart.jsx       Stacked progress-by-category columns
    CategorySection.jsx     Heading, quick-add, column header, rows
    ItemRow.jsx             Single action row
    Footer.jsx              Attribution + date
    Toast.jsx               Transient confirmation/error toast
```
