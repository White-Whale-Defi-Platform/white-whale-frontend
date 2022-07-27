import { HStack, Text, VStack } from '@chakra-ui/react';
import useSwap from 'hooks/useSwap';
import SwapSettings from './SwapSettings';
import { TxStep } from 'hooks/useTransaction';
import { useRouter } from 'next/router';
import { FC, useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { walletState } from 'state/atoms/walletAtoms';
import { TokenItemState, tokenSwapAtom } from './swapAtoms';
import SwapForm from './SwapForm';

const defaultTokens = {
    "uni-3": [
        {
            tokenSymbol: 'JUNOX',
            amount: 0,
        },
        {
            tokenSymbol: null,
            amount: 0,
        }
    ],
    "pisco-1": [
        {
            tokenSymbol: 'LUNA',
            amount: 0,
        },
        {
            tokenSymbol: null,
            amount: 0,
        }
    ]
}



type SwapProps = {
    /* will be used if provided on first render instead of internal state */
    initialTokenPair?: readonly [string, string]
}

const Swap: FC<SwapProps> = ({  }) => {
    /* connect to recoil */
    const [[tokenA, tokenB], setTokenSwapState] = useRecoilState<TokenItemState[]>(tokenSwapAtom)
    const [reverse, setReverse] = useState(false)
    const { chainId, key } = useRecoilValue(walletState)
    const [resetForm, setResetForm] = useState(false)
    const router = useRouter()

    useEffect(() => {
        console.log({ chainId })
        if (chainId) {
            const [from, to] = defaultTokens[chainId]
            const params = `?from=${from?.tokenSymbol}&to=${to?.tokenSymbol}`
            setTokenSwapState([from, to])
            setResetForm(true)
            router.replace(params)
        }
        // else setTokenSwapState(defaultTokens["uni-3"])
    }, [chainId])

    const { tx, simulated, minReceive }: any = useSwap({
        reverse
    })

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
        setTokenSwapState([tokenB, tokenA])
    }

    useEffect(() => {
        const params = `?from=${tokenA?.tokenSymbol}&to=${tokenB?.tokenSymbol}`
        router.replace(params, undefined, { shallow: true })
    }, [tokenA, tokenB])



    return (
        <VStack width={{ base: '100%', md: '700px' }} alignItems="center" padding={5}>
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
                isReverse={false}
                tx={tx}
                setReverse={setReverse}
                resetForm={resetForm}
                setResetForm={setResetForm}
            />

        </VStack>
    )
}

export default Swap