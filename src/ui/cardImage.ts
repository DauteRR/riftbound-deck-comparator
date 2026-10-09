function withParams(imageUrl: string, params: string) {
  const separator = imageUrl.includes('?') ? '&' : '?'
  return `${imageUrl}${separator}${params}`
}

export function thumbnailUrl(imageUrl: string) {
  return withParams(imageUrl, 'w=320&fm=webp&q=70')
}
