// Summary strip: five KPI segments — Open, Due this week, Overdue, Done, and a
// plan-progress bar.

import { C, FONT } from '../constants.js'

function Segment({ label, value, color, style }) {
  return (
    <div style={style}>
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '.1em',
          color: C.muted,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: FONT.serif,
          fontSize: 34,
          fontWeight: 700,
          color,
          lineHeight: 1.15,
        }}
      >
        {value}
      </div>
    </div>
  )
}

export default function SummaryStrip({ kpis }) {
  const { openCount, dueWeekCount, overdueCount, doneCount, pct, progressNote } = kpis
  const divided = { paddingRight: 24, borderRight: `1px solid ${C.cardBorder}` }
  const middle = { padding: '0 24px', borderRight: `1px solid ${C.cardBorder}` }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'stretch',
        background: C.white,
        border: `1.5px solid ${C.cardBorder}`,
        borderRadius: 10,
        padding: '18px 24px',
        marginBottom: 28,
      }}
    >
      <Segment label="OPEN ACTIONS" value={openCount} color={C.navy} style={divided} />
      <Segment label="DUE THIS WEEK" value={dueWeekCount} color={C.navy} style={middle} />
      <Segment
        label="OVERDUE"
        value={overdueCount}
        color={overdueCount > 0 ? C.red : C.navy}
        style={middle}
      />
      <Segment label="DONE" value={doneCount} color={C.darkGold} style={middle} />
      <div
        style={{
          paddingLeft: 24,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          flex: 1,
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '.1em',
            color: C.muted,
            marginBottom: 6,
          }}
        >
          PLAN PROGRESS
        </div>
        <div
          style={{
            height: 8,
            background: C.track,
            borderRadius: 4,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              background: C.gold,
              borderRadius: 4,
              width: `${pct}%`,
            }}
          />
        </div>
        <div style={{ fontSize: 11.5, color: C.faint, marginTop: 5 }}>{progressNote}</div>
      </div>
    </div>
  )
}
