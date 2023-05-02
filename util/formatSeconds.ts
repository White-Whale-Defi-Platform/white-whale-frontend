// Convert seconds into days, hours, or minutes
export const formatSeconds = (seconds) => {
    if (seconds >= 86400) {
        const days = Math.floor(seconds / 86400);
        return `${days} days`;
      } else {
        return "0 days"; // return 0 if less than 1 day
      }
}
