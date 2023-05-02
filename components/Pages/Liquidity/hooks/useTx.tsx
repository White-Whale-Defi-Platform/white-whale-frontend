
import { useToast } from '@chakra-ui/react'
import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { isTxError, TxError } from '@terra-money/feather.js'
import { useEffect, useState } from 'react'
import { TxStep } from 'types/common'
import Finder from '../../../Finder'
import useTxInfo from './useTxInfo'

type Tx = {
    transcationType: string;
    client: CosmWasmClient;
}

// function parseError(error) {
//     if (error?.code) {
//         switch (error.code) {
//             case 0:
//                 return "Unknown error";
//             case 1:
//                 return "Internal error";
//             case 2:
//                 return "User denied transaction signature";
//             case 3:
//                 return "Invalid request";
//             case 4:
//                 if (error.rawLog.includes("revert")) {
//                     return "Contract error";
//                 } else if (error.rawLog.includes("insufficient liquidity")) {
//                     return "Low liquidity error";
//                 } else {
//                     return "Transaction failed";
//                 }
//             default:
//                 return "Unknown error code: " + error.code;
//         }
//     } else {
//         if (
//             /insufficient funds/i.test(error?.message) ||
//             /Overflow: Cannot Sub with/i.test(error?.message)
//         )
//             return 'Insufficient funds'
//         else if (/Max spread assertion/i.test(error?.message))
//             return 'Try increasing slippage'
//         else if (/Request rejected/i.test(error?.message))
//             return 'User denied'
//         else
//             return 'Failed to execute transaction.'

//     }

// }

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