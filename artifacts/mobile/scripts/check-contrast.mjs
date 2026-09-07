import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = fs.readFileSync(path.join(root, "constants/colors.ts"), "utf8");

function palette(name) {
  const match = source.match(new RegExp(`${name}: \\{([\\s\\S]*?)\\n  \\},`));
  if (!match) throw new Error(`Missing ${name} color palette`);
  return Object.fromEntries(
    [...match[1].matchAll(/^\s+(\w+): "(#[0-9A-Fa-f]{6})",?$/gm)].map((entry) => [entry[1], entry[2]]),
  );
}

function luminance(hex) {
  const channels = hex.slice(1).match(/.{2}/g).map((value) => {
    const channel = parseInt(value, 16) / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function ratio(foreground, background) {
  const values = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

const pairs = [
  ["text", "background"], ["foreground", "background"], ["cardForeground", "card"],
  ["primaryForeground", "primary"], ["secondaryForeground", "secondary"],
  ["mutedForeground", "muted"], ["accentForeground", "accent"],
  ["rewardsForeground", "rewards"], ["destructiveForeground", "destructive"],
  ["mutedForeground", "card"], ["rewardsText", "background"],
  ["successText", "background"], ["warningText", "background"],
];

let failures = 0;
for (const theme of ["light", "dark"]) {
  const colors = palette(theme);
  for (const [foregroundKey, backgroundKey] of pairs) {
    const measured = ratio(colors[foregroundKey], colors[backgroundKey]);
    if (measured < 4.5) {
      failures++;
      console.error(`${theme}.${foregroundKey} ${colors[foregroundKey]} on ${theme}.${backgroundKey} ${colors[backgroundKey]}: ${measured.toFixed(2)}:1 (requires 4.5:1)`);
    }
  }
}
if (failures) process.exit(1);
console.log("WCAG AA semantic text contrast check passed.");