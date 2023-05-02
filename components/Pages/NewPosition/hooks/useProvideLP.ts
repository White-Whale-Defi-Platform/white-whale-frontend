import { useTokenInfo } from 'hooks/useTokenInfo'
import useTransaction from './useTransaction'
// import useTransaction from './useTransactionBond'
import { num, toChainAmount } from 'libs/num'
import { useQueryPoolLiquidity } from 'queries/useQueryPools'
import { useMemo } from 'react'
import { useRecoilValue } from 'recoil'
import { walletState } from 'state/atoms/walletAtoms'
import { fromChainAmount } from 'libs/num'

import { tokenLpAtom } from '../../ManageLiquidity/lpAtoms'
import createLpMsg, { createLPExecuteMsgs } from '../createLPMsg'
import { useQueryMatchingPoolForSwap } from 'queries/useQueryMatchingPoolForSwap'
import { createBondExecuteMsgs, createBondtMsg } from '../createBondMsg'
import { usePoolFromListQueryById } from '../../../../queries/usePoolsListQuery'
import { fromUtf8 } from '@cosmjs/encoding'

const useProvideLP = ({ reverse = false, bondingDays = 0 }) => {
  const [lpTokenA, lpTokenB] = useRecoilValue(tokenLpAtom)
  const { address, client } = useRecoilValue(walletState)
  const tokenInfoA = useTokenInfo(lpTokenA?.tokenSymbol)
  const tokenInfoB = useTokenInfo(lpTokenB?.tokenSymbol)
  const [matchingPools] = useQueryMatchingPoolForSwap({
    tokenA: tokenInfoA,
    tokenB: tokenInfoB,
  })
  const poolId =
    matchingPools?.streamlinePoolAB?.pool_id ||
    matchingPools?.streamlinePoolBA?.pool_id
  const staking_address =
    matchingPools?.streamlinePoolAB?.staking_address ||
    matchingPools?.streamlinePoolBA?.staking_address
  const lpOrder =
    matchingPools?.streamlinePoolAB?.lpOrder ||
    matchingPools?.streamlinePoolBA?.lpOrder

  const [pool] = usePoolFromListQueryById({ poolId })

  const [{ swap_address: swapAddress = null, liquidity = {} } = {}, isLoading] =
    useQueryPoolLiquidity({ poolId })

  const lpBalance = liquidity?.providedTotal?.tokenAmount || 0

  const [tokenA, tokenB, flipped] = useMemo(() => {
    if (!lpOrder) return [tokenInfoA, tokenInfoB, false]

    return lpOrder?.[0] === tokenInfoA?.symbol
      ? [tokenInfoA, tokenInfoB, false]
      : [tokenInfoB, tokenInfoA, true]
  }, [tokenInfoA, tokenInfoB, lpOrder])

  const [lpA, lpB] = useMemo(() => {
    if (!lpOrder) return [lpTokenA, lpTokenB]

    return lpOrder?.[0] === lpTokenA?.tokenSymbol
      ? [lpTokenA, lpTokenB]
      : [lpTokenB, lpTokenA]
  }, [lpTokenA, lpTokenB, lpOrder])

  const slippage = '0.1'
  //@ts-ignore
  const [tokenAReserve, tokenBReserve] = liquidity?.reserves?.total || []

  const tokenAAmount = toChainAmount(
    lpA?.amount,
    flipped ? tokenInfoB?.decimals : tokenInfoA?.decimals
  )
  const tokenBAmount = toChainAmount(
    lpB?.amount,
    flipped ? tokenInfoA?.decimals : tokenInfoB?.decimals
  )
  const simulated = useMemo(() => {
    if (
      (!reverse && !lpTokenA?.amount) ||
      (reverse && !lpTokenB?.amount) ||
      tokenAReserve === 0 ||
      tokenBReserve === 0
    )
      return null

    const decimals = reverse ? tokenInfoB?.decimals : tokenInfoA?.decimals
    const normalizedValue = reverse ? lpTokenB.amount : lpTokenA.amount || 0
    const tokenA = num(tokenAReserve)
      .div(10 ** tokenInfoA?.decimals)
      .toNumber()
    const tokenB = num(tokenBReserve)
      .div(10 ** tokenInfoB?.decimals)
      .toNumber()
    const ratio =
      reverse
        ? num(tokenA).div(tokenB)
        : num(tokenB).div(tokenA)
    const sim = num(normalizedValue).times(ratio.toNumber()).toFixed(decimals)

    return sim
  }, [
    lpTokenA,
    lpTokenB,
    swapAddress,
    tokenAReserve,
    tokenBReserve,
    reverse,
    matchingPools,
  ])

  // const { bondMsg, encodedBondMsg } = useMemo(() => {
  //   const msg = createBondtMsg({
  //     amount : String(lpBalance),
  //   })
  //   const encodedMsg = createBondExecuteMsgs({
  //     amount : String(lpBalance),
  //     senderAddress: address,
  //     stakingAddress: staking_address,
  //   })
  //   return { bondMsg: msg, encodedBondMsg: encodedMsg }
  // }, [liquidity, staking_address])

  const { msgs, encodedMsgs } = useMemo(() => {
    if (
      simulated == null ||
      !tokenAAmount ||
      !tokenBAmount ||
      swapAddress == null
    )
      return {}

    return {
      msgs: createLpMsg({
        bondingDays,
        tokenA,
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
      encodedMsgs: createLPExecuteMsgs(
        {
          tokenA,
          bondingDays,
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
          swapAddress : pool?.staking_proxy,
        },
        address
      ),
    }
  }, [simulated, tokenA, tokenAAmount, tokenB, tokenBAmount, reverse, pool?.staking_proxy, bondingDays])

  console.log({encodedMsgs, msgs})

  // if(encodedMsgs?.length > 0){
  //   console.log({newmsgs: encodedMsgs?.map(msg => {
  //     const value = msg?.value
  //     const m = JSON.parse(fromUtf8(value?.msg || ""))
  //     value.msg = m
  //     return  {
  //       ...msg,
  //       value
  //     }   
  //   })})
  // }

  // msgs, client, stakingAddress, senderAddress, amount, lpAddress
  // const tx = useTransaction({
  //   msgs: bondMsg,
  //   client,
  //   stakingAddress: staking_address,
  //   senderAddress: address,
  //   amount: lpBalance,
  //   lpAddress: "migaloo1ff55scggwlgulr8tjmmtg0wyvd4xssyu6kjz84t4602gzt22nf8q6ztfr4",
  // })

  const tx = useTransaction({
    poolId,
    enabled: !!encodedMsgs,
    swapAddress : pool?.staking_proxy,
    swapAssets: [tokenA, tokenB],
    senderAddress: address,
    client,
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
    swapAddress === null && !isLoading
      ? {
        buttonLabel: 'No Matching Pool',
      }
      : {}

  return useMemo(
    () => ({ simulated, tx: { ...tx, ...noMatchingPool } }),
    [simulated, tx]
  )
}

export default useProvideLP
