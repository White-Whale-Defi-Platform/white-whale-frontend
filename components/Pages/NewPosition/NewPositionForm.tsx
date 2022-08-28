import { Button, HStack, Text, VStack } from '@chakra-ui/react';
import AssetInput from 'components/AssetInput';
import { FC, useEffect, useMemo } from 'react';
import { Controller, useForm } from "react-hook-form";
import { TokenItemState } from '../ManageLiquidity/lpAtoms';
import { TxStep } from 'hooks/useTransaction';
import { useMultipleTokenBalance } from 'hooks/useTokenBalance';
import { fromChainAmount } from "libs/num";



type Props = {
    connected: boolean;
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
    const { control, handleSubmit, formState, setValue, getValues } = useForm({
        mode: "onChange",
        defaultValues: {
            token1: tokenA,
            token2: tokenB,
        },
    });

    const [[tokenABalance, tokenBBalance] = []] = useMultipleTokenBalance([tokenA?.tokenSymbol, tokenB?.tokenSymbol])

    const amountA = getValues('token1')
    const amountB = getValues('token2')

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
            return 'Connect wallet'
        else if (!tokenB?.tokenSymbol)
            return 'Select token'
        else if (!!!amountA?.amount)
            return 'Enter amount'
        else if (tx?.buttonLabel)
            return tx?.buttonLabel
        else
            return 'New Position'

    }, [tx?.buttonLabel, tokenB.tokenSymbol, connected, amountA])

    const isInputDisabled = tx?.txStep == TxStep.Posting

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
                    <Text marginLeft={4} color="brand.200" fontSize="14" fontWeight="500">Balance: </Text>
                    <Text fontSize="14" fontWeight="700">{tokenABalance}</Text>
                </HStack>

                <Controller
                    name="token1"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                        <AssetInput
                            hideToken={tokenB?.tokenSymbol}
                            minMax={false}
                            disabled={isInputDisabled}
                            balance={tokenABalance}
                            {...field} token={tokenA}
                            onChange={(value) => { setReverse(false); onInputChange(value, 0); field.onChange(value) }}
                        />
                    )}
                />
            </VStack>

            <VStack width="full" alignItems="flex-start" paddingBottom={8}>
                <HStack>
                    <Text marginLeft={4} color="brand.200" fontSize="14" fontWeight="500">Balance: </Text>
                    {!!tokenBBalance && (<Text fontSize="14" fontWeight="700">{tokenBBalance}</Text>)}

                </HStack>
                <Controller
                    name="token2"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                        <AssetInput
                            hideToken={tokenA?.tokenSymbol}
                            minMax={false}
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
                isLoading={tx?.txStep == TxStep.Estimating || tx?.txStep == TxStep.Posting}
                disabled={tx.txStep != TxStep.Ready || simulated == null}
            >
                {buttonLabel}
            </Button>

            {(tokenB?.tokenSymbol && amountB.amount) && (
                <VStack alignItems="flex-start" width="full" px={3}>
                    <HStack justifyContent="space-between" width="full">
                        <Text color="brand.500" fontSize={12}> Fees </Text>
                        <Text color="brand.500" fontSize={12}> {fromChainAmount(tx?.fee)} </Text>
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