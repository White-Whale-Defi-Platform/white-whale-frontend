import { useMemo } from 'react'

import { useChain } from '@cosmos-kit/react-lite'
import {
  createWithdrawExecuteMsgs,
  createWithdrawMsg,
} from 'components/Pages/Flashloan/Vaults/hooks/createWithdrawMsgs'
import useTransaction from 'components/Pages/Flashloan/Vaults/hooks/useTransaction'
import { useClients } from 'hooks/useClients'
import { useTokenInfo } from 'hooks/useTokenInfo'
import { toChainAmount } from 'libs/num'
import { useRecoilValue } from 'recoil'
import { chainState } from 'state/chainState'

type DepositProps = {
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
}: DepositProps) => {
  const { walletChainName } = useRecoilValue(chainState)
  const { address } = useChain(walletChainName)
  const { signingClient } = useClients(walletChainName)
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
    signingClient,
    senderAddress: address,
    msgs,
    encodedMsgs,
    amount,
    onSuccess,
  })

  return { tx }
}

export default useWithdraw
