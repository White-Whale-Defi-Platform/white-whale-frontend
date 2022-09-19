import { Box, Button, HStack, Spinner, Text, Tooltip, VStack } from '@chakra-ui/react';
import AssetInput from 'components/AssetInput';
import { useBaseTokenInfo } from 'hooks/useTokenInfo'
import { useTokenBalance } from 'hooks/useTokenBalance'
import { TxStep } from 'hooks/useTransaction';
import { fromChainAmount } from "libs/num";
import { useEffect, useMemo } from 'react';
import { Controller, useForm } from "react-hook-form";

import { WalletStatusType } from '../../../state/atoms/walletAtoms';
import { TokenItemState } from './lpAtoms';
import { InfoOutlineIcon } from '@chakra-ui/icons'


type Props = {
    connected: WalletStatusType;
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
    const baseToken = useBaseTokenInfo()

    // const [[tokenABalance, tokenBBalance] = [], isLoading] = useMultipleTokenBalance([tokenA?.tokenSymbol, tokenB?.tokenSymbol])
    const { balance: tokenABalance, isLoading: tokanAloading } = useTokenBalance(tokenA?.tokenSymbol)
    const { balance: tokenBBalance, isLoading: tokanBloading } = useTokenBalance(tokenB?.tokenSymbol)

    const { control, handleSubmit, formState, setValue, getValues } = useForm({
        mode: "onChange",
        defaultValues: {
            token1: tokenA,
            token2: tokenB,
            //   slippage: String(DEFAULT_SLIPPAGE),
        },
    });

    // const [resetForm, setResetForm] = useState(false)

    const isInputDisabled = tx?.txStep == TxStep.Posting

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

        return () => {
            onInputChange({ ...tokenA, amount: 0 }, 0);
            tx?.reset()
        }

    }, [simulated, reverse])

    const amountA = getValues('token1')
    const amountB = getValues('token2')


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
                    <Text marginLeft={4} color="brand.50" fontSize="14" fontWeight="500">Balance: </Text>
                    {tokanBloading ? (
                        <Spinner color='white' size='xs' />
                    ) : (
                        <Text fontSize="14" fontWeight="700">{tokenBBalance?.toFixed(6)}</Text>
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
                isLoading={tx?.txStep == TxStep.Estimating || tx?.txStep == TxStep.Posting || tx?.txStep == TxStep.Broadcasting}
                disabled={tx.txStep != TxStep.Ready || simulated == null}
            >
                {buttonLabel}
            </Button>

            {(tokenB?.tokenSymbol && Number(amountA.amount) > 0) && (
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
                        <Text color="brand.500" fontSize={12}> {fromChainAmount(tx?.fee)} {baseToken?.symbol} </Text>
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
