import { useEffect, useState } from 'react'
import { useQuery } from 'react-query'

import { gql, request } from 'graphql-request'
import { useChainInfo } from 'hooks/useChainInfo'
import { fromChainAmount, num } from 'libs/num'
import moment from 'moment'
import { useRecoilValue } from 'recoil'
import { walletState } from 'state/atoms/walletAtoms'
import { getTokenPrice } from 'util/coingecko'
import { getTokenDecimal } from 'util/token'

const query = gql`
  query ($filter: TradingHistoryFilter) {
    tradingHistories(first: 1000, filter: $filter, orderBy: DATETIME_ASC) {
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
  const currentWalletState = useRecoilValue(walletState)
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

  const calculateVolume = async (data) => {
    if (!data) return 0
    if (volume !== undefined || feeVolume !== undefined) return

    const tradingHistories = data?.tradingHistories?.nodes
      ? data?.tradingHistories?.nodes
      : []

    const historicalDatetimes = [
      moment(tradingHistories[0]?.datetime).startOf('day').valueOf(),
      moment(tradingHistories.slice(-1)[0]?.datetime).startOf('day').valueOf(),
    ]

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
          [swapAsset]: await Promise.all(
            historicalDatetimes.map(async (historicalDatetime: number) => {
              return {
                [historicalDatetime]: await getTokenPrice(
                  swapAsset,
                  historicalDatetime
                ),
              }
            })
          ),
        }
      })
    )

    let historicalPricesObj = {}
    historicalPricesArray.map((row) => {
      for (const [key, value] of Object.entries(row)) {
        historicalPricesObj = {
          ...historicalPricesObj,
          [key]: {
            ...value[0],
            ...value[1],
          },
        }
      }
    })

    let tradingVolume = 0
    let tradingFeeVolume = 0
    tradingHistories.map((row, i) => {
      const baseVolume = num(
        fromChainAmount(row?.baseVolume || 0, getTokenDecimal(row?.secondToken))
      )
      const swapFeeVolume = num(
        fromChainAmount(
          row?.swapFeeVolume || 0,
          getTokenDecimal(row?.secondToken)
        )
      )
      const swapDate = moment(row?.datetime).startOf('day').valueOf()
      const assetPrice = historicalPricesObj[row?.secondToken][swapDate] || 0

      tradingVolume += assetPrice * baseVolume.toNumber()
      tradingFeeVolume += assetPrice * swapFeeVolume.toNumber()
    })

    setVolume(tradingVolume)
    setFeeVolume(tradingFeeVolume)
  }

  useEffect(() => {
    if (!queryData) return
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
