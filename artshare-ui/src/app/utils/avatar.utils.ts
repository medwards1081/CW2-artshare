export function getAvatarColor(seed: string): string {
  const colors = [
    '#FFB6C1', '#FFD700', '#87CEFA', '#98FB98',
    '#FFA07A', '#DDA0DD', '#F0E68C', '#AFEEEE'
  ];

  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }

  const index = Math.abs(hash) % colors.length;
  return colors[index];
}
