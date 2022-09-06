import { useTokenInfo } from 'hooks/useTokenInfo';
import useTransaction from "./useTransaction";
import { num, toChainAmount } from 'libs/num';
import { useQueryPoolLiquidity } from 'queries/useQueryPools';
import { useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import { walletState } from 'state/atoms/walletAtoms';
import { tokenLpAtom } from '../../ManageLiquidity/lpAtoms';
import createLpMsg, { createLPExecuteMsgs } from '../createLPMsg';
import { useQueryMatchingPoolForSwap } from 'queries/useQueryMatchingPoolForSwap';

const useProvideLP = ({ reverse = false }) => {
  const [lpTokenA, lpTokenB] = useRecoilValue(tokenLpAtom)
  const { address, client } = useRecoilValue(walletState)
  const A = useTokenInfo(lpTokenA?.tokenSymbol)
  const B = useTokenInfo(lpTokenB?.tokenSymbol)
  const [matchingPools] = useQueryMatchingPoolForSwap({ tokenA: A, tokenB: B })
  const poolId = matchingPools?.streamlinePoolAB?.pool_id || matchingPools?.streamlinePoolBA?.pool_id
  const lpOrder = matchingPools?.streamlinePoolAB?.lpOrder || matchingPools?.streamlinePoolBA?.lpOrder

  const [{
    swap_address: swapAddress = null,
    liquidity = {}
  } = {}, isLoading] = useQueryPoolLiquidity({ poolId })

  const [tokenA, tokenB, flipped] = useMemo(() => {
    if (!lpOrder) return [A, B, false]

    return lpOrder?.[0] === A?.symbol ? [A, B, false] : [B, A, true]
  }, [A, B, lpOrder])

  const [lpA, lpB] = useMemo(() => {
    if (!lpOrder) return [lpTokenA, lpTokenB]

    return lpOrder?.[0] === lpTokenA?.tokenSymbol ? [lpTokenA, lpTokenB] : [lpTokenB, lpTokenA]
  }, [lpTokenA, lpTokenB, lpOrder])


  const slippage = "0.1"
  //@ts-ignore
  const [tokenAReserve, tokenBReserve] = liquidity?.reserves?.total || []

  const tokenAAmount = toChainAmount(lpA?.amount )
  const tokenBAmount = toChainAmount(lpB?.amount)

  const simulated = useMemo(() => {
    if ((!reverse && !lpTokenA?.amount) || (reverse && !lpTokenB?.amount) || tokenAReserve === 0 || tokenBReserve === 0) return null


    const normalizedValue = reverse ? lpTokenB.amount : lpTokenA.amount || 0;
    const ratio = (reverse || matchingPools?.streamlinePoolBA) ? num(tokenAReserve).div(tokenBReserve) : num(tokenBReserve).div(tokenAReserve);
    return num(normalizedValue).times(ratio).toFixed(6);

  }, [lpTokenA, lpTokenB, swapAddress, tokenAReserve, tokenBReserve, reverse, matchingPools])

  const { msgs, encodedMsgs } = useMemo(() => {
    if (simulated == null || !tokenAAmount || !tokenBAmount  || swapAddress == null) return {};

    return {
      msgs: createLpMsg({
        tokenA,
        amountA: reverse ? flipped ?  tokenAAmount  : toChainAmount(simulated)  : tokenAAmount ,
        tokenB,
        amountB: reverse ? tokenBAmount  : flipped ?  tokenBAmount : toChainAmount(simulated),
      }),
      encodedMsgs: createLPExecuteMsgs({
        tokenA,
        amountA: reverse ? flipped ? tokenAAmount : toChainAmount(simulated)  : flipped ?  tokenAAmount : tokenAAmount ,
        tokenB,
        amountB: reverse ? flipped ?  tokenBAmount : tokenBAmount :  flipped ?  tokenBAmount : toChainAmount(simulated),
        swapAddress,
      }, address)
    }
  }, [simulated, tokenA, tokenAAmount, tokenB, tokenBAmount, reverse]);

  const tx = useTransaction({
    poolId,
    enabled: !!encodedMsgs,
    swapAddress,
    swapAssets: [tokenA, tokenB],
    senderAddress: address,
    client,
    msgs,
    encodedMsgs,
    tokenAAmount: reverse ? num(flipped ? tokenAAmount : toChainAmount(simulated)).toNumber()  : num(tokenAAmount).toNumber() ,
    tokenBAmount:  reverse ? num(tokenBAmount).toNumber()  : num(flipped ?  tokenBAmount : toChainAmount(simulated)).toNumber(),
    onSuccess: () => { },
    onError: () => { }
  });

  const noMatchingPool = swapAddress === null && !isLoading ? {
    buttonLabel: "No Matching Pool"
  } : {}

  return useMemo(() => ({ simulated, tx: { ...tx, ...noMatchingPool } }), [simulated, tx])

}


export default useProvideLP