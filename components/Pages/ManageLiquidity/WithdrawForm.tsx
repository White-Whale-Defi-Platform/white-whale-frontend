import { Button, HStack, Text, VStack, Spinner, Tooltip, Box } from '@chakra-ui/react';
import AssetInput from 'components/AssetInput';
import { TxStep } from 'hooks/useTransaction';
import { fromChainAmount } from "libs/num";
import { useQueryPoolLiquidity } from 'queries/useQueryPools';
import { useEffect, useMemo, useState } from 'react';

import { WalletStatusType } from '../../../state/atoms/walletAtoms';
import useWithdraw from './hooks/useWithdraw';
import { TokenItemState } from './lpAtoms';
import { useBaseTokenInfo } from 'hooks/useTokenInfo'
import { InfoOutlineIcon } from '@chakra-ui/icons'

type Props = {
    poolId: string;
    tokenA: TokenItemState;
    connected: WalletStatusType;
}

const WithdrawForm = ({ poolId, tokenA, connected }: Props) => {
    const [{
        swap_address: swapAddress = null,
        lp_token: contract = null,
        pool_assets = [],
        liquidity = {}
    } = {}, isLoading] = useQueryPoolLiquidity({ poolId })

    const [token, setToken] = useState<TokenItemState>(tokenA)
    const tx = useWithdraw({ token, contract, swapAddress, poolId })
    const baseToken = useBaseTokenInfo()

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
            return 'Connect Wallet'
        else if (!!!token?.amount)
            return 'Enter Amount'
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
                    <Text marginLeft={4} color="brand.50" fontSize="14" fontWeight="500">Balance: </Text>
                    {/* <Text fontSize="14" fontWeight="700">{tokenBalance}</Text> */}
                    {isLoading ? (
                        <Spinner color='white' size='xs' />
                    ) : (
                        <Text fontSize="14" fontWeight="700">{Number(tokenBalance)?.toFixed(6)}</Text>
                    )}
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

            <Button
                type='submit'
                width="full"
                variant="primary"
                isLoading={tx?.txStep == TxStep.Estimating || tx?.txStep == TxStep.Posting || tx?.txStep == TxStep.Broadcasting}
                disabled={tx.txStep != TxStep.Ready}
            >
                {buttonLabel}
            </Button>

            {(Number(tx?.fee) > 0) && (
                <VStack alignItems="flex-start" width="full" p={3}>
                    <HStack justifyContent="space-between" width="full">
                        <HStack >
                            <Text color="brand.500" fontSize={12}> Fee</Text>
                            <Tooltip label="Fee paid to execute this transaction" padding="1rem" bg="blackAlpha.900" fontSize="xs" maxW="330px">
                                <Box cursor="pointer" color="brand.50">
                                    <InfoOutlineIcon width=".7rem" height=".7rem" />
                                </Box>
                            </Tooltip>
                        </HStack>
                        <Text color="brand.500" fontSize={12}> {fromChainAmount(tx?.fee)} {baseToken?.symbol}</Text>
                    </HStack>
                </VStack>
            )}



            {
                (tx?.error && !!!tx.buttonLabel) && (<Text color="red" fontSize={12}> {tx?.error} </Text>)
            }
        </VStack>
    )
}

export default WithdrawForm
