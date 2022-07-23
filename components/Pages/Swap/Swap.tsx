import { HStack, Text, VStack } from '@chakra-ui/react';
import SwapSettings from './SwapSettings';
import useSwap from 'hooks/useSwap';
import { useTokenList } from 'hooks/useTokenList';
import { TxStep } from 'hooks/useTransaction';
import { FC, useEffect, useRef, useState } from 'react';
import { useRecoilState } from 'recoil';
import { tokenSwapAtom, TokenItemState } from './swapAtoms';
import SwapForm from './SwapForm';
import { useRecoilValue } from 'recoil'
import { walletState } from 'state/atoms/walletAtoms'
import { useRouter } from 'next/router'

const defaultTokens = {
    "uni-3": [
        {
            tokenSymbol: 'JUNOX',
            amount: 0,
        },
        {
            tokenSymbol: 'JUNOONE',
            amount: 0,
        }
    ],
    "pisco-1": [
        {
            tokenSymbol: 'LUNA',
            amount: 0,
        },
        {
            tokenSymbol: 'LUNAONE',
            amount: 0,
        }
    ]
}



type SwapProps = {
    /* will be used if provided on first render instead of internal state */
    initialTokenPair?: readonly [string, string]
}

const Swap: FC<SwapProps> = ({ initialTokenPair }) => {
    /* connect to recoil */
    const [[tokenA, tokenB], setTokenSwapState] = useRecoilState<TokenItemState[]>(tokenSwapAtom)
    const [reverse, setReverse] = useState(false)
    const { chainId } = useRecoilValue(walletState)
    const [resetForm, setResetForm] = useState(false)
    const router = useRouter()

    useEffect(() => {
        const [from, to] = defaultTokens[chainId]
        const params = `?from=${from?.tokenSymbol}&to=${to?.tokenSymbol}`
        setTokenSwapState([from,to])
        setResetForm(true)
        router.replace(params)
    }, [chainId])

    /* fetch token list and set initial state */
    // const [tokenList] = useTokenList()

    // useEffect(() => {
    //     if (!tokenA.tokenSymbol && !tokenB.tokenSymbol)
    //         setTokenSwapState(defaultTokens[chainId])
    // }, [tokenA, tokenB, setTokenSwapState])

    // const initialTokenPairValue = useRef(initialTokenPair).current
    // useEffect(
    //     function setInitialTokenPairIfProvided() {
    //         if (initialTokenPairValue) {
    //             const [tokenASymbol, tokenBSymbol] = initialTokenPairValue
    //             setTokenSwapState([
    //                 {
    //                     tokenSymbol: tokenASymbol,
    //                     amount: 0,
    //                 },
    //                 {
    //                     tokenSymbol: tokenBSymbol,
    //                     amount: 0,
    //                 },
    //             ])
    //         }
    //     },
    //     [initialTokenPairValue, setTokenSwapState]
    // )

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
        <>
            <VStack width={700} justifyContent="center" className='testing'>
                <HStack justifyContent="space-between" width="full" paddingY={10} paddingX={4}>
                    <Text as="h2" fontSize="24" fontWeight="900">
                        Swap
                    </Text>
                    <SwapSettings />
                </HStack>

                <SwapForm
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


        </>
    )
}

export default Swap