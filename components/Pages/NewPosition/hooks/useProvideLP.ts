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

const useProvideLP = ({reverse = false}) => {
  const [lpTokenA, lpTokenB] = useRecoilValue(tokenLpAtom)
    const { address, client } = useRecoilValue(walletState)
    const tokenA = useTokenInfo(lpTokenA?.tokenSymbol)
    const tokenB = useTokenInfo(lpTokenB?.tokenSymbol)
    const [matchingPools] = useQueryMatchingPoolForSwap({ tokenA, tokenB })
    const poolId = matchingPools?.streamlinePoolAB?.pool_id || matchingPools?.streamlinePoolBA?.pool_id
    const [{
      swap_address : swapAddress = null,
      liquidity  = {}
    } = {}] = useQueryPoolLiquidity({ poolId})

    
    const slippage = "0.1"
  //@ts-ignore
  const [tokenAReserve, tokenBReserve] = liquidity?.reserves?.total || []

  const tokenAAmount = toChainAmount(lpTokenA?.amount)
  const tokenBAmount = toChainAmount(lpTokenB?.amount)

  const simulated = useMemo(() => {
    if((!reverse && !lpTokenA?.amount) || (reverse && !lpTokenB?.amount) )  return null

    const normalizedValue = reverse  ? lpTokenB.amount : lpTokenA.amount || 0;
    const ratio = (reverse || matchingPools?.streamlinePoolBA) ? num(tokenAReserve).div(tokenBReserve) : num(tokenBReserve).div(tokenAReserve);
    return num(normalizedValue).times(ratio).toFixed(6);

  }, [lpTokenA, lpTokenB, swapAddress, tokenAReserve, tokenBReserve, reverse, matchingPools])

  const { msgs, encodedMsgs } = useMemo(() => {
    if (simulated == null || swapAddress == null ) return {};

    return {
      msgs: createLpMsg({
        tokenA,
        amountA: reverse? toChainAmount(simulated) : tokenAAmount,
        tokenB,
        amountB:  reverse ?  tokenBAmount: toChainAmount(simulated),
      }),
      encodedMsgs: createLPExecuteMsgs({
        tokenA,
        amountA: reverse ? toChainAmount(simulated) : tokenAAmount,
        tokenB,
        amountB: reverse? tokenBAmount :  toChainAmount(simulated),
        swapAddress
      }, address)
    }
  }, [simulated, tokenA, tokenAAmount, tokenB, tokenBAmount]);

  const tx = useTransaction({
    poolId,
    enabled: !!encodedMsgs,
    swapAddress,
    swapAssets: [tokenA, tokenB],
    senderAddress: address,
    client,
    msgs,
    encodedMsgs,
    tokenAAmount: reverse ? num(toChainAmount(simulated)).toNumber() : num(tokenAAmount).toNumber(),
    tokenBAmount: reverse ? num(tokenBAmount).toNumber() : num(toChainAmount(simulated)).toNumber(),
    onSuccess: () => { },
    onError: () => { }
  });

  return useMemo(() => ({ simulated , tx}), [simulated, tx])

}


export default useProvideLP