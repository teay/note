# System Design Specification: AI-Powered Financial Dashboard (Dark Mode UI)

This specification defines the system architecture, UI layout rules, dynamic layout behavior, state tracking variables, and complete CSS variable sheets required to construct a modular, glassmorphism-based fintech interface inspired by the **Google Finance AI Overhaul UX**.

---

## 1. Core Visual Tokens & Theme Variables

### Color Palette (Dark Theme Preference)
*   `--bg-main`: `#0b0d19` (Deep obsidian navy base)
*   `--surface-card`: `rgba(23, 27, 48, 0.45)` (Semi-transparent dark glass layer)
*   `--border-glass`: `rgba(255, 255, 255, 0.08)` (Subtle surface edge illumination)
*   `--text-primary`: `#f3f4f6` (Off-white high contrast readable text)
*   `--text-secondary`: `#9ca3af` (Muted silver for secondary details)
*   `--brand-glow`: `rgba(99, 102, 241, 0.15)` (Soft ambient indigo backlight)

### Accents & Indicators
*   `--accent-positive`: `#10b981` (Vibrant emerald green for positive growth markers)
*   `--accent-interactive`: `#6366f1` (Indigo neon hue for active focal state outlines)
*   `--accent-track`: `#374151` (Medium gray backdrop for non-filled progress bars)

---

## 2. Layout Distribution & Component Definitions

The platform runs a bento-style floating spatial layout where separate AI tools and performance panels cluster dynamically.

### Component A: AI Interaction Prompt Bar (`.ai-prompt-bar`)
*   **Purpose:** The central conversational control block enabling plain-language interactions with personal capital assets.
*   **UI Rules:**
    *   Centrally mounted or anchored at the low-mid focal region.
    *   Fitted with a responsive multi-line input viewport (`placeholder="Ask anything"`).
    *   Contains a nested absolute action suite: Left side functional append button (`+`) and right side execution container (Up arrow icon).
    *   Maintains an active ring glow using `--accent-interactive` upon user click.

### Component B: Agentic Task Scheduler (`.agent-scheduler-card`)
*   **Purpose:** Allows setup of background background analytics jobs or automated brief triggers.
*   **UI Rules:**
    *   A high-blur horizontal panel displaying active processing timelines.
    *   Top sector maps out a double-layered gradient completion bar.
    *   Sub-sector displays selected frequency metadata (e.g., `"Daily • 8:00 AM PDT"`) right next to an interactive utility glyph (Edit Pencil).
    *   Bottom row aggregates action confirmation buttons: `.btn-create` and `.btn-cancel`.

### Component C: Live Equity Tracker Widget (`.market-ticker-card`)
*   **Purpose:** Displays focused vector charts representing real-time indices or single assets (e.g., S&P 500).
*   **UI Rules:**
    *   Vertical stack framework with compact width parameters.
    *   Top section exposes target index identity alongside absolute quantitative data (`7,394.30`).
    *   Inline badge containing a fractional shift value (`+1.75%`) with variable color handling controlled by `--accent-positive`.
    *   Bottom quadrant renders an isolated SVG area graph filled with a semi-opaque positive green gradient wash.

### Component D: Generative Portfolio Architect (`.portfolio-builder-card`)
*   **Purpose:** Visual onboarding prompt for context ingestion (CSV, PDF, or screenshots).
*   **UI Rules:**
    *   Rounded block containing an illustrative vector sequence path indicating an active data ingestion journey.
    *   Main text label sets the core call to action: `"Create a portfolio"`.

### Component E: Analytical Metrics Cluster (`.metrics-stack-card`)
*   **Purpose:** Shows real-time risk parameters, leverage indicators, or diversification ratios.
*   **UI Rules:**
    *   Vertical group displaying three structural pill shapes stacked uniformly.
    *   Each row lists a custom left-aligned icon coupled with a horizontal fill bar indicating concentration percentages or metrics.

---

## 3. Global CSS Layout & Interactive Blueprints

```css
/* Custom Global Setup */
body {
  background-color: var(--bg-main);
  color: var(--text-primary);
  font-family: 'Inter', system-ui, sans-serif;
  margin: 0;
  padding: 0;
}

/* Glassmorphism Surface Pattern */
.glass-panel {
  background: var(--surface-card);
  backdrop-filter: blur(16px) saturate(120%);
  -webkit-backdrop-filter: blur(16px) saturate(120%);
  border: 1px solid var(--border-glass);
  border-radius: 16px;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.glass-panel:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px 0 rgba(99, 102, 241, 0.1);
}

/* AI Input Widget Layout */
.ai-prompt-bar {
  display: flex;
  align-items: center;
  padding: 12px 18px;
  max-width: 540px;
  width: 100%;
  border-radius: 24px;
}

.ai-prompt-bar:focus-within {
  border-color: var(--accent-interactive);
  box-shadow: 0 0 14px var(--brand-glow);
}

.ai-input {
  flex-grow: 1;
  background: transparent;
  border: none;
  color: var(--text-primary);
  font-size: 16px;
  outline: none;
}

.ai-input::placeholder {
  color: var(--text-secondary);
}

/* Growth Indicator Badge */
.trend-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  background: rgba(16, 185, 129, 0.15);
  color: var(--accent-positive);
}
```

---

## 4. Frontend Application State Tracking Schema

```json
{
  "applicationState": {
    "themeMode": "dark",
    "activeUserSession": true,
    "currentFocusedInterface": "dashboard_main",
    "aiAgentStatus": {
      "isProcessingQuery": false,
      "activeScheduledTasksCount": 1
    },
    "portfolioContext": {
      "loadedWatchlists": ["S&P 500", "Tech_Growth_2026"],
      "selectedAssetIndex": null,
      "hasUploadedOnboardingData": false
    }
  }
}
```
