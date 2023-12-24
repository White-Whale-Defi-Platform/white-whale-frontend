import { useMemo } from 'react'

import { useChain } from '@cosmos-kit/react-lite'
import { createDepositExecuteMsgs, createDepositMsg } from 'components/Pages/Flashloan/Vaults/hooks/createDepositMsgs'
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
}

const useDeposit = ({ vaultAddress, token, onSuccess }: DepositProps) => {
  const { walletChainName } = useRecoilValue(chainState)
  const { address } = useChain(walletChainName)
  const { signingClient, injectiveSigningClient } = useClients(walletChainName)
  const amount = toChainAmount(token?.amount, token.decimals)
  const tokenInfo = useTokenInfo(token?.tokenSymbol)

  const { msgs, encodedMsgs } = useMemo(() => {
    if (!tokenInfo || !Number(amount)) {
      return {}
    }

    return {
      msgs: createDepositMsg({ amount }),
      encodedMsgs: createDepositExecuteMsgs({
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
    signingClient,
    injectiveSigningClient,
    senderAddress: address,
    msgs,
    encodedMsgs,
    amount,
    onSuccess,
  })

  return { tx }
}

export default useDeposit
