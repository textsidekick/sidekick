/** Shared avatar utilities — brand-consistent warm/neutral tints */

const AVATAR_COLORS = [
  "bg-[#C96442]",     // brand terracotta
  "bg-[#8B6F5E]",     // warm brown
  "bg-[#6B7280]",     // neutral gray
  "bg-[#7C6E5A]",     // warm taupe
];

export function getAvatarColor(name: string): string {
  return AVATAR_COLORS[name ? name.charCodeAt(0) % AVATAR_COLORS.length : 0];
}

export function getInitials(name: string): string {
  if (!name) return "?";
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}
