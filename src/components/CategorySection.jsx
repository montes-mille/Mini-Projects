// One category section: heading with count, a quick-add row, the column header,
// and the sorted item rows (or an empty-state line).

import { C, FONT } from '../constants.js'
import ItemRow from './ItemRow.jsx'

const GRID = '30px 1fr 140px 150px 96px 34px'

export default function CategorySection({
  category,
  items,
  total,
  doneCount,
  draft,
  rowPad,
  emptyMessage,
  onDraftChange,
  onAdd,
  onCycleStatus,
  onCyclePri,
  onUpdate,
  onRemove,
}) {
  const countNote = total === 0 ? '' : `${doneCount} of ${total} done`
  // Fall back to the category's default empty line when no override is given.
  const emptyLine = emptyMessage ?? category.empty

  return (
    <div style={{ marginBottom: 34 }}>
      {/* Heading */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 10 }}>
        <span style={{ fontSize: 16, color: C.darkGold, fontWeight: 300 }}>
          {category.icon}
        </span>
        <span
          style={{
            fontFamily: FONT.serif,
            fontSize: 21,
            fontWeight: 700,
            color: C.navy,
          }}
        >
          {category.name}
        </span>
        <span style={{ fontSize: 12, color: C.faint }}>{countNote}</span>
      </div>

      {/* Quick add */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: C.white,
          border: `1.5px solid ${C.cardBorder}`,
          borderRadius: 8,
          padding: '9px 14px',
          marginBottom: 2,
        }}
      >
        <div style={{ color: C.darkGold, fontSize: 15 }}>＋</div>
        <input
          value={draft}
          onChange={(e) => onDraftChange(category.id, e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onAdd(category.id)
          }}
          placeholder={category.hint}
          style={{
            flex: 1,
            border: 'none',
            background: 'transparent',
            fontSize: 13.5,
            color: C.ink,
          }}
        />
        <div
          className="btn-navy"
          onClick={() => onAdd(category.id)}
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

      {/* Column header */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: GRID,
          gap: 12,
          alignItems: 'center',
          padding: '10px 14px 6px',
          fontSize: 10.5,
          fontWeight: 700,
          letterSpacing: '.09em',
          color: C.faint,
        }}
      >
        <div />
        <div>ACTION</div>
        <div>OWNER</div>
        <div>DUE</div>
        <div style={{ textAlign: 'center' }}>PRIORITY</div>
        <div />
      </div>

      {/* Rows or empty state */}
      {items.length === 0 ? (
        <div
          style={{
            padding: '18px 14px',
            borderTop: `1px solid ${C.track}`,
            fontSize: 13,
            color: C.faint,
            lineHeight: 1.5,
          }}
        >
          {emptyLine}
        </div>
      ) : (
        items.map((item) => (
          <ItemRow
            key={item.id}
            item={item}
            rowPad={rowPad}
            onCycleStatus={onCycleStatus}
            onCyclePri={onCyclePri}
            onUpdate={onUpdate}
            onRemove={onRemove}
          />
        ))
      )}
    </div>
  )
}
