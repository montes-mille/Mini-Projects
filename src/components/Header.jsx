// Top navy header bar: brand badge/title, Export/Import, next-review readout,
// cadence selector, and "Reviewed today".

import { C, FONT } from '../constants.js'

export default function Header({
  nextReview,
  cadence,
  onExport,
  onImport,
  onSetCadence,
  onMarkReviewed,
}) {
  return (
    <div style={{ background: C.navy, padding: '0 32px' }}>
      <div
        style={{
          maxWidth: 1180,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 76,
        }}
      >
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 38,
              height: 38,
              border: `2px solid ${C.gold}`,
              color: C.gold,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: 13,
              borderRadius: '50%',
            }}
          >
            AP
          </div>
          <div>
            <div
              style={{
                fontFamily: FONT.serif,
                fontWeight: 700,
                fontSize: 18,
                color: C.white,
              }}
            >
              Team Action Plan
            </div>
            <div
              style={{
                fontSize: 10.5,
                color: C.mutedBlue,
                letterSpacing: '.14em',
                fontWeight: 600,
              }}
            >
              DECIDE · ASSIGN · REVIEW
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            className="btn-gold-outline"
            onClick={onExport}
            style={{
              fontSize: 12,
              fontWeight: 700,
              padding: '7px 13px',
              borderRadius: 6,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            Export ▸ Excel
          </div>
          <div
            className="btn-ghost"
            onClick={onImport}
            style={{
              fontSize: 12,
              fontWeight: 600,
              padding: '7px 13px',
              borderRadius: 6,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            Import
          </div>
          <div style={{ width: 1, height: 26, background: C.navyBorder }} />
          <div style={{ textAlign: 'right', flex: 'none', whiteSpace: 'nowrap' }}>
            <div
              style={{
                fontSize: 10.5,
                color: C.mutedBlue,
                letterSpacing: '.12em',
                fontWeight: 700,
              }}
            >
              NEXT REVIEW
            </div>
            <div
              style={{
                fontFamily: FONT.serif,
                fontSize: 16,
                fontWeight: 700,
                color: C.gold,
              }}
            >
              {nextReview}
            </div>
          </div>
          <select
            value={cadence}
            onChange={(e) => onSetCadence(e.target.value)}
            style={{
              background: C.navyHover,
              color: C.white,
              border: `1px solid ${C.navyBorder}`,
              borderRadius: 6,
              padding: '7px 10px',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <option value="weekly">Weekly review</option>
            <option value="biweekly">Biweekly review</option>
            <option value="monthly">Monthly review</option>
          </select>
          <div
            className="btn-gold-outline"
            onClick={onMarkReviewed}
            style={{
              fontSize: 12,
              fontWeight: 700,
              padding: '7px 14px',
              borderRadius: 6,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            Reviewed today
          </div>
        </div>
      </div>
    </div>
  )
}
