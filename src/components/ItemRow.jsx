// A single action row: status dot (click-cycles), inline description with status
// tag, owner, due date with overdue tag, priority pill (click-cycles), delete.

import { C, FONT } from '../constants.js'
import { todayIso } from '../lib/compute.js'

const GRID = '30px 1fr 140px 150px 96px 34px'

// Visual spec for each status (dot fill/border/mark and the inline tag).
function statusStyle(status) {
  switch (status) {
    case 'Done':
      return { bg: C.gold, border: `1.5px solid ${C.gold}`, mark: '✓', label: '', labelColor: C.darkGold }
    case 'In progress':
      return { bg: C.navy, border: `1.5px solid ${C.navy}`, mark: '', label: 'IN PROGRESS', labelColor: C.navy }
    case 'Blocked':
      return { bg: C.red, border: `1.5px solid ${C.red}`, mark: '!', label: 'BLOCKED', labelColor: C.red }
    default:
      return { bg: 'transparent', border: `1.5px solid ${C.disabled}`, mark: '', label: '', labelColor: C.faint }
  }
}

const PRI_BG = { A: C.navy, B: C.darkGold, C: C.faint }

export default function ItemRow({ item, rowPad, onCycleStatus, onCyclePri, onUpdate, onRemove }) {
  const st = statusStyle(item.status)
  const isDone = item.status === 'Done'
  const isOverdue = item.due && item.due < todayIso() && !isDone

  return (
    <div
      className="item-row"
      style={{
        display: 'grid',
        gridTemplateColumns: GRID,
        gap: 12,
        alignItems: 'center',
        padding: `${rowPad} 14px`,
        borderTop: `1px solid ${C.track}`,
        fontSize: 13.5,
        background: isDone ? C.pageBg : C.white,
      }}
    >
      {/* Status dot */}
      <div
        onClick={() => onCycleStatus(item.id, item.status)}
        title={item.status}
        style={{
          width: 17,
          height: 17,
          borderRadius: '50%',
          background: st.bg,
          border: st.border,
          color: C.white,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 10,
          cursor: 'pointer',
          flex: 'none',
        }}
      >
        {st.mark}
      </div>

      {/* Action description + status tag */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, minWidth: 0 }}>
        <input
          value={item.desc}
          onChange={(e) => onUpdate(item.id, { desc: e.target.value })}
          style={{
            flex: 1,
            minWidth: 0,
            border: 'none',
            background: 'transparent',
            fontSize: 13.5,
            fontWeight: isDone ? 400 : 500,
            color: isDone ? C.faint : C.ink,
            textDecoration: isDone ? 'line-through' : 'none',
            padding: 0,
          }}
        />
        {st.label && (
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: st.labelColor,
              letterSpacing: '.06em',
              flex: 'none',
            }}
          >
            {st.label}
          </span>
        )}
      </div>

      {/* Owner */}
      <input
        value={item.owner}
        onChange={(e) => onUpdate(item.id, { owner: e.target.value })}
        placeholder="assign…"
        style={{
          border: 'none',
          background: 'transparent',
          fontSize: 12.5,
          color: C.ink,
          padding: 0,
        }}
      />

      {/* Due date + overdue tag */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <input
          type="date"
          value={item.due}
          onChange={(e) => onUpdate(item.id, { due: e.target.value })}
          style={{
            border: 'none',
            background: 'transparent',
            fontFamily: FONT.mono,
            fontSize: 11.5,
            color: isOverdue ? C.red : C.muted,
            padding: 0,
            width: 112,
          }}
        />
        {isOverdue && (
          <span
            style={{
              fontSize: 9.5,
              fontWeight: 700,
              color: C.red,
              letterSpacing: '.05em',
            }}
          >
            OVERDUE
          </span>
        )}
      </div>

      {/* Priority pill */}
      <div style={{ textAlign: 'center' }}>
        <span
          onClick={() => onCyclePri(item.id, item.pri)}
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

      {/* Delete */}
      <div
        className="delete-x"
        onClick={() => onRemove(item.id)}
        title="Delete"
        style={{
          fontSize: 15,
          textAlign: 'center',
          cursor: 'pointer',
          lineHeight: 1,
        }}
      >
        ×
      </div>
    </div>
  )
}
