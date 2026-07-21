import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  isoLocal,
  sortItems,
  computeKpis,
  computeBars,
  filterItems,
  distinctOwners,
  hasActiveFilters,
  nextReviewDate,
} from './compute.js'

// Build an item with sensible defaults.
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

// Pin "today" to a fixed date so date-relative assertions are stable.
beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-07-21T12:00:00'))
})
afterEach(() => {
  vi.useRealTimers()
})

describe('isoLocal', () => {
  it('returns a local YYYY-MM-DD without UTC drift', () => {
    // Late-evening local time must not roll to the next UTC day.
    expect(isoLocal(new Date('2026-07-21T23:30:00'))).toBe('2026-07-21')
  })
})

describe('sortItems', () => {
  it('orders by status (Blocked→In progress→Not started→Done), then due, then priority', () => {
    const items = [
      item({ desc: 'done', status: 'Done' }),
      item({ desc: 'notstarted', status: 'Not started', due: '2026-08-01' }),
      item({ desc: 'blocked', status: 'Blocked' }),
      item({ desc: 'inprogress', status: 'In progress' }),
    ]
    expect(sortItems(items).map((i) => i.desc)).toEqual([
      'blocked',
      'inprogress',
      'notstarted',
      'done',
    ])
  })

  it('sorts by due date ascending with empty dates last within the same status', () => {
    const items = [
      item({ desc: 'no-due', due: '' }),
      item({ desc: 'later', due: '2026-09-01' }),
      item({ desc: 'sooner', due: '2026-08-01' }),
    ]
    expect(sortItems(items).map((i) => i.desc)).toEqual(['sooner', 'later', 'no-due'])
  })

  it('breaks due-date ties by priority A→B→C', () => {
    const items = [
      item({ desc: 'c', due: '2026-08-01', pri: 'C' }),
      item({ desc: 'a', due: '2026-08-01', pri: 'A' }),
      item({ desc: 'b', due: '2026-08-01', pri: 'B' }),
    ]
    expect(sortItems(items).map((i) => i.desc)).toEqual(['a', 'b', 'c'])
  })

  it('does not mutate the input array', () => {
    const items = [item({ status: 'Done' }), item({ status: 'Blocked' })]
    const snapshot = [...items]
    sortItems(items)
    expect(items).toEqual(snapshot)
  })
})

describe('computeKpis', () => {
  it('counts open, done, overdue, and due-this-week correctly', () => {
    const items = [
      item({ status: 'Done' }), // done
      item({ status: 'Not started', due: '2026-07-10' }), // overdue (open)
      item({ status: 'In progress', due: '2026-07-25' }), // due this week (open)
      item({ status: 'Blocked', due: '2026-09-01' }), // open, not due soon
      item({ status: 'Not started', due: '' }), // open, no due
    ]
    const k = computeKpis(items)
    expect(k.openCount).toBe(4)
    expect(k.doneCount).toBe(1)
    expect(k.overdueCount).toBe(1)
    expect(k.dueWeekCount).toBe(1)
    expect(k.pct).toBe(20) // 1 of 5 done
    expect(k.progressNote).toBe('20% of 5 actions complete')
  })

  it("a done item that is past due is not counted as overdue", () => {
    const items = [item({ status: 'Done', due: '2026-01-01' })]
    expect(computeKpis(items).overdueCount).toBe(0)
  })

  it('gives an empty-plan progress note when there are no items', () => {
    const k = computeKpis([])
    expect(k.pct).toBe(0)
    expect(k.progressNote).toBe('Add actions below to start the plan')
  })

  it('treats due exactly today and due at the week boundary as due-this-week', () => {
    const items = [
      item({ status: 'Not started', due: '2026-07-21' }), // today
      item({ status: 'Not started', due: '2026-07-28' }), // today + 7
    ]
    expect(computeKpis(items).dueWeekCount).toBe(2)
  })
})

describe('computeBars', () => {
  it('scales each column by category size relative to the largest category', () => {
    const items = [
      item({ cat: 'tasks', status: 'Done' }),
      item({ cat: 'tasks' }),
      item({ cat: 'risks' }),
    ]
    const bars = computeBars(items)
    const tasks = bars.find((b) => b.id === 'tasks')
    const risks = bars.find((b) => b.id === 'risks')
    const commitments = bars.find((b) => b.id === 'commitments')

    expect(tasks.label).toBe('1 / 2')
    expect(tasks.openH + tasks.doneH).toBeCloseTo(110) // largest category → full height
    expect(risks.openH + risks.doneH).toBeCloseTo(55) // half the size → half height
    expect(commitments.label).toBe('—') // empty category
    expect(commitments.openH).toBe(0)
    expect(commitments.doneH).toBe(0)
  })

  it('rounds the top of the done segment only when the category is fully done', () => {
    const allDone = computeBars([item({ cat: 'tasks', status: 'Done' })])
    expect(allDone.find((b) => b.id === 'tasks').doneRadius).toBe('3px 3px 0 0')

    const partial = computeBars([
      item({ cat: 'tasks', status: 'Done' }),
      item({ cat: 'tasks', status: 'Not started' }),
    ])
    expect(partial.find((b) => b.id === 'tasks').doneRadius).toBe('0')
  })
})

describe('filterItems', () => {
  const items = [
    item({ desc: 'Finalize test schedule', owner: 'R. Alvarez', pri: 'A', status: 'In progress' }),
    item({ desc: 'Submit range request', owner: 'A. Montes', pri: 'A', status: 'Not started' }),
    item({ desc: 'Draft status brief', owner: 'K. Chen', pri: 'B', status: 'Done' }),
  ]

  it('returns everything with no constraints', () => {
    expect(filterItems(items, {})).toHaveLength(3)
  })

  it('matches search against description and owner, case-insensitively', () => {
    expect(filterItems(items, { search: 'RANGE' }).map((i) => i.desc)).toEqual([
      'Submit range request',
    ])
    expect(filterItems(items, { search: 'chen' }).map((i) => i.owner)).toEqual(['K. Chen'])
  })

  it('filters by owner, priority, and status', () => {
    expect(filterItems(items, { owner: 'A. Montes' })).toHaveLength(1)
    expect(filterItems(items, { priority: 'A' })).toHaveLength(2)
    expect(filterItems(items, { status: 'Done' })).toHaveLength(1)
  })

  it('combines multiple constraints (AND)', () => {
    expect(filterItems(items, { priority: 'A', status: 'Not started' })).toHaveLength(1)
    expect(filterItems(items, { priority: 'A', status: 'Done' })).toHaveLength(0)
  })
})

describe('distinctOwners', () => {
  it('returns sorted unique non-empty owners', () => {
    const items = [
      item({ owner: 'K. Chen' }),
      item({ owner: 'A. Montes' }),
      item({ owner: 'K. Chen' }),
      item({ owner: '' }),
      item({ owner: '   ' }),
    ]
    expect(distinctOwners(items)).toEqual(['A. Montes', 'K. Chen'])
  })
})

describe('hasActiveFilters', () => {
  it('is false for the empty/default filter set', () => {
    expect(hasActiveFilters({ search: '', owner: 'all', priority: 'all', status: 'all' })).toBe(false)
    expect(hasActiveFilters({})).toBe(false)
  })

  it('is true when any constraint is set', () => {
    expect(hasActiveFilters({ search: 'x' })).toBe(true)
    expect(hasActiveFilters({ owner: 'A. Montes' })).toBe(true)
    expect(hasActiveFilters({ priority: 'A' })).toBe(true)
    expect(hasActiveFilters({ status: 'Done' })).toBe(true)
  })
})

describe('nextReviewDate', () => {
  it('advances a past anchor by the weekly step until it is >= today', () => {
    // Anchor 2026-07-07, weekly (7d): 07-07 → 07-14 → 07-21 (== today).
    expect(isoLocal(nextReviewDate('2026-07-07', 'weekly'))).toBe('2026-07-21')
  })

  it('respects the biweekly and monthly steps', () => {
    // 2026-07-01 + 14 = 07-15, + 14 = 07-29 (first >= today 07-21).
    expect(isoLocal(nextReviewDate('2026-07-01', 'biweekly'))).toBe('2026-07-29')
    // 2026-07-01 + 30 = 07-31 (first >= today).
    expect(isoLocal(nextReviewDate('2026-07-01', 'monthly'))).toBe('2026-07-31')
  })

  it('keeps a future anchor as-is', () => {
    expect(isoLocal(nextReviewDate('2026-08-15', 'weekly'))).toBe('2026-08-15')
  })
})
