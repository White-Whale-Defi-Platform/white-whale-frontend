import { slippageAtom, tokenSwapAtom } from "components/Pages/Swap/swapAtoms";
import { useTokenInfo } from 'hooks/useTokenInfo';
import { num, toChainAmount } from "libs/num";
import { usePoolsListQuery } from 'queries/usePoolsListQuery';
import { useQueryMatchingPoolForSwap } from 'queries/useQueryMatchingPoolForSwap';
import { useMemo } from "react";
import { useRecoilValue } from 'recoil';
import { walletState } from 'state/atoms/walletAtoms';
import useRoute from './useRoute';
import useSimulate from "./useSimulate";
import useTransaction from "./useTransaction";
import { fromChainAmount } from "libs/num";

const useSwap = ({ reverse }) => {
    const [swapTokenA, swapTokenB] = useRecoilValue(tokenSwapAtom)
    const { address, client } = useRecoilValue(walletState)
    const tokenA = useTokenInfo(swapTokenA?.tokenSymbol)
    const tokenB = useTokenInfo(swapTokenB?.tokenSymbol)
    const [matchingPools] = useQueryMatchingPoolForSwap({ tokenA, tokenB })
    const slippage = useRecoilValue(slippageAtom)
    const { data: poolsList } = usePoolsListQuery()

    const amount = reverse ? swapTokenB?.amount > 0 ? toChainAmount(swapTokenB?.amount) : '' : swapTokenA?.amount > 0 ? toChainAmount(swapTokenA?.amount) : ''
    const { routerAddress } = poolsList || {}
    const slippageToDecimal = slippage / 100

    const { simulateMsg, encodedExecuteMsg, executeMsg, path } = useRoute(
        {
            tokenA: { ...tokenA, ...swapTokenA },
            tokenB: { ...tokenB, ...swapTokenB },
            amount,
            reverse,
            senderAddress: address,
            slippage: slippageToDecimal
        }
    )

    const { simulated, error, isLoading } = useSimulate({ client, msg: simulateMsg, routerAddress })

    const minReceive = useMemo(() => {
        if (!simulated) return null

        const rate1 = num(1).minus(slippageToDecimal)
        const rate2 = num(1).minus(.001)
        return fromChainAmount(num(simulated.amount).times(rate1).times(rate2).toFixed(6))

    }, [simulated, slippageToDecimal])

    const tx = useTransaction({
        enabled: !!executeMsg,
        swapAddress: routerAddress,
        swapAssets: [tokenA, tokenB],
        senderAddress: address,
        client,
        msgs: executeMsg,
        encodedMsgs: encodedExecuteMsg,
        amount: reverse ? simulated?.amount : amount,
        price: num(simulated?.price).dp(6).toNumber(),
        onSuccess: () => { },
        onError: () => { }
    });

    return useMemo(() => ({
        path,
        tx,
        simulated,
        minReceive,
        state: { error, isLoading }

    }), [tx, simulated, error, isLoading])

}

export default useSwap