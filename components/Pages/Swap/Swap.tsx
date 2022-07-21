import { HStack, Text, VStack } from '@chakra-ui/react';
import SwapSettings from './SwapSettings';
import useSwap from 'hooks/useSwap';
import { useTokenList } from 'hooks/useTokenList';
import { TxStep } from 'hooks/useTransaction';
import { FC, useEffect, useRef, useState } from 'react';
import { useRecoilState } from 'recoil';
import { tokenSwapAtom , TokenItemState} from './swapAtoms';
import SwapForm from './SwapForm';



type SwapProps = {
    /* will be used if provided on first render instead of internal state */
    initialTokenPair?: readonly [string, string]
}

const Swap: FC<SwapProps> = ({ initialTokenPair }) => {
    /* connect to recoil */
    const [[tokenA, tokenB], setTokenSwapState] = useRecoilState<TokenItemState[]>(tokenSwapAtom)
    const [reverse, setReverse] = useState(false)

    /* fetch token list and set initial state */
    const [tokenList] = useTokenList()
    useEffect(() => {
        const shouldSetDefaultTokenAState =
            !tokenA.tokenSymbol && !tokenB.tokenSymbol && tokenList
        if (shouldSetDefaultTokenAState) {
            setTokenSwapState([
                {
                    tokenSymbol: 'JUNOX',
                    amount: 0,
                },
                {
                    tokenSymbol: 'JUNOONE',
                    amount: 0,
                }
            ])
        }
    }, [tokenList, tokenA, tokenB, setTokenSwapState])

    const initialTokenPairValue = useRef(initialTokenPair).current
    useEffect(
        function setInitialTokenPairIfProvided() {
            if (initialTokenPairValue) {
                const [tokenASymbol, tokenBSymbol] = initialTokenPairValue
                setTokenSwapState([
                    {
                        tokenSymbol: tokenASymbol,
                        amount: 0,
                    },
                    {
                        tokenSymbol: tokenBSymbol,
                        amount: 0,
                    },
                ])
            }
        },
        [initialTokenPairValue, setTokenSwapState]
    )

    const { tx, simulated, minReceive }: any = useSwap({
        reverse
    })

    const onInputChange = ({ tokenSymbol, amount }, index: number) => {
        if (tx?.txStep === TxStep.Failed || tx?.txStep === TxStep.Success)
            tx.reset()

        const newState: any = [tokenA, tokenB]
        newState[index] = {
            tokenSymbol: tokenSymbol,
            amount: Number(amount)
        }
        setTokenSwapState(newState)

    }

    const onReverseDirection = () => {
        setTokenSwapState([tokenB, tokenA])
    }

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
                    tx={tx}
                    setReverse={setReverse}
                />

            </VStack>


        </>
    )
}

export default Swap