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

// export const tokens = [
//     {
//         asset: "JUNOX",
//         icon: "/juno.svg",
//         contract: "3fdss1234",
//         amount: '',
//         balance: 50
//     },
//     {
//         asset: "JUNOONE",
//         icon: "/junoone.svg",
//         contract: "adfa12342242",
//         amount: '',
//         balance: 40
//     }
// ]

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
        // if (tx?.txStep === TxStep.Failed || tx?.txStep === TxStep.Success)
        //     tx.reset()

        const newState: TokenItemState[] = [tokenA, tokenB]
        newState[index] = {
            tokenSymbol: tokenSymbol,
            amount: Number(amount)
        }

        setTokenSwapState(newState)
    }
    // const [{
    //     swap_address : swapAddress = null,
    //     pool_assets =  [],
    //     liquidity = {}
    // } = {}] = useQueryPoolLiquidity({ poolId: "JUNOX-JUNOONE" })

    // useEffect(() => {
    //     if (!!pool_assets)
    //         setLpTokens(pool_assets)
    // }, [pool_assets])

    // const {
    //     state: {
    //       tokenAReserve,
    //       tokenBReserve,
    //       tokenABalance,
    //       tokenBBalance,
    //       maxApplicableBalanceForTokenA,
    //       maxApplicableBalanceForTokenB,
    //       isLoading,
    //     },
    //     actions: { mutateAddLiquidity },
    //   } = usePoolDialogController({
    //     pool,
    //     actionState: 'add',
    //     percentage:  0
    //   })

    const {simulated, tx} = useProvideLP()

    // const onSubmit = (data) => console.log(lpTokens)


    // console.log({
    //     tokenA,
    //     tokenB
    // })

    return (
        <Page>

            <VStack width={700} justifyContent="center" className='testing'>
                <HStack justifyContent="space-between" width="full" paddingY={4} >
                    <IconButton
                        variant="unstyled"
                        color="#7A7A7A"
                        fontSize="28px"
                        aria-label='go back'
                        icon={<ArrowBackIcon />}
                        onClick={() => router.back()}
                    />
                    <Text as="h2" fontSize="24" fontWeight="900">Provide Liquidity</Text>
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