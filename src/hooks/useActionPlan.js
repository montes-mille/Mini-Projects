// State container for the action plan: items, review cadence/anchor, and the
// transient quick-add drafts. Persists { items, cadence, anchor } to localStorage
// under the 'actionplan-v1' key (drafts are never persisted).

import { useCallback, useEffect, useRef, useState } from 'react'
import { STORAGE_KEY, STATUSES, PRIORITIES } from '../constants.js'
import { todayIso } from '../lib/compute.js'

const emptyDrafts = { tasks: '', risks: '', commitments: '' }

function loadInitial() {
  const base = {
    items: [],
    cadence: 'weekly',
    anchor: todayIso(),
    drafts: { ...emptyDrafts },
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const saved = JSON.parse(raw)
      return { ...base, ...saved, drafts: { ...emptyDrafts } }
    }
  } catch {
    // Ignore malformed/absent storage and start fresh.
  }
  return base
}

export function useActionPlan() {
  const [state, setState] = useState(loadInitial)

  // Persist the durable slice whenever it changes.
  useEffect(() => {
    try {
      const { items, cadence, anchor } = state
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ items, cadence, anchor }))
    } catch {
      // Storage may be unavailable (private mode, quota) — non-fatal.
    }
  }, [state.items, state.cadence, state.anchor])

  // ---- Transient toast (auto-dismiss after 3.2s) ----
  const [toast, setToast] = useState('')
  const toastTimer = useRef(null)
  const showToast = useCallback((msg) => {
    clearTimeout(toastTimer.current)
    setToast(msg)
    toastTimer.current = setTimeout(() => setToast(''), 3200)
  }, [])
  useEffect(() => () => clearTimeout(toastTimer.current), [])

  // ---- Draft (quick-add) editing ----
  const setDraft = useCallback((cat, value) => {
    setState((s) => ({ ...s, drafts: { ...s.drafts, [cat]: value } }))
  }, [])

  // ---- Item mutations ----
  const addItem = useCallback((cat) => {
    setState((s) => {
      const desc = (s.drafts[cat] || '').trim()
      if (!desc) return s
      const item = {
        id: Date.now() + Math.random(),
        cat,
        desc,
        owner: '',
        due: '',
        status: 'Not started',
        pri: 'B',
      }
      return { ...s, items: [...s.items, item], drafts: { ...s.drafts, [cat]: '' } }
    })
  }, [])

  const updateItem = useCallback((id, patch) => {
    setState((s) => ({
      ...s,
      items: s.items.map((i) => (i.id === id ? { ...i, ...patch } : i)),
    }))
  }, [])

  const removeItem = useCallback((id) => {
    setState((s) => ({ ...s, items: s.items.filter((i) => i.id !== id) }))
  }, [])

  const cycleStatus = useCallback(
    (id, current) => {
      const next = STATUSES[(STATUSES.indexOf(current) + 1) % STATUSES.length]
      updateItem(id, { status: next })
    },
    [updateItem],
  )

  const cyclePriority = useCallback(
    (id, current) => {
      const next = PRIORITIES[(PRIORITIES.indexOf(current) + 1) % PRIORITIES.length]
      updateItem(id, { pri: next })
    },
    [updateItem],
  )

  // ---- Review cadence ----
  const setCadence = useCallback((cadence) => {
    setState((s) => ({ ...s, cadence }))
  }, [])

  const markReviewed = useCallback(() => {
    setState((s) => ({ ...s, anchor: todayIso() }))
  }, [])

  // ---- Bulk replace (used by Excel import) ----
  const replaceFromImport = useCallback((patch) => {
    setState((s) => ({ ...s, ...patch }))
  }, [])

  return {
    state,
    toast,
    showToast,
    setDraft,
    addItem,
    updateItem,
    removeItem,
    cycleStatus,
    cyclePriority,
    setCadence,
    markReviewed,
    replaceFromImport,
  }
}
