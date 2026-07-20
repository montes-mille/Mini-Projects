// Domain constants and design tokens for the Team Action Plan.
// Colors, radii, and font stacks mirror the design handoff exactly.

export const STORAGE_KEY = 'actionplan-v1'

export const STATUSES = ['Not started', 'In progress', 'Blocked', 'Done']
export const PRIORITIES = ['A', 'B', 'C']
export const CADENCES = ['weekly', 'biweekly', 'monthly']

// Fixed category definitions (id, display name, glyph, quick-add hint, empty line).
export const CATEGORIES = [
  {
    id: 'tasks',
    name: 'Tasks & Milestones',
    icon: '◆',
    hint: 'Add a task or milestone — describe the action, then assign owner and due date…',
    empty: 'No tasks yet — add the first action above.',
  },
  {
    id: 'risks',
    name: 'Risks & Concerns',
    icon: '⚑',
    hint: 'Add a risk — what could go wrong, and what action addresses it…',
    empty: 'No risks raised — good, but keep watch.',
  },
  {
    id: 'commitments',
    name: 'Commitments',
    icon: '✓',
    hint: 'Add a commitment — what was promised, to whom, by when…',
    empty: 'No commitments recorded yet.',
  },
]

// Display names keyed by category id — used for Excel export and imports.
export const CATEGORY_NAMES = {
  tasks: 'Tasks & Milestones',
  risks: 'Risks & Concerns',
  commitments: 'Commitments',
}

export const CADENCE_STEP = { weekly: 7, biweekly: 14, monthly: 30 }

// Design tokens — see "Design Tokens" section of the handoff README.
export const C = {
  navy: '#13294B',
  navyHover: '#1A3560',
  navyBorder: '#2A4A7A',
  mutedBlue: '#9FB0C4',
  mutedBlue2: '#C7D3E0',
  gold: '#C9A227',
  darkGold: '#8A6D1F',
  pageBg: '#FBFAF7',
  cardBorder: '#E2DFD6',
  track: '#EAE7DE',
  hoverRow: '#F5F2EA',
  ink: '#1B2733',
  muted: '#7A756A',
  faint: '#A29C8E',
  disabled: '#C9C3B4',
  red: '#A34141',
  white: '#fff',
}

export const FONT = {
  serif: "'Source Serif 4', serif",
  ui: "'Public Sans', system-ui, sans-serif",
  mono: "'IBM Plex Mono', monospace",
}
