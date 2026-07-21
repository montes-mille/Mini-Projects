// "Progress by category" card: a stacked column per category (done gold below,
// open gray above) sized by category volume.

import { C, FONT } from '../constants.js'

function Swatch({ color }) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: 10,
        height: 10,
        background: color,
        borderRadius: 2,
        verticalAlign: -1,
      }}
    />
  )
}

export default function CategoryChart({ bars }) {
  return (
    <div
      style={{
        background: C.white,
        border: `1.5px solid ${C.cardBorder}`,
        borderRadius: 10,
        padding: '18px 24px 20px',
        marginBottom: 28,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          marginBottom: 14,
        }}
      >
        <div
          style={{
            fontFamily: FONT.serif,
            fontSize: 17,
            fontWeight: 700,
            color: C.navy,
          }}
        >
          Progress by category
        </div>
        <div style={{ fontSize: 11.5, color: C.muted }}>
          done <Swatch color={C.gold} /> · open <Swatch color={C.cardBorder} />
        </div>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 32,
          alignItems: 'end',
        }}
      >
        {bars.map((b) => (
          <div
            key={b.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <div style={{ fontFamily: FONT.mono, fontSize: 11.5, color: C.muted }}>
              {b.label}
            </div>
            <div
              style={{
                width: 56,
                height: 110,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                borderBottom: `1.5px solid ${C.cardBorder}`,
              }}
            >
              <div
                style={{
                  width: '100%',
                  background: C.cardBorder,
                  height: `${b.openH}px`,
                  borderRadius: '3px 3px 0 0',
                }}
              />
              <div
                style={{
                  width: '100%',
                  background: C.gold,
                  height: `${b.doneH}px`,
                  borderRadius: b.doneRadius,
                }}
              />
            </div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: C.navy,
                textAlign: 'center',
              }}
            >
              {b.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
