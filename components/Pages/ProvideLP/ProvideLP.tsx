import { HStack, Text, VStack, IconButton } from '@chakra-ui/react';
import Page from 'components/Page';
import { useState, FC, useEffect } from 'react';
import { Asset } from 'types/blockchain';
import { ArrowBackIcon } from '@chakra-ui/icons'
import { useRouter, NextRouter } from "next/router";
import ProvideLPForm from './ProvideLPForm';
import { usePoolDialogController } from './usePoolDialogController'
import { useQueryPoolLiquidity } from 'queries/useQueryPools'
import useProvideLP from "./hooks/useProvideLP"
import { TokenItemState } from '../ManageLP/lpAtoms';
import { useRecoilState, useRecoilValue } from 'recoil';
import { tokenLpAtom } from '../ManageLP/lpAtoms';
import { walletState } from 'state/atoms/walletAtoms';
import { TxStep } from 'hooks/useTransaction';

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

const ProvideLP: FC = () => {
    const router: NextRouter = useRouter()

    const [[tokenA, tokenB], setTokenSwapState] = useRecoilState<TokenItemState[]>(tokenLpAtom)
    const { chainId, key } = useRecoilValue(walletState)
    const [resetForm, setResetForm] = useState(false)

    useEffect(() => {
        if (chainId) {
            const [from, to] = defaultTokens[chainId]
            const params = `?from=${from?.tokenSymbol}&to=${to?.tokenSymbol}`
            setTokenSwapState([from, to])
            setResetForm(true)
            router.replace(params)
        }
    }, [chainId])

    useEffect(() => {
        const params = `?from=${tokenA?.tokenSymbol}&to=${tokenB?.tokenSymbol}`
        router.replace(params, undefined, { shallow: true })
    }, [tokenA, tokenB])






    const onInputChange = ({ tokenSymbol, amount }: TokenItemState, index: number) => {
        if (tx?.txStep === TxStep.Failed || tx?.txStep === TxStep.Success)
            tx.reset()

        const newState: TokenItemState[] = [tokenA, tokenB]
        newState[index] = {
            tokenSymbol: tokenSymbol,
            amount: Number(amount)
        }

        setTokenSwapState(newState)
    }

    const { simulated, tx } = useProvideLP()


    return (
        <Page>

            <VStack width={{ base: '100%', md: '700px' }} alignItems="center" padding={5} margin="auto">
                <HStack justifyContent="space-between" width="full" paddingY={5} paddingX={{ base: 4, md: 14 }} >
                    <IconButton
                        variant="unstyled"
                        color="#7A7A7A"
                        fontSize="28px"
                        aria-label='go back'
                        icon={<ArrowBackIcon />}
                        onClick={() => router.back()}
                    />
                    <Text as="h2" fontSize="24" fontWeight="900">Provide Liquidity </Text>
                </HStack>

                <ProvideLPForm
                    connected={Boolean(key?.name)}
                    tokenA={tokenA}
                    tokenB={tokenB}
                    // onReverseDirection={onReverseDirection}
                    onInputChange={onInputChange}
                    simulated={simulated}
                    // minReceive={minReceive}
                    // isReverse={reverse}
                    tx={tx}
                    // setReverse={setReverse}
                    resetForm={resetForm}
                    setResetForm={setResetForm}

                />
            </VStack>
        </Page>
    )
}

export default ProvideLP