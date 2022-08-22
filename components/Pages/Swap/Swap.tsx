import { HStack, Text, VStack } from '@chakra-ui/react';
import useSwap from './hooks/useSwap';
import SwapSettings from './SwapSettings';
import { TxStep } from 'hooks/useTransaction';
import { useRouter } from 'next/router';
import { FC, useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { walletState } from 'state/atoms/walletAtoms';
import { TokenItemState, tokenSwapAtom } from './swapAtoms';
import SwapForm from './SwapForm';
import defaultTokens from './defaultTokens.json'
import {usePriceForOneToken} from "./hooks/usePriceForOneToken"
import { fromChainAmount } from "libs/num";




type SwapProps = {
    /* will be used if provided on first render instead of internal state */
    initialTokenPair?: readonly [string, string]
}

const Swap: FC<SwapProps> = ({  }) => {
    const [[tokenA, tokenB], setTokenSwapState] = useRecoilState<TokenItemState[]>(tokenSwapAtom)
    const [reverse, setReverse] = useState<boolean>(false)
    const { chainId, key } = useRecoilValue(walletState)
    const [resetForm, setResetForm] = useState<boolean>(false)
    const router = useRouter()

    useEffect(() => {
        if (chainId) {
            const [from, to] = defaultTokens[chainId]
            const params = `?from=${from?.tokenSymbol}&to=${to?.tokenSymbol}`
            setTokenSwapState([from, to])
            setResetForm(true)
            router.replace(params)
        }
    }, [chainId])

    const { tx, simulated, minReceive } = useSwap({ reverse})

    const onInputChange = ({ tokenSymbol, amount }, index: number) => {
        if (tx?.txStep === TxStep.Failed || tx?.txStep === TxStep.Success)
            tx.reset()

        const newState: TokenItemState[] = [tokenA, tokenB]
        newState[index] = {
            tokenSymbol: tokenSymbol,
            amount: Number(amount)
        }

        setTokenSwapState(newState)

    }

    const onReverseDirection = () => {

        const A = {...tokenB, amount : tokenA.amount || parseFloat(fromChainAmount(simulated?.amount))}
        const B = {...tokenA, amount : tokenB.amount || parseFloat(fromChainAmount(simulated?.amount))}

        setTokenSwapState([A, B])
    }

    useEffect(() => {
        const params = `?from=${tokenA?.tokenSymbol}&to=${tokenB?.tokenSymbol}`
        router.replace(params, undefined, { shallow: true })
    }, [tokenA, tokenB])



    return (
        <VStack width={{ base: '100%', md: '700px' }} alignItems="center" padding={5} margin="auto">
            <HStack justifyContent="space-between" width="full" paddingY={5} paddingX={{ base: 4, md: 14 }} >
                <Text as="h2" fontSize="24" fontWeight="900">
                    Swap
                </Text>
                <SwapSettings />
            </HStack>


            <SwapForm
                connected={Boolean(key?.name)}
                tokenA={tokenA}
                tokenB={tokenB}
                onReverseDirection={onReverseDirection}
                onInputChange={onInputChange}
                simulated={simulated}
                minReceive={minReceive}
                isReverse={reverse}
                tx={tx}
                setReverse={setReverse}
                resetForm={resetForm}
                setResetForm={setResetForm}
            />

        </VStack>
    )
}

export default Swap