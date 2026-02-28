export function getAvatarColorIndex(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

const AVATAR_COLORS = [
  "bg-blue-500/80 text-white",
  "bg-emerald-500/80 text-white",
  "bg-violet-500/80 text-white",
  "bg-amber-500/80 text-white",
  "bg-rose-500/80 text-white",
  "bg-cyan-500/80 text-white",
  "bg-orange-500/80 text-white",
  "bg-teal-500/80 text-white",
];

export function getAvatarColorClass(str: string): string {
  const i = getAvatarColorIndex(str) % AVATAR_COLORS.length;
  return AVATAR_COLORS[i];
}
