import { useMemo } from 'react'

import { useChain } from '@cosmos-kit/react-lite'
import {
  createWithdrawExecuteMsgs,
  createWithdrawMsg,
} from 'components/Pages/Trade/Liquidity/hooks/createWithdrawMsgs'
import { useWithdrawTransaction } from 'components/Pages/Trade/Liquidity/hooks/useWithdrawTransaction'
import { useClients } from 'hooks/useClients'
import { num } from 'libs/num'
import { useRecoilValue } from 'recoil'
import { isNativeToken } from 'services/asset'
import { chainState } from 'state/chainState'
import { protectAgainstNaN } from 'util/conversion/index'

type Props = {
  amount: string
  contract: string
  swapAddress: string
  claimIncentive?: boolean
  stakingAddress: string
}

const useWithdraw = ({
  amount,
  contract,
  swapAddress,
  claimIncentive,
  stakingAddress,
}: Props) => {
  const { walletChainName } = useRecoilValue(chainState)
  const { address } = useChain(walletChainName)
  const { signingClient, injectiveSigningClient } = useClients(walletChainName)

  const { msgs, encodedMsgs } = useMemo(() => {
    if (parseFloat(amount) === 0 || !contract || !signingClient) {
      return {}
    }

    return {
      msgs: createWithdrawMsg({
        amount,
        swapAddress,
      }),
      encodedMsgs: createWithdrawExecuteMsgs({
        swapAddress,
        contract,
        amount,
        claimIncentive,
        stakingAddress,
        isNative: isNativeToken(contract),
      },
      address),
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount, contract, swapAddress, stakingAddress, claimIncentive, address])

  return useWithdrawTransaction({
    enabled: Boolean(encodedMsgs),
    msgs,
    encodedMsgs,
    amount,
    senderAddress: address,
    signingClient,
    injectiveSigningClient,
  })
}

const simulate = ({ reverse, amount, lp, tokenA, tokenB }) => {
  if (reverse) {
    const lpTokensForPartialB = lp * (amount / tokenB)
    const tokenAForLP =
      lpTokensForPartialB === lp
        ? tokenA
        : (tokenA * (lp - lpTokensForPartialB)) / lp
    return {
      lp: num(lpTokensForPartialB).dp(0).
        toString(),
      simulated:
        lpTokensForPartialB === lp
          ? num(tokenAForLP).dp(0).
            toString()
          : num(tokenA).minus(tokenAForLP).
            dp(0).
            toString(),
    }
  }
  const lpTokensForPartialA = lp * (amount / tokenA)
  const tokenBForLP =
    lpTokensForPartialA === lp
      ? tokenB
      : (tokenB * (lp - lpTokensForPartialA)) / lp
  return {
    lp: num(protectAgainstNaN(lpTokensForPartialA)).dp(0).
      toString(),
    simulated:
      lpTokensForPartialA === lp
        ? num(tokenBForLP).dp(0).
          toString()
        : num(tokenB).minus(tokenBForLP).
          dp(0).
          toString(),
  }
}

export const useSimulateWithdraw = ({ lp, tokenA, tokenB, amount, reverse }) => useMemo(() => simulate({
  reverse,
  amount,
  lp,
  tokenA: num(tokenA).dp(0).
    toPrecision(),
  tokenB: num(tokenB).dp(0).
    toPrecision(),
}),
[amount, lp, tokenA, tokenB])

export default useWithdraw
