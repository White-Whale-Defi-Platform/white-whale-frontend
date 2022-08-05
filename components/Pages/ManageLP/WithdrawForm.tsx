
import { useQueryPoolLiquidity } from 'queries/useQueryPools'
import { Button, HStack, Text, VStack } from '@chakra-ui/react';
import AssetInput from 'components/AssetInput';
import { FC, useEffect, useState, useMemo } from 'react';
import { Controller, useForm } from "react-hook-form";
import { Asset } from 'types/blockchain';
import { TokenItemState } from '../ManageLP/lpAtoms';
import { useMultipleTokenBalance } from 'hooks/useTokenBalance';
import { useRecoilState, useRecoilValue } from 'recoil';
import { tokenLpAtom } from '../ManageLP/lpAtoms';
import { walletState } from 'state/atoms/walletAtoms';
import { TxStep } from 'hooks/useTransaction';
import { fromChainAmount } from "libs/num";
import useWithdraw from './hooks/useWithdraw'


type Props = {
    poolId: string;
    tokenA: TokenItemState;
}

const WithdrawForm = ({ poolId, tokenA }: Props) => {
    const [{
        swap_address: swapAddress = null,
        pool_assets = [],
        liquidity = {}
    } = {}] = useQueryPoolLiquidity({ poolId })

    const [token, setToken] = useState<TokenItemState>(tokenA)

    const returnData = useWithdraw({ token })

    const tokenBalance = useMemo(() => {
        const { tokenAmount = 0 } = (liquidity as any)?.providedTotal || {}
        return fromChainAmount(tokenAmount)
    }, [liquidity])

    return (
        <VStack
            paddingY={6}
            paddingX={2}
            width="full"
            as="form"
        // onSubmit={handleSubmit(tx?.submit)}

        >

            <VStack width="full" alignItems="flex-start" paddingBottom={8}>
                <HStack>
                    <Text marginLeft={4} color="brand.200" fontSize="14" fontWeight="500">Asset Input</Text>
                    <Text fontSize="14" fontWeight="700">{tokenBalance}</Text>
                </HStack>

                <AssetInput 
                    value={token}
                    image={false}
                    token={tokenA}
                    showList={false}
                    onChange={(value) => setToken(value) }
                />
            </VStack>

            {/* {(tokenB?.tokenSymbol && Number(amountA.amount) > 0) && (
            <VStack alignItems="flex-start" width="full">
                <Text
                    color="brand.500"
                    fontSize={12}>
                    1 {tokenA.tokenSymbol} = {Number(amountB.amount / amountA.amount).toFixed(1)} {tokenB.tokenSymbol}
                </Text>
                <HStack justifyContent="space-between" width="full">
                    <Text color="brand.500" fontSize={12}> Fees: {fromChainAmount(tx?.fee)} </Text>
                </HStack>
            </VStack>
        )} */}

            <Button
                type='submit'
                width="full"
                variant="primary"
            // isLoading={tx?.txStep == TxStep.Estimating || tx?.txStep == TxStep.Posting}
            // disabled={tx.txStep != TxStep.Ready}
            >
                Withdraw
                {/* {buttonLabel} */}
            </Button>

            {/* {
            (tx?.error && !!!tx.buttonLabel) && (<Text color="red" fontSize={12}> {tx?.error} </Text>)
        } */}
        </VStack>
    )
}

export default WithdrawForm