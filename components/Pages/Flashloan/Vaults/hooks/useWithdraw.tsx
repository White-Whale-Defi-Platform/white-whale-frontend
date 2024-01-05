import { useMemo } from 'react'

import { useChain } from '@cosmos-kit/react-lite'
import {
  createWithdrawExecuteMsgs,
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
    decimals: number
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
  const { signingClient, injectiveSigningClient } = useClients(walletChainName)
  const amount = toChainAmount(token?.amount)
  const tokenInfo = useTokenInfo(token?.tokenSymbol)

  const executionMsgs = useMemo(() => {
    if (!tokenInfo || !Number(amount)) {
      return null
    }
    return createWithdrawExecuteMsgs({
      amount,
      senderAddress: address,
      vaultAddress,
      lpToken,
    })
  }, [amount, tokenInfo, vaultAddress, address, lpToken])

  const tx = useTransaction({
    enabled: Boolean(executionMsgs),
    signingClient,
    amount,
    injectiveSigningClient,
    senderAddress: address,
    executionMsgs,
    onSuccess,
  })

  return { tx }
}

export default useWithdraw
