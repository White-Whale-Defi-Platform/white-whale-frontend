import { useMemo } from 'react'

import { num } from 'libs/num'
import { useRecoilValue } from 'recoil'
import { isNativeToken } from 'services/asset'
import { chainState } from 'state/atoms/chainState'
import { protectAgainstNaN } from 'util/conversion/index'

import {
  createWithdrawExecuteMsgs,
  createWithdrawMsg,
} from './createWithdrawMsgs'
import { useWithdrawTransaction } from './useWithdrawTransaction'

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
  const { address, client } = useRecoilValue(chainState)

  const { msgs, encodedMsgs } = useMemo(() => {
    if (parseFloat(amount) === 0 || contract === null || !client) {
      return {}
    }

    return {
      msgs: createWithdrawMsg({
        amount,
        swapAddress,
      }),
      encodedMsgs: createWithdrawExecuteMsgs(
        {
          swapAddress,
          contract,
          amount,
          claimIncentive,
          stakingAddress,
          isNative: isNativeToken(contract),
        },
        address
      ),
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount, contract, swapAddress, stakingAddress, claimIncentive, address])

  return useWithdrawTransaction({
    lpTokenAddress: contract,
    swapAddress,
    enabled: Boolean(encodedMsgs),
    msgs,
    encodedMsgs,
    amount,
    senderAddress: address,
    client,
    isNative: isNativeToken(contract),
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
      lp: num(lpTokensForPartialB).dp(0).toString(),
      simulated:
        lpTokensForPartialB === lp
          ? num(tokenAForLP).dp(0).toString()
          : num(tokenA).minus(tokenAForLP).dp(0).toString(),
    }
  }
  const lpTokensForPartialA = lp * (amount / tokenA)
  const tokenBForLP =
    lpTokensForPartialA === lp
      ? tokenB
      : (tokenB * (lp - lpTokensForPartialA)) / lp
  return {
    lp: num(protectAgainstNaN(lpTokensForPartialA)).dp(0).toString(),
    simulated:
      lpTokensForPartialA === lp
        ? num(tokenBForLP).dp(0).toString()
        : num(tokenB).minus(tokenBForLP).dp(0).toString(),
  }
}

export const useSimulateWithdraw = ({ lp, tokenA, tokenB, amount, reverse }) =>
  useMemo(
    () =>
      simulate({
        reverse,
        amount,
        lp,
        tokenA: num(tokenA).dp(0).toPrecision(),
        tokenB: num(tokenB).dp(0).toPrecision(),
      }),
    [amount, lp, tokenA, tokenB]
  )

export default useWithdraw
