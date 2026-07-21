// Team Action Plan — front-facing UI for an Excel-backed action tracker.
// Composes the header, summary KPIs, category chart, and the three category
// sections, and wires the Excel export/import round-trip.

import { useMemo, useState } from 'react'
import { CATEGORIES } from './constants.js'
import { useActionPlan } from './hooks/useActionPlan.js'
import {
  computeKpis,
  computeBars,
  sortItems,
  filterItems,
  distinctOwners,
  hasActiveFilters,
  nextReviewDate,
} from './lib/compute.js'
import { exportWorkbook, importWorkbook } from './lib/excel.js'
import Header from './components/Header.jsx'
import SummaryStrip from './components/SummaryStrip.jsx'
import CategoryChart from './components/CategoryChart.jsx'
import ControlsBar from './components/ControlsBar.jsx'
import CategorySection from './components/CategorySection.jsx'
import KanbanBoard from './components/KanbanBoard.jsx'
import Footer from './components/Footer.jsx'
import Toast from './components/Toast.jsx'

const EMPTY_FILTERS = { search: '', category: 'all', owner: 'all', priority: 'all', status: 'all' }

export default function App() {
  // Display + filter options are view state — not persisted (per the handoff).
  const [view, setView] = useState('board')
  const [showCompleted, setShowCompleted] = useState(true)
  const [density, setDensity] = useState('comfortable')
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const setFilter = (key, value) => setFilters((f) => ({ ...f, [key]: value }))

  // Switching to the board clears any status filter — the columns are the statuses.
  const changeView = (next) => {
    if (next === 'board') setFilters((f) => ({ ...f, status: 'all' }))
    setView(next)
  }

  const {
    state,
    toast,
    showToast,
    setDraft,
    addItem,
    updateItem,
    removeItem,
    cycleStatus,
    cyclePriority,
    setCadence,
    markReviewed,
    replaceFromImport,
  } = useActionPlan()

  const { items, cadence, anchor, drafts } = state

  // ---- Derived values ----
  // KPIs and the category chart always reflect the full plan, not the filtered view.
  const kpis = useMemo(() => computeKpis(items), [items])
  const bars = useMemo(() => computeBars(items), [items])

  const filtersActive = hasActiveFilters(filters)
  const owners = useMemo(() => distinctOwners(items), [items])

  const sections = useMemo(
    () =>
      CATEGORIES.map((c) => {
        const all = items.filter((i) => i.cat === c.id)
        let visible = showCompleted ? all : all.filter((i) => i.status !== 'Done')
        visible = filterItems(visible, filters)
        // Distinguish "no matches" (category has items) from a genuinely empty category.
        const emptyMessage =
          all.length > 0 && visible.length === 0
            ? 'No matching actions — adjust the search or filters above.'
            : undefined
        return {
          category: c,
          total: all.length,
          doneCount: all.filter((i) => i.status === 'Done').length,
          items: sortItems(visible),
          emptyMessage,
        }
      }),
    [items, showCompleted, filters],
  )

  // Board items: same search/category/owner/priority filters as the list, but the
  // status filter is ignored (columns represent status). showCompleted still hides
  // Done cards when off.
  const boardItems = useMemo(() => {
    const base = showCompleted ? items : items.filter((i) => i.status !== 'Done')
    return filterItems(base, { ...filters, status: 'all' })
  }, [items, showCompleted, filters])

  // Rows/cards shown vs. total items, surfaced as a note while filtering.
  const shownCount =
    view === 'board' ? boardItems.length : sections.reduce((n, s) => n + s.items.length, 0)
  const matchNote = filtersActive ? `${shownCount} of ${items.length} shown` : ''

  const nextReview = useMemo(() => {
    return nextReviewDate(anchor, cadence).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
  }, [anchor, cadence])

  const todayLabel = useMemo(
    () =>
      new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
    [],
  )

  const rowPad = density === 'compact' ? '7px' : '11px'

  // ---- Excel round-trip ----
  async function handleExport() {
    try {
      const result = await exportWorkbook(items, cadence, anchor)
      if (result === 'saved') showToast('Saved Team Action Plan.xlsx')
      else if (result === 'downloaded')
        showToast('Exported Team Action Plan.xlsx — edit it in Excel and import it back')
      // 'cancelled' is silent.
    } catch {
      showToast('Could not export the workbook')
    }
  }

  function handleImport() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept =
      '.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    input.onchange = async () => {
      const file = input.files && input.files[0]
      if (!file) return
      try {
        const { items: imported, cadence: cad, anchor: anc } = await importWorkbook(file)
        const patch = { items: imported }
        if (cad) patch.cadence = cad
        if (anc) patch.anchor = anc
        replaceFromImport(patch)
        showToast(`Imported ${imported.length} actions from ${file.name}`)
      } catch (err) {
        if (err && err.message === 'NO_SHEET')
          showToast('No "Action Plan" sheet found in that file')
        else showToast('Could not read that file — is it a .xlsx?')
      }
    }
    input.click()
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header
        nextReview={nextReview}
        cadence={cadence}
        onExport={handleExport}
        onImport={handleImport}
        onSetCadence={setCadence}
        onMarkReviewed={markReviewed}
      />

      <div
        style={{
          maxWidth: 1180,
          width: '100%',
          margin: '0 auto',
          padding: '26px 32px 60px',
          boxSizing: 'border-box',
          flex: 1,
        }}
      >
        <SummaryStrip kpis={kpis} />
        <CategoryChart bars={bars} />

        <ControlsBar
          view={view}
          search={filters.search}
          category={filters.category}
          owner={filters.owner}
          priority={filters.priority}
          status={filters.status}
          owners={owners}
          filtersActive={filtersActive}
          showCompleted={showCompleted}
          density={density}
          matchNote={matchNote}
          onView={changeView}
          onSearch={(v) => setFilter('search', v)}
          onCategory={(v) => setFilter('category', v)}
          onOwner={(v) => setFilter('owner', v)}
          onPriority={(v) => setFilter('priority', v)}
          onStatus={(v) => setFilter('status', v)}
          onClear={() => setFilters(EMPTY_FILTERS)}
          onToggleCompleted={setShowCompleted}
          onDensity={setDensity}
        />

        {view === 'board' ? (
          <KanbanBoard
            items={boardItems}
            density={density}
            onUpdate={updateItem}
            onRemove={removeItem}
            onAdd={addItem}
          />
        ) : (
          sections.map((s) => (
            <CategorySection
              key={s.category.id}
              category={s.category}
              items={s.items}
              total={s.total}
              doneCount={s.doneCount}
              draft={drafts[s.category.id]}
              rowPad={rowPad}
              emptyMessage={s.emptyMessage}
              onDraftChange={setDraft}
              onAdd={addItem}
              onCycleStatus={cycleStatus}
              onCyclePri={cyclePriority}
              onUpdate={updateItem}
              onRemove={removeItem}
            />
          ))
        )}
      </div>

      <Footer todayLabel={todayLabel} />
      <Toast message={toast} />
    </div>
  )
}
