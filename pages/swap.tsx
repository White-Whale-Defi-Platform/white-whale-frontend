import React from 'react'
import Swap from 'components/Pages/Swap'
import Page from 'components/Page';

function getInitialTokenPairFromSearchParams() {
  const params = new URLSearchParams(location.search)
  const from = params.get('from')?.toUpperCase()
  const to = params.get('to')?.toUpperCase()
  return from || to ? ([from, to] as const) : undefined
}

const SwapPage = () => {
   
  return (
    <Page>
      <Swap initialTokenPair={getInitialTokenPairFromSearchParams()} />
    </Page>

  )
}

export default SwapPage