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
      if (txHash == null) {
        return
      }

      return signingClient.getTx(txHash)
    },
    {
      enabled: txHash != null,
      retry: true,
    },
  )

  return txInfo
}

export default useTxInfo
