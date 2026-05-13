const PAGE_ASSET_CACHE = 'weddingmaddiemichi-page-assets-v1'

function normalizeUrl(url: string) {
  try {
    return new URL(url, window.location.href).href
  } catch {
    return null
  }
}

function isSameOrigin(url: string) {
  try {
    return new URL(url, window.location.href).origin === window.location.origin
  } catch {
    return false
  }
}

function extractBackgroundUrls(value: string) {
  const urls: string[] = []
  const pattern = /url\((['"]?)(.*?)\1\)/g
  let match: RegExpExecArray | null

  while ((match = pattern.exec(value)) !== null) {
    if (match[2]) urls.push(match[2])
  }

  return urls
}

export async function cachePageAssets(root: ParentNode) {
  if (!('caches' in window)) return

  const urls = new Set<string>()

  if (root instanceof Element) {
    const computedRootStyle = getComputedStyle(root)
    extractBackgroundUrls(computedRootStyle.backgroundImage).forEach((url) => {
      if (isSameOrigin(url)) urls.add(url)
    })
  }

  const elementNodes = root instanceof Document ? Array.from(root.querySelectorAll<HTMLElement>('*')) : Array.from(root.querySelectorAll<HTMLElement>('*'))

  elementNodes.forEach((element) => {
    const computedStyle = getComputedStyle(element)
    extractBackgroundUrls(computedStyle.backgroundImage).forEach((url) => {
      if (isSameOrigin(url)) urls.add(url)
    })
  })

  root.querySelectorAll<HTMLImageElement>('img[src]').forEach((image) => {
    if (image.src && isSameOrigin(image.src)) urls.add(image.src)
  })

  root.querySelectorAll<HTMLVideoElement>('video[src]').forEach((video) => {
    if (video.src && isSameOrigin(video.src)) urls.add(video.src)
  })

  root.querySelectorAll<HTMLSourceElement>('source[src]').forEach((source) => {
    if (source.src && isSameOrigin(source.src)) urls.add(source.src)
  })

  if (urls.size === 0) return

  const cache = await caches.open(PAGE_ASSET_CACHE)

  await Promise.allSettled(
    [...urls].map(async (url) => {
      const normalizedUrl = normalizeUrl(url)
      if (!normalizedUrl) return

      const cachedResponse = await cache.match(normalizedUrl)
      if (cachedResponse) return

      const response = await fetch(normalizedUrl, { cache: 'reload' })
      if (response.ok) {
        await cache.put(normalizedUrl, response.clone())
      }
    })
  )
}
