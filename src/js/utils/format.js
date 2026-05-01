import { suffixes } from "../suffixes.js";

export function format(number) {
    if (number < 1000) return Math.floor(number);

    let tier = Math.floor(Math.log10(number) / 3) - 1;
    tier = Math.min(tier, suffixes.length - 1);

    const scale = 10 ** ((tier + 1) * 3);
    const value = number / scale;

    return value.toFixed(2).replace(/\.00$/, "") + suffixes[tier];
}