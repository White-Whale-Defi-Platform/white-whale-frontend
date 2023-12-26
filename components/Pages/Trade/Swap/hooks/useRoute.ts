import { useMemo } from 'react'

import { coin } from '@cosmjs/proto-signing'
import { usePoolsListQuery } from 'components/Pages/Trade/Pools/hooks/usePoolsListQuery'
import { usePrices } from 'hooks/usePrices'
import { useTokenList } from 'hooks/useTokenList'
import { num, toChainAmount } from 'libs/num'
import { toAssetInfo } from 'services/asset'
import { toBase64 } from 'util/conversion/index'
import { createExecuteMessage } from 'util/messages/index'

const buildRoute = (
  graph: { [x: string]: any[] }, start: any, end: any,
) => {
  if (!start || !end) {
    return []
  }

  const queue = [[start, []]],
    seen = new Set()

  while (queue.length) {
    const [curVert, [...path]] = queue.shift()
    path.push(curVert)
    if (curVert === end) {
      return path
    }

    if (!seen.has(curVert) && graph[curVert]) {
      queue.push(...graph[curVert].map((v) => [v, path]))
    }
    seen.add(curVert)
  }
}

const createRouteMessage = (
  route, amount, token, reverse, routerAddress,
) => {
  if (!amount || !route.length || !routerAddress) {
    return {}
  }
  const operations = route.map(([offerAsset, askAsset]) => {
    const offerAssetInfo = toAssetInfo(offerAsset?.denom, offerAsset?.native)
    const askAssetInfo = toAssetInfo(askAsset?.denom, askAsset?.native)
    return {
      terra_swap: { offer_asset_info: offerAssetInfo,
        ask_asset_info: askAssetInfo },
    }
  })

  const simulateKey = reverse
    ? 'reverse_simulate_swap_operations'
    : 'simulate_swap_operations'
  const amountKey = reverse ? 'ask_amount' : 'offer_amount'

  const simulateMsg = {
    [simulateKey]: {
      [amountKey]: num(amount).toFixed(0),
      operations,
    },
  }
  const executeMsg = {
    execute_swap_operations: {
      operations,
    },
  }

  const nonNativeExecuteMsg = {
    send: {
      amount: num(amount).toFixed(0),
      contract: routerAddress,
      msg: toBase64(executeMsg),
    },
  }
  return {
    simulateMsg,
    executeMsg: token?.native ? executeMsg : nonNativeExecuteMsg,
  }
}

export const executeMessage = (
  message,
  amount,
  token,
  routerAddress,
  senderAddress,
) => {
  if (!message || !routerAddress) {
    return null
  }
  return createExecuteMessage({
    senderAddress,
    contractAddress: token?.native ? routerAddress : token.token_address,
    message,
    funds: token?.native ? [coin(amount, token.denom)] : [],
  })
}

const useRoute = ({
  tokenA,
  tokenB,
  amount,
  reverse,
  senderAddress,
  slippage,
}) => {
  const prices = usePrices()
  const [tokenList] = useTokenList()
  const { data: poolsList } = usePoolsListQuery()
  const { routerAddress } = poolsList || {}
  const { path, route } = useMemo(() => {
    if (!poolsList || !tokenList) {
      return {
        pools: [],
        tokens: [],
        graph: [],
        path: [],
        route: [],
      }
    }
    const graph = {}

    const pools = poolsList?.pools?.map(({ pool_id }) => pool_id)
    const tokens = tokenList?.tokens?.map(({ symbol }) => symbol)

    if (tokens) {
      tokens.forEach((token) => (graph[token] = []))
    }
    // NULL_POINTER check for pools
    if (!pools) {
      return {
        pools: [],
        tokens: [],
        graph: [],
        path: [],
        route: [],
      }
    }

    pools.forEach((pool) => {
      // NULL_POINTER check for pool
      if (!pool) {
        return
      }

      const [a, b] = pool.split('-')
      graph[a]?.push(b)
      graph[b]?.push(a)
    })

    const path = buildRoute(
      graph, tokenA?.symbol, tokenB.symbol,
    )
    const route = []
    if (path?.length > 0) {
      path.reduce((prev, curr) => {
        route.push([
          tokenList.tokensBySymbol.get(prev),
          tokenList.tokensBySymbol.get(curr),
        ])
        return curr
      })
    }

    return { pools,
      tokens,
      graph,
      path,
      route }
  }, [poolsList, tokenList, tokenA?.symbol, tokenB?.symbol])

  const refValue = useMemo(() => {
    let simulatedAmount = toChainAmount(1, tokenA?.decimals)
    if (prices?.[tokenA.symbol]) {
      const dollarAmount = 1 / Number(prices?.[tokenA.symbol])
      simulatedAmount = toChainAmount(dollarAmount, tokenA?.decimals)
    } else {
      return null
    }
    // @ts-ignore
    if (window.debugLogsEnabled) {
      console.log('Reference Amount 1$: ', simulatedAmount)
      console.log('Prices: ', prices)
    }
    return createRouteMessage(
      route,
      simulatedAmount,
      tokenA,
      reverse,
      routerAddress,
    )
  }, [route, amount, reverse, slippage, prices])

  const { simulateMsg, executeMsg, encodedExecuteMsg } = useMemo(() => {
    if (route.length < 1) {
      return {}
    }
    const { simulateMsg, executeMsg } = createRouteMessage(
      route,
      amount,
      tokenA,
      reverse,
      routerAddress,
    )
    const encodedMsgs = executeMessage(
      executeMsg,
      num(amount).toFixed(0),
      tokenA,
      routerAddress,
      senderAddress,
    )

    return {
      simulateMsg,
      executeMsg,
      encodedExecuteMsg: encodedMsgs ? [encodedMsgs] : null,
    }
  }, [route, amount, reverse, slippage, refValue])

  return { path,
    simulateMsg,
    encodedExecuteMsg,
    executeMsg,
    refValue }
}

export default useRoute
