import { useEffect, useState } from 'react'
import { useQuery } from 'react-query'

import { gql, request } from 'graphql-request'
import { useChainInfo } from 'hooks/useChainInfo'
import { fromChainAmount, num } from 'libs/num'
import { useRecoilValue } from 'recoil'
import { walletState } from 'state/atoms/walletAtoms'
import { getTokenPrice } from 'util/coingecko'
import { getTokenDecimal } from 'util/token'

const query = gql`
  query ($filter: TradingHistoryFilter) {
    tradingHistories(first: 1000, filter: $filter) {
      nodes {
        id
        datetime
        pairAddr
        token
        secondToken
        baseVolume
        targetVolume
      }
    }
  }
`

export const useFeeVolume = ({ pair, dateTime }) => {
  const [volume, setVolume] = useState<number | undefined>()
  const currentWalletState = useRecoilValue(walletState)
  const [activeChain]: any = useChainInfo(currentWalletState.chainId)

  const SWAP_FEE = 0.002
  const filter = {
    pairAddr: {
      equalTo: pair,
    },
    datetime: {
      greaterThan: dateTime,
    },
    txType: {
      equalTo: 'SELL',
    },
  }

  const { data: queryData, isLoading } = useQuery(
    ['swapHistories', pair, dateTime],
    () => request(activeChain?.indexerUrl, query, { filter }),
    { enabled: !!activeChain?.indexerUrl, refetchIntervalInBackground: false }
  )

  const calculateVolume = async (data) => {
    if (!data) return 0
    if (volume !== undefined) return

    const tradingHistories = data?.tradingHistories?.nodes
      ? data?.tradingHistories?.nodes
      : []

    let feeVolume = 0

    await Promise.all(
      tradingHistories.map(async (row) => {
        const returnVolume = num(
          fromChainAmount(
            row?.baseVolume || 0,
            getTokenDecimal(row?.secondToken)
          )
        )

        const askAssetPrice = await getTokenPrice(
          row?.secondToken,
          row?.datetime
        )
        feeVolume += askAssetPrice * returnVolume.toNumber() * SWAP_FEE
      })
    )

    setVolume(feeVolume)
  }

  useEffect(() => {
    if (!queryData) return
    calculateVolume(queryData)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryData])

  return { volume: volume || 0, isLoading }
}

export default useFeeVolume
