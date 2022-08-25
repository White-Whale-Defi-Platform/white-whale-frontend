import { useMemo } from "react";
import { useRecoilValue } from 'recoil';
import { walletState } from 'state/atoms/walletAtoms';
import { minAmountReceive } from "hooks/helpers";
import { useTokenInfo } from 'hooks/useTokenInfo';
import { useQueryMatchingPoolForSwap } from 'queries/useQueryMatchingPoolForSwap';
import { createMsg, createSwapMsgs } from './createSwapMsg';
import useSimulate, { Simulated } from "./useSimulate";
import useTransaction from "hooks/useTransaction";
import { tokenSwapAtom } from "components/Pages/Swap/swapAtoms";
import { slippageAtom } from 'components/Pages/Swap/swapAtoms'
import { toChainAmount,fromChainAmount, num } from "libs/num";


const useSwap = ({ reverse }) => {
    const [swapTokenA, swapTokenB] = useRecoilValue(tokenSwapAtom)
    const { address, client } = useRecoilValue(walletState)
    const tokenA = useTokenInfo(swapTokenA?.tokenSymbol)
    const tokenB = useTokenInfo(swapTokenB?.tokenSymbol)
    const [matchingPools] = useQueryMatchingPoolForSwap({ tokenA, tokenB })
    const slippage = useRecoilValue(slippageAtom)
    const token = tokenA?.token_address
    const denom = tokenA?.denom
    const amount = reverse ? swapTokenB?.amount > 0 ? toChainAmount(swapTokenB?.amount) : '' : swapTokenA?.amount > 0 ? toChainAmount(swapTokenA?.amount) : ''
    const swapAddress = matchingPools?.streamlinePoolAB?.swap_address || matchingPools?.streamlinePoolBA?.swap_address

    const slippageToDecimal = slippage / 100

    const { simulated, error, isLoading } = useSimulate({
        client,
        token: reverse ? tokenB?.token_address : tokenA?.token_address,
        amount: reverse ? swapTokenB?.amount > 0 ? toChainAmount(swapTokenB?.amount) : '' : swapTokenA?.amount > 0 ? toChainAmount(swapTokenA?.amount) : '',
        swapAddress,
        enabled: !(swapTokenA?.tokenSymbol === swapTokenB?.tokenSymbol),
        reverse
    })

    const minReceive = useMemo(() => {
        if (simulated?.amount == null || slippageToDecimal === 0) return null

        // if (slippageToDecimal === 0) {
            
        //     const amount = reverse ? toChainAmount(swapTokenB?.amount) : simulated.amount
        //     console.log({amount, simulated})
        //     return fromChainAmount(num(amount).minus(simulated.spread).toString())
        // }

        return minAmountReceive({
            amount: reverse ? num(swapTokenB?.amount).toString() : fromChainAmount(simulated.amount),
            maxSpread: String(slippageToDecimal),
        });
    }, [simulated?.amount, slippageToDecimal, reverse, swapTokenB?.amount]);



    const { msgs, encodedMsgs } = useMemo(() => {
        if (token == null || simulated == null || simulated?.error) return {};

        return {
            msgs: createMsg({
                token,
                amount: reverse ? simulated?.amount : amount,
                slippage: String(slippageToDecimal),
                price: num(simulated.price).dp(6).toString(),
                swapAddress
            }),
            encodedMsgs: [createSwapMsgs(
                {
                    token,
                    amount: reverse ? simulated?.amount : amount,
                    denom,
                    slippage: num(slippageToDecimal).dp(3).toString(),
                    price: num(simulated.price).dp(6).toString(),
                    swapAddress
                },
                address,
            )]
        }
    }, [address, token, amount, simulated, slippageToDecimal]);

    const tx = useTransaction({
        enabled: !!encodedMsgs,
        swapAddress,
        swapAssets: [tokenA, tokenB],
        senderAddress: address,
        client,
        msgs,
        encodedMsgs,
        amount: reverse ? simulated?.amount : amount,
        price: num(simulated?.price).dp(6).toNumber(),
        onSuccess: () => { },
        onError: () => { }
    });


    return useMemo(() => ({
        tx,
        simulated,
        minReceive,
        state : {error, isLoading}

    }), [tx, simulated, minReceive, error, isLoading])

}

export default useSwap