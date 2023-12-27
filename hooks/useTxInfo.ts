import { useQuery } from 'react-query'

type TxInfo = {
  txHash: string | null
  signingClient: any
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
