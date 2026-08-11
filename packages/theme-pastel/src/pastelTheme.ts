import { defineTheme } from "@astryxdesign/core/theme";

/**
 * Pastel theme: off-white blue-tinted light mode, dark slate dark mode, shared
 * periwinkle accent. Token values are [light, dark] tuples.
 */
export const pastelTheme = defineTheme({
	name: "pastel",

	// `cool` biases the generated neutral ramp blue.
	color: {
		accent: "#8c9bef",
		neutralStyle: "cool",
	},

	radius: { base: 4, multiplier: 0.75 },

	typography: {
		scale: { base: 17, ratio: 1.29 },
		body: {
			family: "Inter",
			fallbacks: "system-ui, -apple-system, sans-serif",
		},
		code: {
			family: "JetBrains Mono",
			fallbacks: "ui-monospace, SFMono-Regular, monospace",
		},
	},

	tokens: {
		// Surfaces
		"--color-background-body": ["#f4f7fc", "#0f1626"],
		"--color-background-surface": ["#ffffff", "#1b2436"],
		"--color-background-card": ["#ffffff", "#161e2e"],
		"--color-background-popover": ["#ffffff", "#1b2436"],
		"--color-background-muted": ["#edf1f9", "#1b2436"],

		// Borders
		"--color-border": ["#dde4f0", "#2a3547"],
		"--color-border-emphasized": ["#c4cfe3", "#3b4860"],

		// Accent — pastel in both modes, dark slate text on top.
		"--color-accent": ["#8c9bef", "#aebbf8"],
		"--color-accent-muted": ["#e7ebfc", "#252f47"],
		"--color-on-accent": ["#1e2a3d", "#141b2b"],

		// Text
		"--color-text-primary": ["#1e2a3d", "#e6edf7"],
		"--color-text-secondary": ["#5a6b85", "#9fb0c9"],
		"--color-text-disabled": ["#9aa8bf", "#5e6e86"],
		"--color-text-accent": ["#5a67d8", "#aebbf8"],
		"--color-on-light": "#1e2a3d",
		"--color-on-dark": "#ffffff",

		// Icons
		"--color-icon-primary": ["#1e2a3d", "#e6edf7"],
		"--color-icon-secondary": ["#5a6b85", "#9fb0c9"],
		"--color-icon-disabled": ["#9aa8bf", "#5e6e86"],
		"--color-icon-accent": ["#5a67d8", "#aebbf8"],

		// Status — saturated-on-pastel in light, pastel-on-dark in dark.
		"--color-success": ["#2f7d57", "#9ee7c0"],
		"--color-success-muted": ["#d8f3e5", "#1a3329"],
		"--color-error": ["#b4455c", "#f7a8b8"],
		"--color-error-muted": ["#fbe0e6", "#3a1f27"],
		"--color-warning": ["#8a5a12", "#f3cd87"],
		"--color-warning-muted": ["#fbefd8", "#352b18"],
		"--color-on-success": ["#ffffff", "#141b2b"],
		"--color-on-error": ["#ffffff", "#141b2b"],
		"--color-on-warning": ["#ffffff", "#141b2b"],

		// Overlays and tints — slate-tinted to match the body hue.
		"--color-overlay": ["#1e2a3d80", "#060a13cc"],
		"--color-overlay-hover": ["#1e2a3d0d", "#ffffff0d"],
		"--color-overlay-pressed": ["#1e2a3d1a", "#ffffff1a"],
		"--color-neutral": ["#1e2a3d0f", "#ffffff1a"],
		"--color-shadow": ["#1e2a3d1a", "#0000004d"],
		"--color-skeleton": ["#e4eaf5", "#222c40"],
	},
});
