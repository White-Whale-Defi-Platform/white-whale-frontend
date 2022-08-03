import { useTokenInfo } from 'hooks/useTokenInfo';
import useTransaction from "./useTransaction";
import { num, toChainAmount } from 'libs/num';
import { useQueryPoolLiquidity } from 'queries/useQueryPools';
import { useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import { walletState } from 'state/atoms/walletAtoms';
import { tokenLpAtom } from '../../ManageLP/lpAtoms';
import createLpMsg, { createLPExecuteMsgs } from '../createLPMsg';

type Props = {
  lpTokens: any[];
  liquidity: any;
  swapAddress: string;
}

const useProvideLP = () => {
  const [lpTokenA, lpTokenB] = useRecoilValue(tokenLpAtom)
    const { address, client } = useRecoilValue(walletState)
    const tokenA = useTokenInfo(lpTokenA?.tokenSymbol)
    const tokenB = useTokenInfo(lpTokenB?.tokenSymbol)
    const [{
        swap_address : swapAddress = null,
        liquidity  = {}
    } = {}] = useQueryPoolLiquidity({ poolId: "JUNOX-JUNOONE" })

    const slippage = "0.1"
  //@ts-ignore
  const [tokenAReserve, tokenBReserve] = liquidity?.reserves?.total || []

  const tokenAAmount = toChainAmount(lpTokenA?.amount)
  const tokenBAmount = toChainAmount(lpTokenB?.amount)

  const simulated = useMemo(() => {

    if (!lpTokenA?.amount) return null

    const normalizedValue = lpTokenA.amount || 0;
    const ratio = num(tokenBReserve).div(tokenAReserve);
    return num(normalizedValue).times(ratio).toFixed(6);

  }, [lpTokenA])


  const { msgs, encodedMsgs } = useMemo(() => {
    if (simulated == null) return {};

    return {
      msgs: createLpMsg({
        tokenA: tokenA?.token_address,
        amountA: tokenAAmount,
        tokenB: tokenB?.token_address,
        amountB: toChainAmount(simulated),
      }),
      encodedMsgs: createLPExecuteMsgs({
        tokenA,
        amountA: tokenAAmount,
        tokenB,
        amountB: toChainAmount(simulated),
        swapAddress
      }, address)
    }
  }, [simulated, lpTokenA?.amount]);

  const tx = useTransaction({
    enabled: !!encodedMsgs,
    swapAddress,
    swapAssets: [tokenA, tokenB],
    senderAddress: address,
    client,
    msgs,
    encodedMsgs,
    tokenAAmount: Number(tokenAAmount),
    tokenBAmount: Number(toChainAmount(simulated)),
    onSuccess: () => { },
    onError: () => { }
  });

  // console.log({
  //   lpTokenA,
  //   lpTokenB,
  //   tx,
  //   liquidity,
  //   tokenA,
  //   tokenB,
  //   tokenAAmount: Number(tokenAAmount),
  //   maxTokenBAmount: Number(toChainAmount(simulated)),
  //   client,
  //   swapAddress,
  //   senderAddress: address,
  //   simulated
  // })


  return { simulated , tx}

}

export default useProvideLP