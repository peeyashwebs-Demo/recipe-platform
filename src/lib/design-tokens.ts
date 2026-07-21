export const designTokens = {
  typography: {
    display: "var(--text-display)",
    h2: "var(--text-h2)",
    h3: "var(--text-h3)",
    body: "var(--text-body)",
    small: "var(--text-small)",
    xs: "var(--text-xs)",
  },
  fontFamily: {
    display: "var(--font-display)",
    body: "var(--font-body)",
    mono: "var(--font-mono)",
  },
  shadow: {
    sm: "var(--shadow-sm)",
    md: "var(--shadow-md)",
    lg: "var(--shadow-lg)",
  },
  motion: {
    easeStandard: "var(--ease-standard)",
    durationFast: "var(--duration-fast)",
    durationBase: "var(--duration-base)",
    durationSlow: "var(--duration-slow)",
  },
  color: {
    accent: {
      primary: "var(--accent-primary)",
      hover: "var(--accent-primary-hover)",
    },
    bg: {
      base: "var(--bg-base)",
      surface: "var(--bg-surface)",
    },
    surface: {
      1: "var(--surface-1)",
      2: "var(--surface-2)",
    },
    fg: {
      primary: "var(--fg-primary)",
      secondary: "var(--fg-secondary)",
      muted: "var(--fg-muted)",
    },
    border: {
      subtle: "var(--border-subtle)",
      default: "var(--border-default)",
    },
    state: {
      success: "var(--state-success)",
      warning: "var(--state-warning)",
      danger: "var(--state-danger)",
    },
    overlay: "var(--overlay)",
  },
} as const;
