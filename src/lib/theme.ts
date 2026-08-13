/** The appearance modes the site offers. Adding one starts here. */
export const themeModes = ["system", "light", "dark"] as const;

export type ThemeMode = (typeof themeModes)[number];
