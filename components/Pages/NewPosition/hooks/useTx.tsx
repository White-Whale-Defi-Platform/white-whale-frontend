
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

function getErrorMessage(error) {
    // console.log({ error })
    switch (error.code) {
        case 0:
            return "Unknown error";
        case 1:
            return "Internal error";
        case 2:
            return "User denied transaction signature";
        case 3:
            return "Invalid request";
        case 4:
            if (error.rawLog.includes("revert")) {
                return "Contract error";
            } else if (error.rawLog.includes("insufficient liquidity")) {
                return "Low liquidity error";
            } else {
                return "Transaction failed";
            }
        default:
            return "Unknown error code: " + error.code;
    }
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

    const description = (hash:string) => (
        <Finder txHash={hash} chainId={client.client.chainId}>
            {}
        </Finder>
    )

    const onError = (error: TxError) => {

        const message = getErrorMessage(error);

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
        onError,
        onSuccess,
        txStep,
        txHash,
        error,
        txInfo
    }

}

export default useTx