import Swap from 'components/Pages/Swap'

function getInitialTokenPairFromSearchParams() {
  const params = new URLSearchParams(location.search)
  const from = params.get('from')?.toUpperCase()
  const to = params.get('to')?.toUpperCase()
  return from || to ? ([from, to] as const) : undefined
}

const SwapPage = () => (<Swap initialTokenPair={getInitialTokenPairFromSearchParams()} />)

export default SwapPage