import { useEffect, useState } from 'react'
import { useQuery } from 'react-query'

import { gql, request } from 'graphql-request'
import { useChainInfo } from 'hooks/useChainInfo'
import { fromChainAmount, num } from 'libs/num'
import { useRecoilValue } from 'recoil'
import { walletState } from 'state/atoms/walletAtoms'
import { getTokenPrice } from 'util/coingecko'

const query = gql`
  query ($filter: TradingVolumeFilter) {
    tradingVolumes(first: 1, filter: $filter) {
      nodes {
        id
        datetime
        pair
        cumulativeLiquidity
        tradingVolume
        offerAsset
      }
    }
  }
`

export const useTradingVolume = ({ pair, dateTime }) => {
  const [volume, setVolume] = useState(0.0)
  const currentWalletState = useRecoilValue(walletState)
  const [activeChain]: any = useChainInfo(currentWalletState.chainId)

  const filter = {
    pair: {
      equalTo: pair,
    },
    datetime: {
      equalTo: dateTime,
    },
  }

  const { data: queryData, isLoading } = useQuery(
    ['swapVolume', pair, dateTime],
    () => request(activeChain?.indexerUrl, query, { filter }),
    { enabled: !!activeChain?.indexerUrl }
  )

  const calculateVolume = async (data) => {
    if (!data) return 0

    const nodeData = data?.tradingVolumes?.nodes
      ? data?.tradingVolumes?.nodes[0]
      : {}

    const tradingVolume = num(fromChainAmount(nodeData?.tradingVolume || 0))
    const offerAssetPrice = nodeData?.offerAsset
      ? await getTokenPrice(nodeData?.offerAsset, nodeData?.datetime)
      : 0

    setVolume(tradingVolume.toNumber() * offerAssetPrice)
  }

  useEffect(() => {
    if (!queryData) return
    calculateVolume(queryData)
  }, [queryData])

  return { volume, isLoading }
}

export default useTradingVolume
