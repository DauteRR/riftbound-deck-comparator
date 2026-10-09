export function tileSizeClass(isHorizontal: boolean) {
  return isHorizontal
    ? 'aspect-[1039/744] w-[calc(var(--card-width)*1.4)]'
    : 'aspect-[744/1039] w-(--card-width)'
}
