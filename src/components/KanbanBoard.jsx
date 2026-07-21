// Kanban board: one column per status (Not started / In progress / Blocked /
// Done). Cards are dragged between columns to change status. A quick-add bar
// above the board creates Not-started cards in a chosen category.

import { useState } from 'react'
import { C, FONT, STATUSES, STATUS_META, CATEGORIES } from '../constants.js'
import { sortItems } from '../lib/compute.js'
import KanbanCard from './KanbanCard.jsx'

export default function KanbanBoard({ items, density, onUpdate, onRemove, onAdd }) {
  const compact = density === 'compact'
  const [draggingId, setDraggingId] = useState(null)
  const [dragOver, setDragOver] = useState(null)

  // Quick-add bar state (category + text).
  const [addCat, setAddCat] = useState('tasks')
  const [addText, setAddText] = useState('')
  const submitAdd = () => {
    const text = addText.trim()
    if (!text) return
    onAdd(addCat, text)
    setAddText('')
  }

  // Group the (already search/category-filtered) items by status.
  const byStatus = Object.fromEntries(STATUSES.map((s) => [s, []]))
  for (const i of items) byStatus[i.status].push(i)

  const handleDrop = (e, status) => {
    setDragOver(null)
    // Prefer the id carried by the drag payload; fall back to tracked state.
    const raw = e.dataTransfer.getData('text/plain')
    const item =
      items.find((i) => String(i.id) === raw) || items.find((i) => i.id === draggingId)
    if (item && item.status !== status) onUpdate(item.id, { status })
    setDraggingId(null)
  }

  return (
    <div>
      {/* Quick-add bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: C.white,
          border: `1.5px solid ${C.cardBorder}`,
          borderRadius: 8,
          padding: '9px 14px',
          marginBottom: 18,
        }}
      >
        <div style={{ color: C.darkGold, fontSize: 15 }}>＋</div>
        <select
          value={addCat}
          onChange={(e) => setAddCat(e.target.value)}
          style={{
            background: C.white,
            color: C.ink,
            border: `1.5px solid ${C.cardBorder}`,
            borderRadius: 6,
            padding: '6px 8px',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
            flex: 'none',
          }}
        >
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <input
          value={addText}
          onChange={(e) => setAddText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submitAdd()
          }}
          placeholder="Add an action — it starts in Not started…"
          style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 13.5, color: C.ink }}
        />
        <div
          className="btn-navy"
          onClick={submitAdd}
          style={{
            color: C.white,
            fontSize: 12,
            fontWeight: 600,
            padding: '7px 14px',
            borderRadius: 5,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            flex: 'none',
          }}
        >
          Add
        </div>
      </div>

      {/* Columns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, alignItems: 'start' }}>
        {STATUSES.map((status) => {
          const meta = STATUS_META[status]
          const cards = sortItems(byStatus[status])
          const isOver = dragOver === status
          return (
            <div
              key={status}
              onDragOver={(e) => {
                e.preventDefault()
                e.dataTransfer.dropEffect = 'move'
                if (dragOver !== status) setDragOver(status)
              }}
              onDragLeave={(e) => {
                // Only clear when leaving the column entirely.
                if (!e.currentTarget.contains(e.relatedTarget)) setDragOver((s) => (s === status ? null : s))
              }}
              onDrop={(e) => handleDrop(e, status)}
              style={{
                background: isOver ? meta.tint : C.pageBg,
                border: `1.5px solid ${isOver ? meta.accent : C.cardBorder}`,
                borderRadius: 10,
                padding: 12,
                minHeight: 120,
                transition: 'background .1s, border-color .1s',
              }}
            >
              {/* Column header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  paddingBottom: 10,
                  marginBottom: 10,
                  borderBottom: `2px solid ${meta.accent}`,
                }}
              >
                <span style={{ width: 9, height: 9, borderRadius: '50%', background: meta.accent, flex: 'none' }} />
                <span
                  style={{
                    fontSize: 11.5,
                    fontWeight: 700,
                    letterSpacing: '.06em',
                    textTransform: 'uppercase',
                    color: C.navy,
                  }}
                >
                  {status}
                </span>
                <span style={{ fontFamily: FONT.mono, fontSize: 11.5, color: C.faint, marginLeft: 'auto' }}>
                  {cards.length}
                </span>
              </div>

              {/* Cards */}
              {cards.length === 0 ? (
                <div style={{ padding: '14px 4px', fontSize: 12, color: C.faint, textAlign: 'center' }}>
                  {isOver ? 'Drop here' : '—'}
                </div>
              ) : (
                cards.map((item) => (
                  <KanbanCard
                    key={item.id}
                    item={item}
                    compact={compact}
                    dragging={draggingId === item.id}
                    onDragStart={setDraggingId}
                    onDragEnd={() => {
                      setDraggingId(null)
                      setDragOver(null)
                    }}
                    onUpdate={onUpdate}
                    onRemove={onRemove}
                  />
                ))
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
