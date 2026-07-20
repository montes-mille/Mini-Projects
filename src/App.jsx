// Team Action Plan — front-facing UI for an Excel-backed action tracker.
// Composes the header, summary KPIs, category chart, and the three category
// sections, and wires the Excel export/import round-trip.

import { useMemo } from 'react'
import { CATEGORIES } from './constants.js'
import { useActionPlan } from './hooks/useActionPlan.js'
import {
  computeKpis,
  computeBars,
  sortItems,
  nextReviewDate,
} from './lib/compute.js'
import { exportWorkbook, importWorkbook } from './lib/excel.js'
import Header from './components/Header.jsx'
import SummaryStrip from './components/SummaryStrip.jsx'
import CategoryChart from './components/CategoryChart.jsx'
import CategorySection from './components/CategorySection.jsx'
import Footer from './components/Footer.jsx'
import Toast from './components/Toast.jsx'

// Display options (settings, not persisted) — see handoff "State Management".
const DEFAULT_OPTIONS = { showCompleted: true, density: 'comfortable' }

export default function App({ options = DEFAULT_OPTIONS }) {
  const { showCompleted, density } = { ...DEFAULT_OPTIONS, ...options }
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
  const kpis = useMemo(() => computeKpis(items), [items])
  const bars = useMemo(() => computeBars(items), [items])

  const sections = useMemo(
    () =>
      CATEGORIES.map((c) => {
        const all = items.filter((i) => i.cat === c.id)
        const visible = showCompleted ? all : all.filter((i) => i.status !== 'Done')
        return {
          category: c,
          total: all.length,
          doneCount: all.filter((i) => i.status === 'Done').length,
          items: sortItems(visible),
        }
      }),
    [items, showCompleted],
  )

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

        {sections.map((s) => (
          <CategorySection
            key={s.category.id}
            category={s.category}
            items={s.items}
            total={s.total}
            doneCount={s.doneCount}
            draft={drafts[s.category.id]}
            rowPad={rowPad}
            onDraftChange={setDraft}
            onAdd={addItem}
            onCycleStatus={cycleStatus}
            onCyclePri={cyclePriority}
            onUpdate={updateItem}
            onRemove={removeItem}
          />
        ))}
      </div>

      <Footer todayLabel={todayLabel} />
      <Toast message={toast} />
    </div>
  )
}
