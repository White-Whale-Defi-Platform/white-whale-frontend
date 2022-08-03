import { Button, HStack, Text, VStack } from '@chakra-ui/react';
import AssetInput from 'components/AssetInput';
import { FC, useEffect, useMemo } from 'react';
import { Controller, useForm } from "react-hook-form";
import { TokenItemState } from '../ManageLP/lpAtoms';
import { TxStep } from 'hooks/useTransaction';
import { useMultipleTokenBalance } from 'hooks/useTokenBalance';
import { fromChainAmount } from "libs/num";



type Props = {
    connected: boolean;
    tokenA: TokenItemState;
    tokenB: TokenItemState;
    // isReverse: boolean;
    tx: any
    // minReceive: number
    // onReverseDirection: () => void
    // setReverse: (valuse: boolean) => void
    resetForm: boolean
    setResetForm: (value: boolean) => void
    simulated: string | null;
    onInputChange: (asset: TokenItemState, index: number) => void;
}

const ProvideLPForm: FC<Props> = ({
    connected,
    tokenA,
    tokenB,
    onInputChange,
    simulated,
    tx,
    resetForm,
    setResetForm
}) => {
    const { control, handleSubmit, formState, setValue, getValues } = useForm({
        mode: "onChange",
        defaultValues: {
            token1: tokenA,
            token2: tokenB,
            //   slippage: String(DEFAULT_SLIPPAGE),
        },
    });

    const [[tokenABalance, tokenBBalance] = []] = useMultipleTokenBalance([tokenA?.tokenSymbol, tokenB?.tokenSymbol])

    const amountA = getValues('token1')
    const amountB = getValues('token2')

    useEffect(() => {
        if (resetForm) {
            setValue('token1', tokenA)
            setValue('token2', tokenB)
            setResetForm(false)
        }

    }, [resetForm])

    useEffect(() => {

        if (simulated)
            setValue('token2', { ...tokenA, amount: Number(simulated) })

    }, [simulated])

    const buttonLabel = useMemo(() => {

        if (!connected)
            return 'Connect wallet'
        else if (!tokenB?.tokenSymbol)
            return 'Select token'
        else if (!!!tokenA?.amount)
            return 'Enter amount'
        else if (tx?.buttonLabel)
            return tx?.buttonLabel
        else
            return 'Add Liquidity'

    }, [tx?.buttonLabel, tokenB.tokenSymbol, connected, tokenA?.amount])

    const isInputDisabled = tx?.txStep == TxStep.Posting


    return (
        <div>
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
                        <Text marginLeft={4} color="brand.200" fontSize="14" fontWeight="500">Asset Input</Text>
                        <Text fontSize="14" fontWeight="700">{tokenABalance}</Text>
                    </HStack>
                    {/* TODO: Type error: Type instantiation is excessively deep and possibly infinite. */}

                    <Controller
                        name="token1"
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                            <AssetInput
                                disabled={isInputDisabled}
                                {...field} token={tokenA}
                                onChange={(value) => { onInputChange(value, 0); field.onChange(value) }}
                            />
                        )}
                    />
                </VStack>

                <VStack width="full" alignItems="flex-start" paddingBottom={8}>
                    <HStack>
                        <Text marginLeft={4} color="brand.200" fontSize="14" fontWeight="500">Asset Input</Text>
                        <Text fontSize="14" fontWeight="700">{tokenBBalance}</Text>
                    </HStack>
                    {/* TODO: Type error: Type instantiation is excessively deep and possibly infinite. */}
                    <Controller
                        name="token2"
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                            <AssetInput
                                disabled={isInputDisabled}
                                {...field} token={tokenB}
                                onChange={(value) => { onInputChange(value, 1); field.onChange(value) }}
                            />
                        )}
                    />
                </VStack>

                {(tokenB?.tokenSymbol) && (
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
        </div>
    )
}

export default ProvideLPForm