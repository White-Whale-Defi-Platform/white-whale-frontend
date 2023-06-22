import { num } from 'libs/num'
import { useMemo } from 'react'
import { useRecoilValue } from 'recoil'
import { walletState } from 'state/atoms/walletAtoms'
import {
  createWithdrawExecuteMsgs,
  createWithdrawMsg,
} from './createWithdrawMsgs'
import { useTransaction } from './useWithdrawTransaction'

type Props = {
  amount: string
  contract: string
  swapAddress: string
  poolId: string
  claimIncentive?: boolean
  stakingAddress: string
}

const useWithdraw = ({
  amount,
  contract,
  swapAddress,
  poolId,
  claimIncentive,
  stakingAddress,
}: Props) => {
  const { address, client } = useRecoilValue(walletState)

  const { msgs, encodedMsgs } = useMemo(() => {
    if (parseFloat(amount) === 0 || contract === null) return {}

    return {
      msgs: createWithdrawMsg({
        contract,
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
        },
        address
      ),
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount, contract, swapAddress, stakingAddress, claimIncentive, address])

  return useTransaction({
    poolId,
    enabled: !!encodedMsgs,
    msgs,
    encodedMsgs,
    amount,
    swapAddress,
    senderAddress: address,
    lpTokenAddress: contract,
    client,
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
  } else {
    const lpTokensForPartialA = lp * (amount / tokenA)
    const tokenBForLP =
      lpTokensForPartialA === lp
        ? tokenB
        : (tokenB * (lp - lpTokensForPartialA)) / lp
    return {
      lp: num(lpTokensForPartialA).dp(0).toString(),
      simulated:
        lpTokensForPartialA === lp
          ? num(tokenBForLP).dp(0).toString()
          : num(tokenB).minus(tokenBForLP).dp(0).toString(),
    }
  }
}

export const useSimulateWithdraw = ({
  lp,
  tokenA,
  tokenB,
  amount,
  reverse,
}) => {
  return useMemo(() => {
    return simulate({
      reverse,
      amount,
      lp,
      tokenA: num(tokenA).dp(0).toPrecision(),
      tokenB: num(tokenB).dp(0).toPrecision(),
    })
  }, [amount, lp, tokenA, tokenB])
}

export default useWithdraw
