// A draggable Kanban card: category tag, priority pill, editable description,
// owner, due date (with overdue flag), and delete. Dragging the card to another
// column changes its status (handled by the board).

import { C, FONT, CATEGORIES, CATEGORY_META } from '../constants.js'
import { todayIso } from '../lib/compute.js'

const PRI_BG = { A: C.navy, B: C.darkGold, C: C.faint }

export default function KanbanCard({ item, compact, dragging, onDragStart, onDragEnd, onUpdate, onRemove }) {
  const cat = CATEGORIES.find((c) => c.id === item.cat)
  const meta = CATEGORY_META[item.cat]
  const isDone = item.status === 'Done'
  const isOverdue = item.due && item.due < todayIso() && !isDone
  const pad = compact ? 9 : 12

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = 'move'
        e.dataTransfer.setData('text/plain', String(item.id))
        onDragStart(item.id)
      }}
      onDragEnd={onDragEnd}
      style={{
        background: C.white,
        border: `1px solid ${C.cardBorder}`,
        borderLeft: `3px solid ${meta.color}`,
        borderRadius: 8,
        padding: pad,
        marginBottom: 10,
        cursor: 'grab',
        opacity: dragging ? 0.4 : 1,
        boxShadow: '0 1px 2px rgba(19,41,75,.05)',
      }}
    >
      {/* Top: category tag + priority pill */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '.04em',
            color: meta.color,
            textTransform: 'uppercase',
          }}
        >
          <span style={{ fontSize: 11 }}>{cat.icon}</span>
          {meta.short}
        </span>
        <span
          onClick={() => onUpdate(item.id, { pri: nextPri(item.pri) })}
          title="Click to change priority"
          style={{
            background: PRI_BG[item.pri],
            color: C.white,
            fontSize: 10,
            fontWeight: 700,
            padding: '2px 9px',
            borderRadius: 9,
            cursor: 'pointer',
          }}
        >
          {item.pri}
        </span>
      </div>

      {/* Description */}
      <input
        value={item.desc}
        onChange={(e) => onUpdate(item.id, { desc: e.target.value })}
        style={{
          width: '100%',
          border: 'none',
          background: 'transparent',
          fontSize: 13.5,
          fontWeight: isDone ? 400 : 600,
          color: isDone ? C.faint : C.ink,
          textDecoration: isDone ? 'line-through' : 'none',
          padding: 0,
          marginBottom: 8,
        }}
      />

      {/* Owner + due + delete */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input
          value={item.owner}
          onChange={(e) => onUpdate(item.id, { owner: e.target.value })}
          placeholder="assign…"
          style={{
            flex: 1,
            minWidth: 0,
            border: 'none',
            background: 'transparent',
            fontSize: 12,
            color: C.muted,
            padding: 0,
          }}
        />
        <input
          type="date"
          value={item.due}
          onChange={(e) => onUpdate(item.id, { due: e.target.value })}
          style={{
            border: 'none',
            background: 'transparent',
            fontFamily: FONT.mono,
            fontSize: 11,
            color: isOverdue ? C.red : C.muted,
            padding: 0,
            width: 104,
          }}
        />
        <span
          className="delete-x"
          onClick={() => onRemove(item.id)}
          title="Delete"
          style={{ fontSize: 14, cursor: 'pointer', lineHeight: 1, flex: 'none' }}
        >
          ×
        </span>
      </div>

      {isOverdue && (
        <div style={{ marginTop: 6, fontSize: 9.5, fontWeight: 700, color: C.red, letterSpacing: '.05em' }}>
          OVERDUE
        </div>
      )}
    </div>
  )
}

function nextPri(pri) {
  const order = ['A', 'B', 'C']
  return order[(order.indexOf(pri) + 1) % order.length]
}
