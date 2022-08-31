import { Button, HStack, Text, VStack, Spinner } from '@chakra-ui/react';
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
import { fromChainAmount, num } from "libs/num";


type Props = {
    connected: boolean;
    tokenA: TokenItemState;
    tokenB: TokenItemState;
    tx: any
    // resetForm: boolean
    // setResetForm: (value: boolean) => void
    simulated: string | null;
    onInputChange: (asset: TokenItemState, index: number) => void;
    setReverse: (value: boolean) => void;
    reverse: boolean;
}

const DepositForm = ({ tokenA, tokenB, onInputChange, connected, tx, simulated, setReverse, reverse }: Props) => {

    const [[tokenABalance, tokenBBalance] = [], isLoading] = useMultipleTokenBalance([tokenA?.tokenSymbol, tokenB?.tokenSymbol])

    const { control, handleSubmit, formState, setValue, getValues } = useForm({
        mode: "onChange",
        defaultValues: {
            token1: tokenA,
            token2: tokenB,
            //   slippage: String(DEFAULT_SLIPPAGE),
        },
    });

    const { chainId, key } = useRecoilValue(walletState)
    // const [resetForm, setResetForm] = useState(false)

    const isInputDisabled = tx?.txStep == TxStep.Posting

    useEffect(() => {

        if (simulated) {
            if (reverse)
                setValue('token1', { ...tokenB, amount: num(simulated).toNumber() })
            else
                setValue('token2', { ...tokenA, amount: num(simulated).toNumber() })
        }
        else {
            setValue('token1', { ...tokenA, amount: 0 })
            setValue('token2', { ...tokenB, amount: 0 })
        }

        return () => tx?.reset()

    }, [simulated, reverse])

    const amountA = getValues('token1')
    const amountB = getValues('token2')


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
            return 'Deposit'

    }, [tx?.buttonLabel, tokenB.tokenSymbol, connected, amountA])





    return (
        <VStack
            paddingY={6}
            paddingX={2}
            width="full"
            as="form"
            onSubmit={handleSubmit(tx?.submit)}

        >

            <VStack width="full" alignItems="flex-start" paddingBottom={8}>
                <HStack>
                    <Text marginLeft={4} color="brand.200" fontSize="14" fontWeight="500">Balance: </Text>
                    {isLoading ? (
                        <Spinner color='band.500' size='xs' />
                    ) : (
                        <Text fontSize="14" fontWeight="700">{tokenABalance}</Text>
                    )}

                </HStack>
                <Controller
                    name="token1"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                        <AssetInput {...field}
                            // minMax={false}
                            token={tokenA}
                            disabled={isInputDisabled}
                            balance={tokenABalance}
                            showList={false}
                            onChange={(value) => { setReverse(false); onInputChange(value, 0); field.onChange(value) }}
                        />
                    )}
                />
            </VStack>

            <VStack width="full" alignItems="flex-start" paddingBottom={8}>
                <HStack>
                    <Text marginLeft={4} color="brand.200" fontSize="14" fontWeight="500">Balance: </Text>
                    {isLoading ? (
                        <Spinner color='band.500' size='xs' />
                    ) : (
                        <Text fontSize="14" fontWeight="700">{tokenBBalance}</Text>
                    )}

                </HStack>
                <Controller
                    name="token2"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                        <AssetInput {...field}
                            // minMax={false}
                            disabled={isInputDisabled || !tokenB?.tokenSymbol}
                            token={tokenB}
                            balance={tokenBBalance}
                            showList={false}
                            onChange={(value) => { setReverse(true); onInputChange(value, 1); field.onChange(value) }}
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

            {(tokenB?.tokenSymbol && Number(amountA.amount) > 0) && (
                <VStack alignItems="flex-start" width="full" p={3}>
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

export default DepositForm