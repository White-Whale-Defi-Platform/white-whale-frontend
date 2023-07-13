import { dollarValueFormatter, formatTokenBalance } from 'junoblocks'

const formatWithOneDecimal = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
})
const oneMillion = 1000000
const hundredMillions = 100 * oneMillion

export const formatCompactNumber = (
  value: number,
  kind: 'tokenAmount' | 'dollarValue' = 'dollarValue'
) => {
  if (value > hundredMillions) {
    return `${Math.round(value / hundredMillions)}M`
  } else if (value > oneMillion) {
    return `${formatWithOneDecimal.format(value / oneMillion)}M`
  } else if (value > 10000) {
    return `${formatWithOneDecimal.format(Math.round(value / 1000))}K`
  } else if (value > 1000 || kind === 'dollarValue') {
    return dollarValueFormatter(Math.round(value), {
      includeCommaSeparation: true,
    })
  } else {
    return formatTokenBalance(value)
  }
}
