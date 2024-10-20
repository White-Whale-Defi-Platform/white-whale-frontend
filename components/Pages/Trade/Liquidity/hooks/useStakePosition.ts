import { useMemo } from 'react'

import { useChain } from '@cosmos-kit/react-lite'
import { useClients } from 'hooks/useClients'
import { num } from 'libs/num'
import { useRecoilValue } from 'recoil'
import { isNativeToken } from 'services/asset'
import { chainState } from 'state/chainState'
import { protectAgainstNaN } from 'util/conversion/index'

import { createExecuteMessage } from 'util/messages'
import { useFetchLiquidityAlliances } from './useLiquidityAlliancePositions'
import { useStakeTransaction } from './useStakeTransaction'

interface StakeProps {
  amount: string
  contract: string
}

interface SimulateProps {
  reverse: boolean
  amount: number
  lp: number
  tokenA: number
  tokenB: number
}

interface SimulationResult {
  lp: string
  simulated: string
}

const useStake = ({ amount, contract }: StakeProps) => {
  const { walletChainName } = useRecoilValue(chainState)
  const { address } = useChain(walletChainName)
  const { signingClient } = useClients(walletChainName)
  const { data: position, isLoading } = useFetchLiquidityAlliances(contract)

  const bribeMarket = useMemo(() => {
    if (isLoading || !position?.length) {
      return null
    }
    return position[0]?.bribeMarket
  }, [position, isLoading])

  const msgs = useMemo(() => {
    if (!bribeMarket || parseFloat(amount) === 0 || !contract || !signingClient) {
      return []
    }

    return [
      createExecuteMessage({
        contractAddress: bribeMarket,
        senderAddress: address,
        message: { stake: {} },
        funds: isNativeToken(contract) ? [{ denom: contract,
          amount }] : [],
      }),
    ]
  }, [amount, contract, address, bribeMarket, signingClient])

  return useStakeTransaction({
    enabled: Boolean(msgs.length && bribeMarket),
    msgs,
    senderAddress: address,
    signingClient,
  })
}

const simulate = ({ reverse, amount, lp, tokenA, tokenB }: SimulateProps): SimulationResult => {
  const calculatePartial = (total: number, partial: number): number => (total * partial) / (tokenA + tokenB)

  const calculateRemaining = (total: number, partial: number): string => num(total).minus(partial).
    dp(0).
    toString()

  if (reverse) {
    const lpTokensForPartialB = calculatePartial(lp, amount)
    const tokenAForLP = lpTokensForPartialB === lp
      ? tokenA
      : (tokenA * (lp - lpTokensForPartialB)) / lp

    return {
      lp: num(lpTokensForPartialB).dp(0).
        toString(),
      simulated: lpTokensForPartialB === lp
        ? num(tokenAForLP).dp(0).
          toString()
        : calculateRemaining(tokenA, tokenAForLP),
    }
  }

  const lpTokensForPartialA = calculatePartial(lp, amount)
  const tokenBForLP = lpTokensForPartialA === lp
    ? tokenB
    : (tokenB * (lp - lpTokensForPartialA)) / lp

  return {
    lp: num(protectAgainstNaN(lpTokensForPartialA)).dp(0).
      toString(),
    simulated: lpTokensForPartialA === lp
      ? num(tokenBForLP).dp(0).
        toString()
      : calculateRemaining(tokenB, tokenBForLP),
  }
}

export const useSimulateStake = ({ lp, tokenA, tokenB, amount, reverse }: SimulateProps) => useMemo(() => simulate({
  reverse,
  amount: Number(amount),
  lp: Number(lp),
  tokenA: Number(num(tokenA).dp(0).
    toPrecision()),
  tokenB: Number(num(tokenB).dp(0).
    toPrecision()),
}), [amount, lp, tokenA, tokenB, reverse])

export default useStake
