import { useEffect, useState } from 'react'
import { useQuery } from 'react-query'

import { gql, request } from 'graphql-request'
import { useChainInfo } from 'hooks/useChainInfo'
import { fromChainAmount, num } from 'libs/num'
import moment from 'moment'
import { useRecoilValue } from 'recoil'
import { chainState } from 'state/atoms/chainState'
import { getToken24hrPrice } from 'util/coingecko'
import { getTokenDecimal } from 'util/token'

const query = gql`
  query ($filter: TradingHistoryFilter) {
    tradingHistories(first: 1000, filter: $filter, orderBy: DATETIME_DESC) {
      nodes {
        id
        datetime
        pairAddr
        token
        secondToken
        baseVolume
        targetVolume
        swapFeeVolume
      }
    }
  }
`

export const useTradingHistory = ({ pair, dateTime }) => {
  const [volume, setVolume] = useState<number | undefined>()
  const [feeVolume, setFeeVolume] = useState<number | undefined>()
  const currentWalletState = useRecoilValue(chainState)
  const [activeChain]: any = useChainInfo(currentWalletState.chainId)

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
    {
      enabled: !!activeChain?.indexerUrl && !volume,
    }
  )

  const getSpotPrice = (historyValues, timestamp) => {
    let spotPrice = 0
    historyValues.map((row, i) => {
      if (row[0] > timestamp) {
        spotPrice = i === 0 ? row[1] : historyValues[i - 1][1]
      }
    })
    return spotPrice
  }

  const calculateVolume = async (data) => {
    if (!data) {
      return 0
    }
    if (volume !== undefined || feeVolume !== undefined) {
      return
    }

    const tradingHistories = data?.tradingHistories?.nodes
      ? data?.tradingHistories?.nodes
      : []

    // NULL POINTER CHECK for tradingHistories
    if (!tradingHistories) {
      return
    }

    const swapAssets = Array.from(
      new Set(
        tradingHistories.map((row) => {
          return row?.secondToken
        })
      )
    )

    const historicalPricesArray = await Promise.all(
      swapAssets.map(async (swapAsset: string) => {
        return {
          [swapAsset]: await getToken24hrPrice(swapAsset),
        }
      })
    )

    let historicalPrices = {}
    historicalPricesArray.map((row) => {
      for (const [key, value] of Object.entries(row)) {
        historicalPrices = {
          ...historicalPrices,
          [key]: [...value],
        }
      }
    })

    let tradingVolume = 0
    let tradingFeeVolume = 0
    tradingHistories.map((row) => {
      const baseVolume = num(
        fromChainAmount(row?.baseVolume || 0, getTokenDecimal(row?.secondToken))
      )
      const swapFeeVolume = num(
        fromChainAmount(
          row?.swapFeeVolume || 0,
          getTokenDecimal(row?.secondToken)
        )
      )
      const assetPrice = getSpotPrice(
        historicalPrices[row?.secondToken],
        moment(row?.datetime).valueOf()
      )

      tradingVolume += assetPrice * baseVolume.toNumber()
      tradingFeeVolume += assetPrice * swapFeeVolume.toNumber()
    })

    setVolume(tradingVolume)
    setFeeVolume(tradingFeeVolume)
  }

  useEffect(() => {
    if (!queryData) {
      return
    }
    calculateVolume(queryData)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryData])

  return {
    tradingVolume: volume || 0,
    feeVolume: feeVolume || 0,
    isLoading,
  }
}

export default useTradingHistory
