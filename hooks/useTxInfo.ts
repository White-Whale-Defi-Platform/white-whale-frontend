import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { useQuery } from 'react-query'

type TxInfo = {
  txHash: string | null
  client: CosmWasmClient
}

const useTxInfo = ({ txHash, client }) => {
  const { data: txInfo } = useQuery(
    ['txInfo', txHash],
    () => {
      if (txHash == null) {
        return
      }

      return client.getTx(txHash)
    },
    {
      enabled: txHash != null,
      retry: true,
    }
  )

  return txInfo
}

export default useTxInfo
