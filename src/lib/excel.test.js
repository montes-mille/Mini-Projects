import { describe, it, expect } from 'vitest'
import * as XLSX from 'xlsx'
import { buildWorkbook, parseWorkbookBuffer, normalizeDue } from './excel.js'

function item(overrides = {}) {
  return {
    id: Math.random(),
    cat: 'tasks',
    desc: 'x',
    owner: '',
    due: '',
    status: 'Not started',
    pri: 'B',
    ...overrides,
  }
}

// Serialize a workbook to a Uint8Array, mirroring the export path.
function toBuffer(wb) {
  return XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
}

const SAMPLE = [
  item({ cat: 'tasks', desc: 'Finalize test schedule', owner: 'R. Alvarez', due: '2026-07-24', status: 'In progress', pri: 'A' }),
  item({ cat: 'risks', desc: 'Lab availability conflict', owner: 'A. Montes', due: '2026-07-28', status: 'Blocked', pri: 'A' }),
  item({ cat: 'commitments', desc: 'Deliver demo', owner: 'K. Chen', due: '', status: 'Not started', pri: 'C' }),
]

describe('buildWorkbook', () => {
  it('creates Action Plan and Settings sheets in order', () => {
    const wb = buildWorkbook(SAMPLE, 'weekly', '2026-07-20')
    expect(wb.SheetNames).toEqual(['Action Plan', 'Settings'])
  })

  it('writes the exact header row and column order', () => {
    const wb = buildWorkbook(SAMPLE, 'weekly', '2026-07-20')
    const rows = XLSX.utils.sheet_to_json(wb.Sheets['Action Plan'], { header: 1, defval: '' })
    expect(rows[0]).toEqual(['Category', 'Action', 'Owner', 'Due', 'Status', 'Priority'])
  })

  it('groups rows tasks → risks → commitments with display category names', () => {
    const wb = buildWorkbook(SAMPLE, 'weekly', '2026-07-20')
    const rows = XLSX.utils.sheet_to_json(wb.Sheets['Action Plan'], { header: 1, defval: '' })
    expect(rows.slice(1).map((r) => r[0])).toEqual([
      'Tasks & Milestones',
      'Risks & Concerns',
      'Commitments',
    ])
  })

  it('stores Due as ISO text (not a numeric/date cell)', () => {
    const wb = buildWorkbook(SAMPLE, 'weekly', '2026-07-20')
    const sheet = wb.Sheets['Action Plan']
    const dueCell = sheet['D2'] // first data row, Due column
    expect(dueCell.t).toBe('s')
    expect(dueCell.v).toBe('2026-07-24')
  })

  it('writes the Settings sheet with cadence and anchor', () => {
    const wb = buildWorkbook(SAMPLE, 'biweekly', '2026-07-20')
    const rows = XLSX.utils.sheet_to_json(wb.Sheets['Settings'], { header: 1, defval: '' })
    expect(rows[0]).toEqual(['Review Cadence', 'Review Anchor'])
    expect(rows[1]).toEqual(['biweekly', '2026-07-20'])
  })
})

describe('export → import round-trip', () => {
  it('preserves items, cadence, and anchor through a full round-trip', () => {
    const wb = buildWorkbook(SAMPLE, 'monthly', '2026-06-15')
    const result = parseWorkbookBuffer(toBuffer(wb))

    expect(result.items).toHaveLength(3)
    expect(result.cadence).toBe('monthly')
    expect(result.anchor).toBe('2026-06-15')

    // Field-level fidelity (ignoring the regenerated id).
    const stripId = ({ id, ...rest }) => rest
    expect(result.items.map(stripId)).toEqual([
      { cat: 'tasks', desc: 'Finalize test schedule', owner: 'R. Alvarez', due: '2026-07-24', status: 'In progress', pri: 'A' },
      { cat: 'risks', desc: 'Lab availability conflict', owner: 'A. Montes', due: '2026-07-28', status: 'Blocked', pri: 'A' },
      { cat: 'commitments', desc: 'Deliver demo', owner: 'K. Chen', due: '', status: 'Not started', pri: 'C' },
    ])
  })
})

describe('parseWorkbookBuffer tolerant parsing', () => {
  function bufferFromRows(planRows, settingsRows) {
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(planRows), 'Action Plan')
    if (settingsRows) {
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(settingsRows), 'Settings')
    }
    return toBuffer(wb)
  }

  const HEADER = ['Category', 'Action', 'Owner', 'Due', 'Status', 'Priority']

  it('maps fuzzy category words to ids', () => {
    const buf = bufferFromRows([
      HEADER,
      ['Some RISK item', 'a', '', '', '', ''],
      ['our commitments', 'b', '', '', '', ''],
      ['anything else', 'c', '', '', '', ''],
    ])
    expect(parseWorkbookBuffer(buf).items.map((i) => i.cat)).toEqual([
      'risks',
      'commitments',
      'tasks',
    ])
  })

  it('maps fuzzy status words to canonical statuses', () => {
    const buf = bufferFromRows([
      HEADER,
      ['tasks', 'a', '', '', 'completed', ''],
      ['tasks', 'b', '', '', 'BLOCKED on vendor', ''],
      ['tasks', 'c', '', '', 'active', ''],
      ['tasks', 'd', '', '', 'whatever', ''],
    ])
    expect(parseWorkbookBuffer(buf).items.map((i) => i.status)).toEqual([
      'Done',
      'Blocked',
      'In progress',
      'Not started',
    ])
  })

  it('defaults an invalid priority to B and reads the first letter', () => {
    const buf = bufferFromRows([
      HEADER,
      ['tasks', 'a', '', '', '', 'A-high'],
      ['tasks', 'b', '', '', '', 'Z'],
      ['tasks', 'c', '', '', '', ''],
    ])
    expect(parseWorkbookBuffer(buf).items.map((i) => i.pri)).toEqual(['A', 'B', 'B'])
  })

  it('skips rows with an empty Action column', () => {
    const buf = bufferFromRows([
      HEADER,
      ['tasks', '', 'orphan owner', '', '', ''],
      ['tasks', 'real', '', '', '', ''],
    ])
    const items = parseWorkbookBuffer(buf).items
    expect(items).toHaveLength(1)
    expect(items[0].desc).toBe('real')
  })

  it('uses the first non-Settings sheet when there is no "Action Plan" sheet', () => {
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([HEADER, ['tasks', 'a', '', '', '', '']]), 'Sheet1')
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['Review Cadence', 'Review Anchor'], ['weekly', '2026-07-20']]), 'Settings')
    const items = parseWorkbookBuffer(toBuffer(wb)).items
    expect(items).toHaveLength(1)
  })

  it('throws NO_SHEET when only a Settings sheet exists', () => {
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['Review Cadence', 'Review Anchor']]), 'Settings')
    expect(() => parseWorkbookBuffer(toBuffer(wb))).toThrow('NO_SHEET')
  })

  it('ignores an out-of-range cadence but still applies a valid anchor', () => {
    const buf = bufferFromRows(
      [HEADER, ['tasks', 'a', '', '', '', '']],
      [['Review Cadence', 'Review Anchor'], ['fortnightly', '2026-05-01']],
    )
    const result = parseWorkbookBuffer(buf)
    expect(result.cadence).toBeUndefined()
    expect(result.anchor).toBe('2026-05-01')
  })
})

describe('normalizeDue', () => {
  it('passes through ISO dates unchanged', () => {
    expect(normalizeDue('2026-07-24')).toBe('2026-07-24')
  })

  it('converts an Excel serial number to ISO', () => {
    // Excel serial 46227 = 2026-07-24 (days since 1899-12-30).
    expect(normalizeDue(46227)).toBe('2026-07-24')
    expect(normalizeDue('46227')).toBe('2026-07-24')
  })

  it('parses other date strings to ISO', () => {
    expect(normalizeDue('July 24, 2026')).toBe('2026-07-24')
  })

  it('returns empty string for blank or unparseable input', () => {
    expect(normalizeDue('')).toBe('')
    expect(normalizeDue(null)).toBe('')
    expect(normalizeDue(undefined)).toBe('')
    expect(normalizeDue('not a date')).toBe('')
  })
})
