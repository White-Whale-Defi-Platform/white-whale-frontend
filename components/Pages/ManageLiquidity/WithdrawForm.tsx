
import { useQueryPoolLiquidity } from 'queries/useQueryPools'
import { Button, HStack, Text, VStack } from '@chakra-ui/react';
import AssetInput from 'components/AssetInput';
import { FC, useEffect, useState, useMemo } from 'react';
import { Controller, useForm } from "react-hook-form";
import { Asset } from 'types/blockchain';
import { TokenItemState } from './lpAtoms';
import { useMultipleTokenBalance } from 'hooks/useTokenBalance';
import { useRecoilState, useRecoilValue } from 'recoil';
import { tokenLpAtom } from './lpAtoms';
import { walletState } from 'state/atoms/walletAtoms';
import { TxStep } from 'hooks/useTransaction';
import { fromChainAmount } from "libs/num";
import useWithdraw from './hooks/useWithdraw'


type Props = {
    poolId: string;
    tokenA: TokenItemState;
    connected: boolean;
}

const WithdrawForm = ({ poolId, tokenA, connected }: Props) => {
    const [{
        swap_address: swapAddress = null,
        lp_token: contract = null,
        pool_assets = [],
        liquidity = {}
    } = {}] = useQueryPoolLiquidity({ poolId })

    const [token, setToken] = useState<TokenItemState>(tokenA)
    const tx = useWithdraw({ token, contract, swapAddress , poolId})

    useEffect(() => {

        if (tx.txStep === TxStep.Success)
            setToken({
                ...token,
                amount: 0
            })

    }, [tx?.txStep])

    const isInputDisabled = tx?.txStep == TxStep.Posting


    const tokenBalance = useMemo(() => {
        const { tokenAmount = 0 } = (liquidity as any)?.providedTotal || {}
        return fromChainAmount(tokenAmount)
    }, [liquidity])

    const buttonLabel = useMemo(() => {

        if (!connected)
            return 'Connect wallet'
        else if (!!!token?.amount)
            return 'Enter amount'
        else if (tx?.buttonLabel)
            return tx?.buttonLabel
        else
            return 'Withdraw'

    }, [tx?.buttonLabel, connected, token?.amount])

    const onInputChange = (value) => {
        if (tx?.txStep === TxStep.Failed || tx?.txStep === TxStep.Success)
            tx.reset()

        setToken(value)
    }

    return (
        <VStack
            paddingY={6}
            paddingX={2}
            width="full"
            as="form"
            onSubmit={(event) => {
                event.preventDefault();
                tx?.submit()
            }}

        >

            <VStack width="full" alignItems="flex-start" paddingBottom={8}>
                <HStack>
                    <Text marginLeft={4} color="brand.200" fontSize="14" fontWeight="500">Asset Input</Text>
                    <Text fontSize="14" fontWeight="700">{tokenBalance}</Text>
                </HStack>

                <AssetInput
                    isSingleInput={true}
                    disabled={isInputDisabled}
                    value={token}
                    balance={Number(tokenBalance)}
                    image={false}
                    token={tokenA}
                    showList={false}
                    onChange={onInputChange}
                />
            </VStack>

            {(Number(token.amount) > 0) && (
                <VStack alignItems="flex-start" width="full">
                    <HStack justifyContent="space-between" width="full">
                        <Text color="brand.500" fontSize={12}> Fees: {fromChainAmount(tx?.fee)} </Text>
                    </HStack>
                </VStack>
            )}

            <Button
                type='submit'
                width="full"
                variant="primary"
                isLoading={tx?.txStep == TxStep.Estimating || tx?.txStep == TxStep.Posting}
                disabled={tx.txStep != TxStep.Ready}
            >
                {buttonLabel}
            </Button>

            {
                (tx?.error && !!!tx.buttonLabel) && (<Text color="red" fontSize={12}> {tx?.error} </Text>)
            }
        </VStack>
    )
}

export default WithdrawForm