import { Button, HStack, Text, VStack, Spinner, Tooltip, Box } from '@chakra-ui/react';
import AssetInput from 'components/AssetInput';
import { TxStep } from 'hooks/useTransaction';
import { fromChainAmount } from "libs/num";
import { usePoolsListQuery } from 'queries/usePoolsListQuery'
import { useTokenBalance } from 'hooks/useTokenBalance'
import { useBaseTokenInfo } from 'hooks/useTokenInfo'
import { InfoOutlineIcon } from '@chakra-ui/icons'
import { FC, useEffect, useMemo } from 'react';
import { Controller, useForm } from "react-hook-form";

import { WalletStatusType } from '../../../state/atoms/walletAtoms';
import { TokenItemState } from '../ManageLiquidity/lpAtoms';



type Props = {
    connected: WalletStatusType;
    tokenA: TokenItemState;
    tokenB: TokenItemState;
    tx: any
    resetForm: boolean
    setResetForm: (value: boolean) => void
    simulated: string | null;
    onInputChange: (asset: TokenItemState, index: number) => void;
    setReverse: (value: boolean) => void;
    reverse: boolean;
}

const NewPositionForm: FC<Props> = ({
    connected,
    tokenA,
    tokenB,
    onInputChange,
    simulated,
    tx,
    resetForm,
    setResetForm,
    setReverse,
    reverse
}) => {
    const baseToken = useBaseTokenInfo()
    const { control, handleSubmit, formState, setValue, getValues } = useForm({
        mode: "onChange",
        defaultValues: {
            token1: tokenA,
            token2: tokenB,
        },
    });

    // const [[tokenABalance, tokenBBalance] = [], isLoading] = useMultipleTokenBalance([tokenA?.tokenSymbol, tokenB?.tokenSymbol])
    const { balance: tokenABalance, isLoading: tokanAloading } = useTokenBalance(tokenA?.tokenSymbol)
    const { balance: tokenBBalance, isLoading: tokanBloading } = useTokenBalance(tokenB?.tokenSymbol)

    const amountA = getValues('token1')
    const amountB = getValues('token2')

    const { data: poolList } = usePoolsListQuery()

    useEffect(() => {
        if (resetForm || tx?.txStep === TxStep.Success) {
            setValue('token1', { ...tokenA, amount: 0 })
            setValue('token2', { ...tokenB, amount: 0 })
            setResetForm(false)
        }

    }, [resetForm, tx?.txStep])

    useEffect(() => {
        if (simulated) {
            if (reverse) {
                onInputChange({ ...tokenA, amount: Number(simulated) }, 0);
                setValue('token1', { ...tokenA, amount: Number(simulated) })
            }
            else {
                onInputChange({ ...tokenB, amount: Number(simulated) }, 1);
                setValue('token2', { ...tokenA, amount: Number(simulated) })

            }
        }
        else {
            if (reverse) {
                if (!!!tokenB.amount)
                    setValue('token1', { ...tokenA, amount: undefined })
            } else {
                if (!!!tokenA.amount)
                    setValue('token2', { ...tokenB, amount: undefined })
            }
        }


    }, [simulated, reverse])

    const buttonLabel = useMemo(() => {

        if (!connected)
            return 'Connect Wallet'
        else if (!tokenB?.tokenSymbol)
            return 'Select Token'
        else if (!!!amountA?.amount)
            return 'Enter Amount'
        else if (tx?.buttonLabel)
            return tx?.buttonLabel
        else
            return 'New Position'

    }, [tx?.buttonLabel, tokenB.tokenSymbol, connected, amountA])

    const isInputDisabled = tx?.txStep == TxStep.Posting

    const tokenAList = useMemo(() => {
        const { pools = [] } = poolList || {}
        const edge = pools
            .map(({ pool_assets }) => pool_assets)
            .map(([a, b]) => a?.symbol)
        return edge

    }, [poolList])

    const edgeList = useMemo(() => {
        const { pools = [] } = poolList || {}
        const edge = pools
            .map(({ pool_assets }) => pool_assets)
            .map(([a, b]) => {
                if (a.symbol === tokenA.tokenSymbol) return b.symbol
                if (b.symbol === tokenA.tokenSymbol) return a.symbol
            })
            .filter(item => !!item)
        return edge

    }, [tokenA.tokenSymbol, poolList])

    useEffect(() => {

        if (!edgeList.includes(tokenB.tokenSymbol)) {
            setValue('token2', { ...tokenB, tokenSymbol: null })
            onInputChange({ ...tokenB, tokenSymbol: null }, 1);
        }


    }, [tokenA?.tokenSymbol, edgeList])


    return (
        <VStack padding={10}
            width="full"
            background="#1C1C1C"
            boxShadow="0px 0px 50px rgba(0, 0, 0, 0.25)"
            borderRadius="30px"
            alignItems="flex-start"
            minH={400}
            maxWidth={600}
            gap={4}
            as="form"
            onSubmit={handleSubmit(tx?.submit)}

        >

            <VStack width="full" alignItems="flex-start" paddingBottom={8}>
                <HStack>
                    <Text marginLeft={4} color="brand.50" fontSize="14" fontWeight="500">Balance: </Text>
                    {tokanAloading ? (
                        <Spinner color='white' size='xs' />
                    ) : (
                        <Text fontSize="14" fontWeight="700">{tokenABalance?.toFixed(6)}</Text>
                    )}
                </HStack>

                <Controller
                    name="token1"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                        <AssetInput
                            // edgeTokenList={tokenAList}
                            // showList={false}
                            hideToken={tokenB?.tokenSymbol}
                            // minMax={false}
                            disabled={isInputDisabled}
                            balance={tokenABalance}
                            {...field} token={tokenA}
                            onChange={(value) => {
                                setReverse(false);
                                onInputChange(value, 0);
                                field.onChange(value)
                            }}
                        />
                    )}
                />
            </VStack>

            <VStack width="full" alignItems="flex-start" paddingBottom={8}>
                <HStack>
                    <Text marginLeft={4} color="brand.50" fontSize="14" fontWeight="500">Balance: </Text>
                    {tokanBloading ? (
                        <Spinner color='white' size='xs' />
                    ) : (
                        !!tokenBBalance && (<Text fontSize="14" fontWeight="700">{tokenBBalance}</Text>)
                    )}


                </HStack>
                <Controller
                    name="token2"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                        <AssetInput
                            // showList={false}
                            edgeTokenList={edgeList}
                            hideToken={tokenA?.tokenSymbol}
                            // minMax={false}
                            disabled={isInputDisabled}
                            balance={tokenBBalance}
                            {...field} token={tokenB}
                            onChange={(value, isTokenChange) => {
                                if (tokenB?.tokenSymbol && !isTokenChange) setReverse(true);
                                if (isTokenChange && reverse) setReverse(false)
                                onInputChange(value, 1);
                                field.onChange(value)
                            }}
                        />
                    )}
                />
            </VStack>

            <Button
                type='submit'
                width="full"
                variant="primary"
                isLoading={tx?.txStep == TxStep.Estimating || tx?.txStep == TxStep.Posting || tx?.txStep == TxStep.Broadcasting}
                disabled={tx.txStep != TxStep.Ready || simulated == null}
            >
                {buttonLabel}
            </Button>

            {(Number(tx?.fee) > 0) && (
                <VStack alignItems="flex-start" width="full" px={3}>
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

export default NewPositionForm
