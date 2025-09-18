const palette = [
  "#F97316", // orange
  "#0EA5E9", // blue
  "#10B981", // green
  "#8B5CF6", // purple
  "#F43F5E", // pink
  "#F59E0B", // amber
  "#14B8A6", // teal
  "#6366F1", // indigo
  "#22D3EE", // cyan
  "#EC4899", // magenta
];

const hash = (value: string) => {
  let h = 0;
  for (let i = 0; i < value.length; i += 1) {
    h = (Math.imul(31, h) + value.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
};

export const colorForId = (id: string): string => {
  const index = hash(id) % palette.length;
  return palette[index] ?? "#F97316";
};

export const colorPalette = palette;
