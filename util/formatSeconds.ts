// Convert seconds into days, hours, or minutes
export const formatSeconds = (seconds: number) => {
  if (seconds >= 86_400) {
    return Math.floor(seconds / 86_400)
  } else if (seconds > 0 && seconds < 86_400) {
    return 1
  }
  return 0
}
