export const truncate = (str = '', [start, end]: number[] = [6, 6]) => (str.length > start + end ? `${str.slice(0, start)}...${str.slice(-end)}` : str)
