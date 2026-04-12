// Fantasy Theme Constants from Sprint 2 Spec

export const COLORS = {
  // Dark parchment/obsidian backgrounds
  background: '#1a1a2e',
  surface: '#252542',
  surfaceLight: '#2d2d4a',

  // Accent colors
  gold: '#f0c040',
  teal: '#2de0b0',

  // Status colors
  pending: '#f39c12',
  accepted: '#2ecc71',
  completed: '#3498db',
  declined: '#e74c3c',

  // Text colors
  textPrimary: '#f5f5f5',
  textSecondary: '#b8b8d0',
  textMuted: '#7a7a95',

  // UI elements
  border: '#3a3a5a',
  shadow: '#000000',
  white: '#ffffff',
};

export const FONTS = {
  heading: 'System', // Would use Cinzel in production
  body: 'System',    // Would use Nunito in production
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const CATEGORY_ICONS: Record<string, string> = {
  Fitness: '💪',
  Courage: '🦁',
  Creativity: '🎨',
  Wisdom: '📚',
  Social: '🤝',
  Adventure: '🗺️',
};

export const QUEST_ICONS = {
  scroll: '📜',
  shield: '🛡️',
  sword: '⚔️',
  flame: '🔥',
  star: '⭐',
  trophy: '🏆',
  crown: '👑',
};
