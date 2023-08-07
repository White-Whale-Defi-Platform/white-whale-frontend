import { useMemo } from 'react'

import { useTokenInfo } from 'hooks/useTokenInfo'
import { toChainAmount } from 'libs/num'
import { useRecoilValue } from 'recoil'
import { chainState } from 'state/atoms/chainState'

import { createDepostExecuteMsgs, createDepostMsg } from './createDepositMsgs'
import useTransaction from './useTransaction'

type DepostProps = {
  token: {
    amount: number
    tokenSymbol: string
  }
  onSuccess: (txHash: string) => void
  vaultAddress: string
}

const useDepost = ({ vaultAddress, token, onSuccess }: DepostProps) => {
  const { address, client } = useRecoilValue(chainState)
  const amount = toChainAmount(token?.amount)
  const tokenInfo = useTokenInfo(token?.tokenSymbol)

  const { msgs, encodedMsgs } = useMemo(() => {
    if (!tokenInfo || !Number(amount)) {
      return {}
    }

    return {
      msgs: createDepostMsg({ amount }),
      encodedMsgs: createDepostExecuteMsgs({
        amount,
        senderAddress: address,
        vaultAddress,
        tokenInfo,
      }),
    }
  }, [amount, tokenInfo, vaultAddress, address])

  const tx = useTransaction({
    isNative: tokenInfo?.native,
    denom: tokenInfo?.denom,
    contractAddress: vaultAddress,
    enabled: Boolean(encodedMsgs),
    client,
    senderAddress: address,
    msgs,
    encodedMsgs,
    amount,
    onSuccess,
  })

  return { tx }
}

export default useDepost
