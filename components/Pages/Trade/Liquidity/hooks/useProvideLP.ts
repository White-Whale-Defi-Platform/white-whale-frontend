import { useMemo } from 'react'

import { useChain } from '@cosmos-kit/react-lite'
import {
  Config,
  useConfig,
} from 'components/Pages/Bonding/hooks/useDashboardData'
import useFactoryConfig from 'components/Pages/Trade/Incentivize/hooks/useFactoryConfig'
import createLpMsg, { createLPExecuteMsgs } from 'components/Pages/Trade/Liquidity/hooks/createLPMsg'
import useTransaction from 'components/Pages/Trade/Liquidity/hooks/useDepositTransaction'
import useIsNewPosition from 'components/Pages/Trade/Liquidity/hooks/useIsNewPosition'
import { useQueryMatchingPoolForSwap } from 'components/Pages/Trade/Pools/hooks/useQueryMatchingPoolForSwap'
import { useQueryPoolLiquidity } from 'components/Pages/Trade/Pools/hooks/useQueryPoolsLiquidity'
import { useClients } from 'hooks/useClients'
import { useTokenInfo } from 'hooks/useTokenInfo'
import { num, toChainAmount } from 'libs/num'
import { useRecoilValue } from 'recoil'
import { chainState } from 'state/chainState'
import { tokenItemState } from 'state/tokenItemState'

const useProvideLP = ({ reverse = false, bondingDays }) => {
  const [lpTokenA, lpTokenB] = useRecoilValue(tokenItemState)
  const { chainId, network, walletChainName } = useRecoilValue(chainState)
  const { address } = useChain(walletChainName)
  const { signingClient, injectiveSigningClient } = useClients(walletChainName)
  const config: Config = useConfig(network, chainId)
  const tokenInfoA = useTokenInfo(lpTokenA?.tokenSymbol)
  const tokenInfoB = useTokenInfo(lpTokenB?.tokenSymbol)
  const [matchingPools] = useQueryMatchingPoolForSwap({
    tokenA: tokenInfoA,
    tokenB: tokenInfoB,
  })
  const poolId =
    matchingPools?.streamlinePoolAB?.pool_id ||
    matchingPools?.streamlinePoolBA?.pool_id
  const lpOrder =
    matchingPools?.streamlinePoolAB?.lpOrder ||
    matchingPools?.streamlinePoolBA?.lpOrder

  // Const [pool] = usePoolFromListQueryById({ poolId })
  const isNewPosition = useIsNewPosition({ bondingDays,
    poolId })

  const factoryConfig = useFactoryConfig(config?.incentive_factory)
  let minUnbondingDuration = 86400
  if (factoryConfig) {
    minUnbondingDuration = factoryConfig?.minUnbondingDuration
  }

  const [{ swap_address: swapAddress = null, liquidity = {} } = {}, isLoading] =
    useQueryPoolLiquidity({ poolId })

  // Const lpBalance = liquidity?.providedTotal?.tokenAmount || 0

  const [tokenA, tokenB, flipped] = useMemo(() => {
    if (!lpOrder) {
      return [tokenInfoA, tokenInfoB, false]
    }

    return lpOrder?.[0] === tokenInfoA?.symbol
      ? [tokenInfoA, tokenInfoB, false]
      : [tokenInfoB, tokenInfoA, true]
  }, [tokenInfoA, tokenInfoB, lpOrder])

  const [lpA, lpB] = useMemo(() => {
    if (!lpOrder) {
      return [lpTokenA, lpTokenB]
    }

    return lpOrder?.[0] === lpTokenA?.tokenSymbol
      ? [lpTokenA, lpTokenB]
      : [lpTokenB, lpTokenA]
  }, [lpTokenA, lpTokenB, lpOrder])

  const [tokenAReserve, tokenBReserve] = liquidity?.reserves?.total || []

  const tokenAAmount = toChainAmount(lpA?.amount,
    flipped ? tokenInfoB?.decimals : tokenInfoA?.decimals)
  const tokenBAmount = toChainAmount(lpB?.amount,
    flipped ? tokenInfoA?.decimals : tokenInfoB?.decimals)
  const simulated = useMemo(() => {
    if (
      (!reverse && !lpTokenA?.amount) ||
      (reverse && !lpTokenB?.amount) ||
      tokenAReserve === 0 ||
      tokenBReserve === 0
    ) {
      return null
    }

    const decimals = reverse ? tokenInfoB?.decimals : tokenInfoA?.decimals
    const normalizedValue = reverse ? lpTokenB.amount : lpTokenA.amount || 0
    const tokenA = num(tokenAReserve).
      div(10 ** (tokenInfoA?.decimals || 6)).
      toNumber()
    const tokenB = num(tokenBReserve).
      div(10 ** (tokenInfoB?.decimals || 6)).
      toNumber()
    const ratio = reverse ? num(tokenA).div(tokenB) : num(tokenB).div(tokenA)
    return num(normalizedValue).times(ratio.toNumber()).
      toFixed(decimals)
  }, [
    lpTokenA,
    lpTokenB,
    swapAddress,
    tokenAReserve,
    tokenBReserve,
    reverse,
    matchingPools,
  ])

  const { msgs, encodedMsgs } = useMemo(() => {
    if (
      !simulated ||
      !tokenAAmount ||
      !tokenBAmount ||
      !swapAddress ||
      !minUnbondingDuration
    ) {
      return {}
    }

    return {
      msgs: createLpMsg({
        minUnbondingDuration,
        bondingDays,
        tokenA,
        pairAddress: swapAddress,
        amountA: reverse
          ? flipped
            ? tokenAAmount
            : toChainAmount(simulated, tokenInfoA?.decimals)
          : tokenAAmount,
        tokenB,
        amountB: reverse
          ? tokenBAmount
          : flipped
            ? tokenBAmount
            : toChainAmount(simulated, tokenInfoB?.decimals),
      }),
      encodedMsgs: createLPExecuteMsgs({
        minUnbondingDuration,
        tokenA,
        bondingDays,
        pairAddress: swapAddress,
        stakingProxy:
            bondingDays === 0 ? swapAddress : config?.frontend_helper,
        amountA: reverse
          ? flipped
            ? tokenAAmount
            : toChainAmount(simulated, tokenInfoA?.decimals)
          : flipped
            ? tokenAAmount
            : tokenAAmount,
        tokenB,
        amountB: reverse
          ? flipped
            ? tokenBAmount
            : tokenBAmount
          : flipped
            ? tokenBAmount
            : toChainAmount(simulated, tokenInfoB?.decimals),
      },
      address),
    }
  }, [
    simulated,
    tokenA,
    tokenAAmount,
    tokenB,
    tokenBAmount,
    reverse,
    config?.frontend_helper,
    bondingDays,
    isNewPosition,
  ])

  const tx = useTransaction({
    enabled:
      Boolean(encodedMsgs) &&
      Number(tokenAAmount) > 0 &&
      Number(tokenBAmount) > 0,
    swapAddress: bondingDays === 0 ? swapAddress : config?.frontend_helper,
    senderAddress: address,
    signingClient,
    injectiveSigningClient,
    msgs,
    encodedMsgs,
    tokenAAmount: reverse
      ? flipped
        ? tokenAAmount
        : toChainAmount(simulated, tokenInfoA?.decimals)
      : tokenAAmount,
    tokenBAmount: reverse
      ? tokenBAmount
      : flipped
        ? tokenBAmount
        : toChainAmount(simulated, tokenInfoB?.decimals),
    onSuccess: () => {},
    onError: () => {},
  })
  const noMatchingPool =
    !swapAddress && !isLoading
      ? {
        buttonLabel: 'No Matching Pool',
      }
      : {}

  return useMemo(() => ({ simulated,
    tx: { ...tx,
      ...noMatchingPool } }),
  [simulated, tx])
}

export default useProvideLP
