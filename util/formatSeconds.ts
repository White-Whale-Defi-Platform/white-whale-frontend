// Convert seconds into days, hours, or minutes
export const formatSeconds = (seconds) => {
  if (seconds >= 86400) {
    return Math.floor(seconds / 86400)
  } else if (seconds > 0 && seconds < 86400) {
    return 1
  }
  return 0
}
