type ExternalLinkPopupArgs = {
  url: string
  title: string
  width: number
  height: number
}

export function externalLinkPopup({
  url,
  title,
  width: w,
  height: h,
}: ExternalLinkPopupArgs) {
  const { screen, screenLeft, screenTop, innerWidth, innerHeight } = window
  const dualScreenLeft = screenLeft ?? screenX
  const dualScreenTop = screenTop ?? screenY
  const width =
    innerWidth ?? document.documentElement.clientWidth ?? screen.width
  const height =
    innerHeight ?? document.documentElement.clientHeight ?? screen.height
  const systemZoom = width / screen.availWidth
  const left = (width - w) / 2 / systemZoom + dualScreenLeft
  const top = (height - h) / 2 / systemZoom + dualScreenTop

  const newWindow = window.open(
    url,
    title,
    `scrollbars=yes, width=${w / systemZoom}, height=${
      h / systemZoom
    }, top=${top}, left=${left}, location=yes, status=yes`
  )

  if (window.focus) newWindow.focus()
  return newWindow
}

export function externalLinkPopupAutoWidth(
  args: Omit<ExternalLinkPopupArgs, 'width' | 'height'>
) {
  return externalLinkPopup({
    ...args,
    width: Math.max(450, Math.round(window.innerWidth * 0.35)),
    height: Math.max(300, Math.round(window.innerHeight * 0.8)),
  })
}
