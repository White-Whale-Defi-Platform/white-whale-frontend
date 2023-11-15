import { useQuery } from 'react-query'

import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate/build/signingcosmwasmclient'

type TxInfo = {
  txHash: string | null
  signingClient: SigningCosmWasmClient
}

const useTxInfo = ({ txHash, signingClient }: TxInfo) => {
  const { data: txInfo } = useQuery(
    ['txInfo', txHash],
    () => {
      if (!txHash) {
        return null
      }
      return signingClient.getTx(txHash)
    },
    {
      enabled: Boolean(txHash),
      retry: true,
    },
  )

  return txInfo
}

export default useTxInfo
