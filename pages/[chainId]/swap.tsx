import { useEffect, useState } from 'react'

import Swap from 'components/Pages/Trade/Swap/index'

const getInitialTokenPairFromSearchParams = () => {
  const params = new URLSearchParams(location.search)
  const from = params.get('from')
  const to = params.get('to')
  return from || to ? ([from, to] as const) : null
}

const SwapPage = () => {
  const [initialTokenPair, setInitialTokenPair] = useState(() => getInitialTokenPairFromSearchParams());

  useEffect(() => {
    setInitialTokenPair(getInitialTokenPairFromSearchParams());
  }, [window.location.search]);

  return <Swap initialTokenPair={initialTokenPair} />
}

export default SwapPage
