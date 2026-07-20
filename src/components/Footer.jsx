// Footer: attribution on the left, long-form today's date on the right.

import { C, FONT } from '../constants.js'

export default function Footer({ todayLabel }) {
  return (
    <div style={{ borderTop: `1px solid ${C.cardBorder}`, background: C.white }}>
      <div
        style={{
          maxWidth: 1180,
          margin: '0 auto',
          padding: '14px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: 11.5,
          color: C.faint,
        }}
      >
        <span>Angel Montes · Advanced Warfare · angel.j.montes.civ@us.navy.mil</span>
        <span style={{ fontFamily: FONT.mono }}>{todayLabel}</span>
      </div>
    </div>
  )
}
