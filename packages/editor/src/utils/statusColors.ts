/**
 * Status colors for node execution state.
 *
 * Two palettes are intentionally kept separate:
 *  - ACCENT: used by NodeCardFrame's subtle top-line indicator
 *  - BADGE:  used by RunPanel log badges and WorkflowCanvas node borders
 *            (brighter so they read well on both light and dark surfaces)
 */
export const STATUS_ACCENT_COLOR: Record<string, string> = {
  running: '#2563eb',
  success: '#16a34a',
  failed:  '#dc2626',
};

export const STATUS_BADGE_COLOR: Record<string, string> = {
  running: '#3b82f6',
  success: '#22c55e',
  failed:  '#ef4444',
};

export const STATUS_BADGE_ICON: Record<string, string> = {
  running: 'RUN',
  success: 'DONE',
  failed:  'FAIL',
};
