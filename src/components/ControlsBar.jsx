// Controls bar: free-text search, owner/priority/status filters, a clear button,
// and the display options (show completed, density). View state only — nothing
// here is persisted.

import { C, FONT, STATUSES, PRIORITIES } from '../constants.js'

const labelStyle = {
  fontSize: 10.5,
  fontWeight: 700,
  letterSpacing: '.09em',
  color: C.faint,
  textTransform: 'uppercase',
}

const selectStyle = {
  background: C.white,
  color: C.ink,
  border: `1.5px solid ${C.cardBorder}`,
  borderRadius: 6,
  padding: '6px 8px',
  fontSize: 12,
  fontWeight: 600,
  cursor: 'pointer',
}

// Small segmented two-option toggle (used for density and show-completed).
function Toggle({ options, value, onChange }) {
  return (
    <div
      style={{
        display: 'inline-flex',
        border: `1.5px solid ${C.cardBorder}`,
        borderRadius: 6,
        overflow: 'hidden',
      }}
    >
      {options.map((opt) => {
        const active = opt.value === value
        return (
          <div
            key={opt.value}
            onClick={() => onChange(opt.value)}
            style={{
              padding: '6px 11px',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              background: active ? C.navy : C.white,
              color: active ? C.white : C.muted,
            }}
          >
            {opt.label}
          </div>
        )
      })}
    </div>
  )
}

export default function ControlsBar({
  search,
  owner,
  priority,
  status,
  owners,
  filtersActive,
  showCompleted,
  density,
  matchNote,
  onSearch,
  onOwner,
  onPriority,
  onStatus,
  onClear,
  onToggleCompleted,
  onDensity,
}) {
  return (
    <div
      style={{
        background: C.white,
        border: `1.5px solid ${C.cardBorder}`,
        borderRadius: 10,
        padding: '14px 18px',
        marginBottom: 28,
        display: 'flex',
        alignItems: 'center',
        gap: 18,
        flexWrap: 'wrap',
      }}
    >
      {/* Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: '1 1 220px', minWidth: 200 }}>
        <span style={{ color: C.faint, fontSize: 14 }}>⌕</span>
        <input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search actions or owners…"
          style={{
            flex: 1,
            border: 'none',
            background: 'transparent',
            fontSize: 13,
            color: C.ink,
          }}
        />
      </div>

      {/* Owner */}
      <label style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <span style={labelStyle}>Owner</span>
        <select value={owner} onChange={(e) => onOwner(e.target.value)} style={selectStyle}>
          <option value="all">All</option>
          {owners.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </label>

      {/* Priority */}
      <label style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <span style={labelStyle}>Priority</span>
        <select value={priority} onChange={(e) => onPriority(e.target.value)} style={selectStyle}>
          <option value="all">All</option>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </label>

      {/* Status */}
      <label style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <span style={labelStyle}>Status</span>
        <select value={status} onChange={(e) => onStatus(e.target.value)} style={selectStyle}>
          <option value="all">All</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>

      {/* Clear filters */}
      {filtersActive && (
        <div
          onClick={onClear}
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: C.darkGold,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          Clear ✕
        </div>
      )}

      {/* Divider pushes display options to the right */}
      <div style={{ flex: 1 }} />

      {/* Match note when filtering */}
      {matchNote && (
        <span style={{ fontFamily: FONT.mono, fontSize: 11.5, color: C.muted, whiteSpace: 'nowrap' }}>
          {matchNote}
        </span>
      )}

      {/* Show completed */}
      <label style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <span style={labelStyle}>Completed</span>
        <Toggle
          value={showCompleted ? 'show' : 'hide'}
          onChange={(v) => onToggleCompleted(v === 'show')}
          options={[
            { value: 'show', label: 'Show' },
            { value: 'hide', label: 'Hide' },
          ]}
        />
      </label>

      {/* Density */}
      <label style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <span style={labelStyle}>Density</span>
        <Toggle
          value={density}
          onChange={onDensity}
          options={[
            { value: 'comfortable', label: 'Comfortable' },
            { value: 'compact', label: 'Compact' },
          ]}
        />
      </label>
    </div>
  )
}
