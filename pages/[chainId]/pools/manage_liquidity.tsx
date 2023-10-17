import { useEffect, useState } from 'react'

import ManageLiquidity from 'components/Pages/Trade/Liquidity'

const getInitialPoolIdFromSearchParams = () => {
  const params = new URLSearchParams(location.search)
  const poolId = params.get('poolId')
  return poolId || null
}

const ManageLiquidityPage = () => {
  const [poolId, setInitialPoolId] = useState(() => getInitialPoolIdFromSearchParams());

  useEffect(() => {
    setInitialPoolId(getInitialPoolIdFromSearchParams());
  }, [window.location.search]);
  return <ManageLiquidity poolIdFromUrl={poolId}/>
}

export default ManageLiquidityPage
