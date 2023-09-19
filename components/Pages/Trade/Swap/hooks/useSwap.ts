import { useMemo } from 'react'

import { useChain } from '@cosmos-kit/react-lite'
import useRoute from 'components/Pages/Trade/Swap/hooks/useRoute'
import useSimulate from 'components/Pages/Trade/Swap/hooks/useSimulate'
import useTransaction from 'components/Pages/Trade/Swap/hooks/useTransaction'
import { slippageAtom, tokenSwapAtom } from 'components/Pages/Trade/Swap/swapAtoms'
import { useClients } from 'hooks/useClients'
import { useTokenInfo } from 'hooks/useTokenInfo'
import { fromChainAmount, num, toChainAmount } from 'libs/num'
import { usePoolsListQuery } from 'queries/usePoolsListQuery'
import { useRecoilValue } from 'recoil'
import { chainState } from 'state/chainState'

const useSwap = ({ reverse }) => {
  const [swapTokenA, swapTokenB] = useRecoilValue(tokenSwapAtom)
  const { walletChainName } = useRecoilValue(chainState)
  const { address } = useChain(walletChainName)
  const { signingClient, cosmWasmClient } = useClients(walletChainName)
  const tokenA = useTokenInfo(swapTokenA?.tokenSymbol)
  const tokenB = useTokenInfo(swapTokenB?.tokenSymbol)
  const slippage = useRecoilValue(slippageAtom)
  const { data: poolsList } = usePoolsListQuery()

  const amount = reverse
    ? swapTokenB?.amount > 0
      ? toChainAmount(swapTokenB?.amount, tokenB?.decimals)
      : ''
    : swapTokenA?.amount > 0
      ? toChainAmount(swapTokenA?.amount, tokenA?.decimals)
      : ''
  const { routerAddress } = poolsList || {}
  const slippageToDecimal = slippage / 100
  const { simulateMsg, encodedExecuteMsg, executeMsg, path } = useRoute({
    tokenA: { ...tokenA,
      ...swapTokenA },
    tokenB: { ...tokenB,
      ...swapTokenB },
    amount,
    reverse,
    senderAddress: address,
    slippage: slippageToDecimal,
  })

  const { simulated, error, isLoading } = useSimulate({
    cosmWasmClient,
    msg: simulateMsg,
    routerAddress,
  })
  const minReceive = useMemo(() => {
    if (!simulated) {
      return null
    }

    const rate1 = num(1).minus(slippageToDecimal)
    const rate2 = num(1).minus(0.001)
    return fromChainAmount(num(simulated.amount).times(rate1).
      times(rate2).
      toFixed(tokenB?.decimals),
    tokenB?.decimals)
  }, [simulated, slippageToDecimal, tokenB?.decimals])

  const tx = useTransaction({
    enabled: Boolean(executeMsg),
    swapAddress: routerAddress,
    swapAssets: [tokenA, tokenB],
    senderAddress: address,
    signingClient,
    msgs: executeMsg,
    encodedMsgs: encodedExecuteMsg,
    amount: reverse ? simulated?.amount : amount,
    price: num(simulated?.price).dp(6).
      toNumber(),
    onSuccess: () => {},
    onError: () => {},
  })
  return useMemo(() => ({
    path,
    tx,
    simulated,
    minReceive,
    state: { error,
      isLoading },
  }),
  [tx, simulated, error, isLoading, minReceive, path])
}

export default useSwap
