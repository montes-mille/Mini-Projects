// Excel (.xlsx) export/import via SheetJS. Sheet names, column order, and the
// tolerant import parsing match the design handoff so previously exported files
// keep working across the Excel round-trip.

import * as XLSX from 'xlsx'
import { CATEGORY_NAMES, CADENCES, PRIORITIES } from '../constants.js'

const HEADER = ['Category', 'Action', 'Owner', 'Due', 'Status', 'Priority']
const EXPORT_NAME = 'Team Action Plan.xlsx'

// ---- Export ----------------------------------------------------------------

// Build the workbook and trigger a download. Uses showSaveFilePicker when
// available (user picks location), else falls back to a plain download.
// Returns 'saved' | 'downloaded' | 'cancelled'.
export async function exportWorkbook(items, cadence, anchor) {
  const rows = [HEADER]
  for (const cat of ['tasks', 'risks', 'commitments']) {
    for (const i of items.filter((x) => x.cat === cat)) {
      rows.push([CATEGORY_NAMES[cat], i.desc, i.owner, i.due, i.status, i.pri])
    }
  }

  const wb = XLSX.utils.book_new()
  const planSheet = XLSX.utils.aoa_to_sheet(rows)
  // Force the Due column to text so ISO dates round-trip verbatim.
  forceDueColumnText(planSheet, rows.length)
  XLSX.utils.book_append_sheet(wb, planSheet, 'Action Plan')

  const settingsSheet = XLSX.utils.aoa_to_sheet([
    ['Review Cadence', 'Review Anchor'],
    [cadence, anchor],
  ])
  XLSX.utils.book_append_sheet(wb, settingsSheet, 'Settings')

  const blob = workbookToBlob(wb)

  if (window.showSaveFilePicker) {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: EXPORT_NAME,
        types: [
          {
            description: 'Excel Workbook',
            accept: {
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            },
          },
        ],
      })
      const writable = await handle.createWritable()
      await writable.write(blob)
      await writable.close()
      return 'saved'
    } catch (err) {
      if (err && err.name === 'AbortError') return 'cancelled'
      // Fall through to the download path on any other picker failure.
    }
  }

  triggerDownload(blob, EXPORT_NAME)
  return 'downloaded'
}

// Set the "Due" column (D) cells to string type so YYYY-MM-DD is stored as text.
function forceDueColumnText(sheet, rowCount) {
  for (let r = 1; r < rowCount; r++) {
    const addr = XLSX.utils.encode_cell({ c: 3, r })
    const cell = sheet[addr]
    if (cell && cell.v !== '' && cell.v != null) {
      cell.t = 's'
      cell.v = String(cell.v)
    }
  }
}

function workbookToBlob(wb) {
  const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  return new Blob([out], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 5000)
}

// ---- Import ----------------------------------------------------------------

// Normalize a due value (ISO string, Excel serial number, or Date-parseable
// string) to YYYY-MM-DD, or '' when empty/unparseable.
export function normalizeDue(v) {
  if (v === '' || v === undefined || v === null) return ''
  const s = String(v).trim()
  if (!s) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s
  if (/^\d+(\.\d+)?$/.test(s)) {
    // Excel serial date (days since 1899-12-30).
    const d = new Date(Date.UTC(1899, 11, 30) + Math.round(parseFloat(s)) * 86400000)
    return d.toISOString().slice(0, 10)
  }
  const d = new Date(s)
  if (isNaN(d)) return ''
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
}

function normalizeCategory(raw) {
  const s = String(raw || '').toLowerCase()
  if (s.includes('risk')) return 'risks'
  if (s.includes('commit')) return 'commitments'
  return 'tasks'
}

function normalizeStatus(raw) {
  const s = String(raw || '').toLowerCase()
  if (s.includes('done') || s.includes('complete')) return 'Done'
  if (s.includes('block')) return 'Blocked'
  if (s.includes('progress') || s.includes('active')) return 'In progress'
  return 'Not started'
}

function normalizePriority(raw) {
  const p = String(raw || 'B').trim().charAt(0).toUpperCase()
  return PRIORITIES.includes(p) ? p : 'B'
}

// Parse a .xlsx File. Returns { items, cadence?, anchor? }.
// Throws when the file can't be read as a workbook; returns null items count
// via a thrown 'NO_SHEET' when no usable Action Plan sheet exists.
export async function importWorkbook(file) {
  const data = await file.arrayBuffer()
  const wb = XLSX.read(data, { type: 'array' })

  // Prefer the "Action Plan" sheet; else the first non-Settings sheet.
  const planName =
    wb.SheetNames.find((n) => n === 'Action Plan') ||
    wb.SheetNames.find((n) => n !== 'Settings')
  if (!planName) throw new Error('NO_SHEET')

  const planRows = XLSX.utils.sheet_to_json(wb.Sheets[planName], {
    header: 1,
    raw: true,
    defval: '',
  })
  if (!planRows.length) throw new Error('NO_SHEET')

  // Skip the header row; drop rows with an empty Action column.
  const items = planRows
    .slice(1)
    .filter((r) => r && String(r[1] || '').trim())
    .map((r, idx) => ({
      id: Date.now() + idx + Math.random(),
      cat: normalizeCategory(r[0]),
      desc: String(r[1]).trim(),
      owner: String(r[2] || '').trim(),
      due: normalizeDue(r[3]),
      status: normalizeStatus(r[4]),
      pri: normalizePriority(r[5]),
    }))

  const result = { items }

  // Restore cadence/anchor from the Settings sheet when present.
  if (wb.Sheets['Settings']) {
    const settingsRows = XLSX.utils.sheet_to_json(wb.Sheets['Settings'], {
      header: 1,
      raw: true,
      defval: '',
    })
    const dataRow = settingsRows[1]
    if (dataRow) {
      const cad = String(dataRow[0] || '').toLowerCase()
      if (CADENCES.includes(cad)) result.cadence = cad
      const anc = normalizeDue(dataRow[1])
      if (anc) result.anchor = anc
    }
  }

  return result
}
