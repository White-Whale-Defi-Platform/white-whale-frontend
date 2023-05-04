
import { useToast } from '@chakra-ui/react'
import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { useEffect, useState } from 'react'
import { TxStep } from 'types/common'
import Finder from 'components/Finder'
import useTxInfo from './useTxInfo'

const parseError = (error: Error) => {
    const customErrors = [
        { regex: /insufficient funds/i, message: 'Insufficient funds' },
        { regex: /overflow: cannot sub with/i, message: 'Insufficient funds' },
        { regex: /max spread assertion/i, message: 'Try increasing slippage' },
        { regex: /request rejected/i, message: 'User denied' }
    ];

    const errorMessage = error?.message || '';

    const matchedError = customErrors.find(({ regex }) => regex.test(errorMessage));
    return matchedError ? matchedError.message : 'Failed to execute transaction.';
}


const useTx = ({ client, transcationType }) => {

    const [txStep, setTxStep] = useState<TxStep>(TxStep.Idle)
    const [txHash, setTxHash] = useState<string | undefined>(undefined)
    const [error, setError] = useState<unknown | null>(null)
    const [buttonLabel, setButtonLabel] = useState<unknown | null>(null)
    const toast = useToast()
    const txInfo = useTxInfo({ txHash, client })

    useEffect(() => {
        if (txInfo != null && txHash != null) {
            if (txInfo?.txResponse?.code) {
                setTxStep(TxStep.Failed)
            } else {
                setTxStep(TxStep.Success)
            }
        }
    }, [txInfo, txHash])

    const description = (hash: string) => (
        <Finder txHash={hash} chainId={client.client.chainId}>
        </Finder>
    )

    const onError = (error: Error) => {

        const message = parseError(error);

        toast({
            title: `${transcationType} Failed.`,
            description: message,
            status: 'error',
            duration: 9000,
            position: 'top-right',
            isClosable: true,
        })

        setTxStep(TxStep.Failed)
    }

    const onMutate = () => {
        setTxStep(TxStep.Posting)
    }

    const reset = () => {
        setError(null)
        setTxHash(undefined)
        setTxStep(TxStep.Idle)
      }

    const onSuccess = (data: any) => {
        setTxStep(TxStep.Broadcasting)
        setTxHash(data.transactionHash)

        toast({
            title: `${transcationType} Success.`,
            description: description(data.transactionHash),
            status: 'success',
            duration: 9000,
            position: 'top-right',
            isClosable: true,
        })

    }

    return {
        onMutate,
        onError,
        onSuccess,
        txStep,
        txHash,
        error,
        txInfo,
        reset
    }

}

export default useTx