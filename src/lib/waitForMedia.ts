export function waitForVideos(videos: HTMLVideoElement[] | NodeListOf<HTMLVideoElement>, timeout = 10000): Promise<void> {
  const list = Array.from(videos as HTMLVideoElement[])
  return new Promise((resolve) => {
    if (list.length === 0) return resolve()

    let remaining = list.length
    const cleanups: Array<() => void> = []
    let finished = false

    const tryResolve = () => {
      if (finished) return
      if (remaining <= 0) {
        finished = true
        cleanup()
        resolve()
      }
    }

    const cleanup = () => {
      cleanups.forEach((c) => c())
      cleanups.length = 0
    }

    const overallTimer = setTimeout(() => {
      if (finished) return
      finished = true
      cleanup()
      resolve()
    }, timeout)

    cleanups.push(() => clearTimeout(overallTimer))

    list.forEach((video) => {
      // If already have enough data, count as loaded
      if (video.readyState >= 3) {
        remaining -= 1
        tryResolve()
        return
      }

      const onReady = () => {
        remaining -= 1
        removeListeners()
        tryResolve()
      }

      const onError = () => {
        remaining -= 1
        removeListeners()
        tryResolve()
      }

      const removeListeners = () => {
        video.removeEventListener('canplaythrough', onReady)
        video.removeEventListener('loadeddata', onReady)
        video.removeEventListener('error', onError)
      }

      video.addEventListener('canplaythrough', onReady, { once: true })
      video.addEventListener('loadeddata', onReady, { once: true })
      video.addEventListener('error', onError, { once: true })

      cleanups.push(() => removeListeners())
    })
  })
}

export function waitForImages(images: HTMLImageElement[] | NodeListOf<HTMLImageElement>, timeout = 10000): Promise<void> {
  const list = Array.from(images as HTMLImageElement[])
  return new Promise((resolve) => {
    if (list.length === 0) return resolve()

    let remaining = list.length
    const cleanups: Array<() => void> = []
    let finished = false

    const tryResolve = () => {
      if (finished) return
      if (remaining <= 0) {
        finished = true
        cleanup()
        resolve()
      }
    }

    const cleanup = () => {
      cleanups.forEach((c) => c())
      cleanups.length = 0
    }

    const overallTimer = setTimeout(() => {
      if (finished) return
      finished = true
      cleanup()
      resolve()
    }, timeout)

    cleanups.push(() => clearTimeout(overallTimer))

    list.forEach((image) => {
      // If the image is already complete, count it as loaded.
      if (image.complete && image.naturalWidth > 0) {
        remaining -= 1
        tryResolve()
        return
      }

      const onReady = () => {
        remaining -= 1
        removeListeners()
        tryResolve()
      }

      const onError = () => {
        remaining -= 1
        removeListeners()
        tryResolve()
      }

      const removeListeners = () => {
        image.removeEventListener('load', onReady)
        image.removeEventListener('error', onError)
      }

      image.addEventListener('load', onReady, { once: true })
      image.addEventListener('error', onError, { once: true })

      cleanups.push(() => removeListeners())
    })
  })
}
