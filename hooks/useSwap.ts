import { useMemo } from "react";
import { useRecoilValue } from 'recoil';
import { walletState } from 'state/atoms/walletAtoms';
import { minAmountReceive } from "./helpers";
import { useTokenInfo } from 'hooks/useTokenInfo';
import { toChainAmount } from "libs/num";
import { useQueryMatchingPoolForSwap } from 'queries/useQueryMatchingPoolForSwap';
import { createMsg, createSwapMsgs } from './monoSwap';
import useSimulate from "./useSimulate";
import useTransaction from "./useTransaction";
import { tokenSwapAtom } from "components/Pages/Swap/swapAtoms";
import { slippageAtom } from 'components/Pages/Swap/swapAtoms'

const useSwap = ({reverse}) => {
    const [swapTokenA, swapTokenB] = useRecoilValue(tokenSwapAtom)
    const { address, client } = useRecoilValue(walletState)
    const tokenA = useTokenInfo(swapTokenA?.tokenSymbol)
    const tokenB = useTokenInfo(swapTokenB?.tokenSymbol)
    const [matchingPools] = useQueryMatchingPoolForSwap({ tokenA, tokenB })
    const slippage = useRecoilValue(slippageAtom)

    // const slippage = "0.05"
    // const reverse = false
    const token = reverse ? tokenB?.token_address : tokenA?.token_address
    const denom = reverse ? tokenB?.denom : tokenA?.denom
    const amount = reverse ? swapTokenB?.amount > 0 ? toChainAmount(swapTokenB?.amount) : '' : swapTokenA?.amount > 0 ? toChainAmount(swapTokenA?.amount) : ''
    const swapAddress = matchingPools?.streamlinePoolAB?.swap_address || matchingPools?.streamlinePoolBA?.swap_address

    const simulated = useSimulate({
        client,
        token,
        amount,
        swapAddress,
        enabled: !(swapTokenA?.tokenSymbol === swapTokenB?.tokenSymbol),
        reverse
    })

   


    const minReceive = useMemo(() => {
        if (simulated == null) return null

        return minAmountReceive({
            amount: reverse ? '' : simulated.amount,
            maxSpread: String(slippage),
        });
    }, [simulated, slippage, reverse]);



    const { msgs, encodedMsgs } = useMemo(() => {
        if (token == null || amount == '' || simulated == null) return {};

        return {
            msgs: createMsg({
                token,
                amount,
                slippage : String(slippage),
                price: simulated.price.toString(),
                swapAddress
            }),
            encodedMsgs: [createSwapMsgs(
                {
                    token,
                    amount,
                    denom,
                    slippage : String(slippage),
                    price: simulated.price.toString(),
                    swapAddress
                },
                address,
            )]
        }
    }, [address, token, amount, simulated, slippage]);

    const tx = useTransaction({
        enabled : !!encodedMsgs,
        swapAddress,
        swapAssets: [tokenA, tokenB],
        senderAddress: address,
        client,
        msgs,
        encodedMsgs,
        amount,
        price: simulated?.price,
        onSuccess:() => {},
        onError: () => { }
    });

    // console.log({
    //     tx,
    //     tokenA,
    //     tokenB,
    //     matchingPools,
    //     msgs,
    //     encodedMsgs,
    //     client,
    //     token,
    //     amount,
    //     swapAddress,
    //     simulated,
    //     address
    // })

    return {
        tx ,
        simulated,
        minReceive
    }

}

export default useSwap