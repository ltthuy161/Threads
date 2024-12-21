import { theme } from "./theme.js";

function applyTheme(theme) {
  const root = document.documentElement;
  Object.keys(theme.colors).forEach((colorKey) => {
    const colorValues = theme.colors[colorKey];
    Object.keys(colorValues).forEach((shade) => {
      root.style.setProperty(`--${colorKey}-${shade}`, colorValues[shade]);
    });
  });
  // Add more theme properties here
  //font family headling body
  root.style.setProperty(
    "--font-family-heading",
    theme.extend.fontFamily.heading,
  );
  root.style.setProperty("--font-family-body", theme.extend.fontFamily.body);
}

document.addEventListener("DOMContentLoaded", () => {
  applyTheme(theme);
});
