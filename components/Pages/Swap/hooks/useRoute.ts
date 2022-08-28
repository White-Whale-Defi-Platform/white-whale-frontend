import useSimulate from "./useSimulate";
import { useQueryMatchingPoolForSwap } from 'queries/useQueryMatchingPoolForSwap';
import { useEffect, useMemo } from "react";
import { useTokenList } from 'hooks/useTokenList'
import { findPoolForSwap } from "queries/useQueryMatchingPoolForSwap";
import { useBaseTokenInfo } from 'hooks/useTokenInfo'
import { usePoolsListQuery, PoolsListQueryResponse } from 'queries/usePoolsListQuery'
import { toAssetInfo } from "services/asset";
import { createExecuteMessage } from 'util/messages';
import { coin } from "@cosmjs/proto-signing";

export const toBase64 = (obj: object) => {
    return Buffer.from(JSON.stringify(obj)).toString('base64')
}

const buildRoute = (graph, start, end) => {
    if (!start || !end) return []

    let queue = [[start, []]],
        seen = new Set();

    while (queue.length) {
        let [curVert, [...path]] = queue.shift();
        path.push(curVert);
        if (curVert === end) return path;

        if (!seen.has(curVert) && graph[curVert]) {
            queue.push(...graph[curVert].map(v => [v, path]));
        }
        seen.add(curVert);
    }
}

const createRouteMessage = (route, amount, token, reverse, routerAddress, slippage) => {
    if (!!!amount || !!!route.length || !routerAddress) return {}

    const operations = route.map(([offerAsset, askAsset]) => {
        const offer_asset_info = toAssetInfo(offerAsset?.denom, offerAsset?.native)
        const ask_asset_info = toAssetInfo(askAsset?.denom, askAsset?.native)
        return {
            "terra_swap": { offer_asset_info, ask_asset_info }
        }
    })

    const simulateKey = reverse ? "reverse_simulate_swap_operations" : "simulate_swap_operations"
    const amountKey = reverse ? "ask_amount" : "offer_amount"

    const simulateMsg = {
        [simulateKey]: {
            [amountKey]: amount,
            operations
        }
    }
    const executeMsg = {
        "execute_swap_operations": {
            "offer_amount": amount,
            operations,
            max_spread: slippage
        }
    }

    const nonNativeExecuteMsg = {
        send: {
            amount: amount,
            contract: routerAddress,
            msg: toBase64(executeMsg)
        }
    }

    return {
        simulateMsg,
        executeMsg: token?.native ? executeMsg : nonNativeExecuteMsg
    }
}

const executeMessage = (message, amount, token, routerAddress, senderAddress) => {

    if (!message || !routerAddress) return null

    return createExecuteMessage({
        senderAddress,
        contractAddress: token?.native ? routerAddress : token.token_address,
        message,
        funds: token?.native ? [coin(amount, token.denom)] : []
    })
};

const useRoute = ({tokenA, tokenB, amount, reverse, senderAddress, slippage}) => {

    const [tokenList] = useTokenList()
    const baseToken = useBaseTokenInfo()
    const { data: poolsList, isLoading } = usePoolsListQuery()
    const { routerAddress } = poolsList || {}

    const { pools, tokens, graph, path, route } = useMemo(() => {
        if (!poolsList || !tokenList) return {
            pools: [],
            tokens: [],
            graph: [],
            path: [],
            route: []
        }
        const graph = {}

        const pools = poolsList?.pools?.map(({ pool_id }) => pool_id)
        const tokens = tokenList?.tokens?.map(({ symbol }) => symbol)

        tokens.forEach(token => graph[token] = [])
        pools.forEach(pool => {
            const [a, b] = pool?.split("-")
            graph[a]?.push(b)
            graph[b]?.push(a)
        })

        const path = buildRoute(graph, tokenA?.symbol, tokenB.symbol)
        const route = []

        if (path?.length > 0) {
            path.reduce((prev, curr) => {
                route.push([
                    tokenList.tokensBySymbol.get(prev),
                    tokenList.tokensBySymbol.get(curr)
                ])
                return curr
            })
        }


        return { pools, tokens, graph, path, route }

    }, [poolsList, tokenList, tokenA?.symbol, tokenB?.symbol])

    const { simulateMsg, executeMsg, encodedExecuteMsg } = useMemo(() => {
        if (route.length < 1) return {}

        const { simulateMsg, executeMsg } = createRouteMessage(route, amount, tokenA, reverse, routerAddress, slippage)
        const encodedMsgs = executeMessage(executeMsg, amount, tokenA, routerAddress, senderAddress)

        return { simulateMsg, executeMsg, encodedExecuteMsg: encodedMsgs ? [encodedMsgs] : null }

    }, [route, amount, reverse, slippage])


    return { path, simulateMsg, encodedExecuteMsg, executeMsg }
}

export default useRoute