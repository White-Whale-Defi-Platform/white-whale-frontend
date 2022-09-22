import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { Button, HStack, Text, VStack, Spinner, useToast } from '@chakra-ui/react';
import AssetInput from 'components/AssetInput';
import useWithdraw from '../hooks/useWithdraw';
import { TxStep } from '../hooks/useTransaction';
import { fromChainAmount } from 'libs/num'
import Finder from 'components/Finder'
import { useRecoilState, useRecoilValue } from 'recoil';
import {walletState, WalletStatusType} from 'state/atoms/walletAtoms';

type Props = {
    connected: WalletStatusType
    isLoading: boolean
    balance: number | undefined
    defaultToken: string
    vaultAddress: string
    lpToken: string
    assetBlance: string,
    refetch: () => void
}

const WithdrawForm = ({
    connected,
    isLoading,
    balance,
    defaultToken,
    vaultAddress,
    lpToken,
    assetBlance,
    refetch
}: Props) => {

    const [token, setToken] = useState({
        amount: 0,
        tokenSymbol: defaultToken
    })
    const toast = useToast()
    const { chainId } = useRecoilValue(walletState)
    const onSuccess = useCallback((txHash) => {
        refetch?.()
        toast({
            title: 'Withdraw from Vault Success.',
            description: <Finder txHash={txHash} chainId={chainId} > </Finder>,
            status: 'success',
            duration: 9000,
            position: "top-right",
            isClosable: true,
        })
    }, [token])

    const { tx } = useWithdraw({ vaultAddress, lpToken, token, onSuccess })

    const buttonLabel = useMemo(() => {

        if (connected !== `@wallet-state/connected`)
            return 'Connect Wallet'
        else if (!!!token?.amount)
            return 'Enter Amount'
        else if (tx?.buttonLabel)
            return tx?.buttonLabel
        else
            return 'Withdraw'

    }, [tx?.buttonLabel, connected, token])

    const onSubmit = (event) => {
        event?.preventDefault();
        tx?.submit()
    }

    useEffect(() => {
        if (tx.txStep === TxStep.Success) {
            setToken({ ...token, amount: 0 })
            tx?.reset()
        }
    }, [tx.txStep])

    return (
        <VStack
            paddingY={6}
            paddingX={2}
            width="full"
            as="form"
            onSubmit={onSubmit}

        >

            <VStack width="full" alignItems="flex-start" paddingBottom={8}>
                <HStack>
                    <Text marginLeft={4} color="brand.50" fontSize="14" fontWeight="500">LP Balance: </Text>
                    {isLoading ? (
                        <Spinner color='white' size='xs' />
                    ) : (
                        <HStack>
                            <Text fontSize="14" fontWeight="700">
                                {Number(fromChainAmount(balance))?.toFixed(6)}
                            </Text>
                            <Text color="gray" fontSize="14">
                                ( {token?.tokenSymbol}: {Number(fromChainAmount(assetBlance))?.toFixed(6)} )
                            </Text>
                        </HStack>
                    )}

                </HStack>
                <AssetInput
                    value={token}
                    token={token}
                    disabled={false}
                    ignoreSlack={true}
                    // minMax={false}
                    balance={Number(fromChainAmount(balance))}
                    showList={false}
                    onChange={(value) => setToken(value)}
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

            <VStack alignItems="flex-start" width="full" p={3}>
                <HStack justifyContent="space-between" width="full">
                    <Text color="brand.500" fontSize={12}> Fees </Text>
                    <Text color="brand.500" fontSize={12}> {fromChainAmount(tx?.fee)} </Text>
                </HStack>
            </VStack>



            {/* {
                (tx?.error && !!!tx.buttonLabel) && (<Text color="red" fontSize={12}> {tx?.error} </Text>)
            } */}
        </VStack>
    )
}

export default WithdrawForm
