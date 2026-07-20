// Pure derivation helpers: date math, KPIs, sorting, and category-chart geometry.
// These mirror the prototype's renderVals() so behavior stays identical.

import { CATEGORIES, PRIORITIES, CADENCE_STEP } from '../constants.js'

// Local YYYY-MM-DD for a Date (avoids UTC off-by-one from toISOString on tz-shifted days).
export function isoLocal(date) {
  const off = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - off).toISOString().slice(0, 10)
}

export function todayIso() {
  return isoLocal(new Date())
}

// Status sort order: Blocked → In progress → Not started → Done.
const STATUS_ORDER = { Blocked: 0, 'In progress': 1, 'Not started': 2, Done: 3 }

// Sort a category's items: status order, then due ascending (empty last), then priority A→B→C.
export function sortItems(list) {
  return [...list].sort(
    (a, b) =>
      STATUS_ORDER[a.status] - STATUS_ORDER[b.status] ||
      ((a.due || '9999') < (b.due || '9999')
        ? -1
        : a.due === b.due
          ? 0
          : 1) ||
      PRIORITIES.indexOf(a.pri) - PRIORITIES.indexOf(b.pri),
  )
}

// Top-line KPIs. open = not Done; overdue = open with due < today;
// dueThisWeek = open with due within [today, today+7].
export function computeKpis(items) {
  const today = todayIso()
  const weekEnd = new Date()
  weekEnd.setDate(weekEnd.getDate() + 7)
  const weekStr = isoLocal(weekEnd)

  const open = items.filter((i) => i.status !== 'Done')
  const done = items.filter((i) => i.status === 'Done')
  const overdue = open.filter((i) => i.due && i.due < today)
  const dueThisWeek = open.filter((i) => i.due && i.due >= today && i.due <= weekStr)
  const pct = items.length ? Math.round((done.length / items.length) * 100) : 0

  return {
    openCount: open.length,
    doneCount: done.length,
    overdueCount: overdue.length,
    dueWeekCount: dueThisWeek.length,
    pct,
    progressNote: items.length
      ? `${pct}% of ${items.length} actions complete`
      : 'Add actions below to start the plan',
  }
}

// Stacked-column geometry for the "Progress by category" chart.
// Column height ∝ category size / largest category; top radius on the topmost segment.
export function computeBars(items) {
  const max = Math.max(1, ...CATEGORIES.map((c) => items.filter((i) => i.cat === c.id).length))
  return CATEGORIES.map((c) => {
    const list = items.filter((i) => i.cat === c.id)
    const total = list.length
    const done = list.filter((i) => i.status === 'Done').length
    const totalPx = (total / max) * 110
    const donePx = total ? (done / total) * totalPx : 0
    return {
      id: c.id,
      name: c.name,
      label: total ? `${done} / ${total}` : '—',
      openH: Math.max(0, totalPx - donePx),
      doneH: donePx,
      // Round the top of the done segment only when it reaches the very top.
      doneRadius: donePx >= totalPx - 0.5 ? '3px 3px 0 0' : '0',
    }
  })
}

// Next review date: advance the anchor by the cadence step until it is >= today.
export function nextReviewDate(anchor, cadence) {
  const step = CADENCE_STEP[cadence]
  const today = todayIso()
  const next = new Date(anchor + 'T00:00')
  while (isoLocal(next) < today) next.setDate(next.getDate() + step)
  return next
}
