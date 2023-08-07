import { useMemo } from 'react'

import { useTokenInfo } from 'hooks/useTokenInfo'
import { toChainAmount } from 'libs/num'
import { useRecoilValue } from 'recoil'
import { chainState } from 'state/atoms/chainState'

import {
  createWithdrawExecuteMsgs,
  createWithdrawMsg,
} from './createWithdrawMsgs'
import useTransaction from './useTransaction'

type DepostProps = {
  token: {
    amount: number
    tokenSymbol: string
  }
  onSuccess: (txHash: string) => void
  vaultAddress: string
  lpToken: string
}

const useWithdraw = ({
  vaultAddress,
  lpToken,
  token,
  onSuccess,
}: DepostProps) => {
  const { address, client } = useRecoilValue(chainState)
  const amount = toChainAmount(token?.amount)
  const tokenInfo = useTokenInfo(token?.tokenSymbol)

  const { msgs, encodedMsgs } = useMemo(() => {
    if (!tokenInfo || !Number(amount)) {
      return {}
    }

    return {
      msgs: createWithdrawMsg({
        amount,
        vaultAddress,
      }),
      encodedMsgs: createWithdrawExecuteMsgs({
        amount,
        senderAddress: address,
        vaultAddress,
        lpToken,
      }),
    }
  }, [amount, tokenInfo, vaultAddress, address, lpToken])

  const tx = useTransaction({
    isNative: false,
    denom: tokenInfo?.denom,
    contractAddress: lpToken,
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

export default useWithdraw
