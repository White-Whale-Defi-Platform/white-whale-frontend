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
import { usePriceForOneToken } from "./hooks/usePriceForOneToken"
import { fromChainAmount } from "libs/num";
import getChainName from 'libs/getChainName'




type SwapProps = {
    /* will be used if provided on first render instead of internal state */
    initialTokenPair?: readonly [string, string]
}

const Swap: FC<SwapProps> = ({ }) => {
    const [[tokenA, tokenB], setTokenSwapState] = useRecoilState<TokenItemState[]>(tokenSwapAtom)
    const [reverse, setReverse] = useState<boolean>(false)
    const { chainId, address, key } = useRecoilValue(walletState)
    const [resetForm, setResetForm] = useState<boolean>(false)
    const router = useRouter()

    useEffect(() => {
        if (address) {
            const [from, to] = defaultTokens[getChainName(address)]
            const params = `?from=${from?.tokenSymbol}&to=${to?.tokenSymbol}`
            setTokenSwapState([from, to])
            setResetForm(true)
            router.replace(params)
        }
    }, [address, chainId])

    const { tx, simulated, state, path, minReceive } = useSwap({ reverse })

    const clearForm = (reset) => {
        setTokenSwapState([
            { ...tokenA, amount: 0 },
            { ...tokenB, amount: 0 }
        ])
        setResetForm(reset)
    }

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

        const A = { ...tokenB, amount: tokenA.amount || parseFloat(fromChainAmount(simulated?.amount)) }
        const B = { ...tokenA, amount: tokenB.amount || parseFloat(fromChainAmount(simulated?.amount)) }

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
                state={state}
                setReverse={setReverse}
                resetForm={resetForm}
                setResetForm={clearForm}
                path={path}
            />

        </VStack>
    )
}

export default Swap