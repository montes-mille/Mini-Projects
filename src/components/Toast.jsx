// Transient confirmation/error toast, fixed bottom-center.

import { C } from '../constants.js'

export default function Toast({ message }) {
  if (!message) return null
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 28,
        left: '50%',
        transform: 'translateX(-50%)',
        background: C.navy,
        color: C.white,
        fontSize: 13,
        fontWeight: 600,
        padding: '11px 22px',
        borderRadius: 8,
        boxShadow: '0 8px 24px rgba(19,41,75,.35)',
        animation: 'toastin .25s ease',
        zIndex: 50,
        whiteSpace: 'nowrap',
      }}
    >
      {message}
    </div>
  )
}
