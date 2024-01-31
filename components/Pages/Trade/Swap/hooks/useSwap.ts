import { useMemo } from 'react'

import { fromBase64, fromUtf8, toBase64, toUtf8 } from '@cosmjs/encoding'
import { useChain } from '@cosmos-kit/react-lite'
import { usePoolsListQuery } from 'components/Pages/Trade/Pools/hooks/usePoolsListQuery'
import useRoute, { executeMessage } from 'components/Pages/Trade/Swap/hooks/useRoute'
import useSimulate from 'components/Pages/Trade/Swap/hooks/useSimulate'
import useTransaction from 'components/Pages/Trade/Swap/hooks/useTransaction'
import { slippageAtom, tokenSwapAtom } from 'components/Pages/Trade/Swap/swapAtoms'
import { useClients } from 'hooks/useClients'
import { useTokenInfo } from 'hooks/useTokenInfo'
import { fromChainAmount, num, toChainAmount } from 'libs/num'
import { useRecoilValue } from 'recoil'
import { chainState } from 'state/chainState'

const SLIPPAGE = ['osmosis', 'injective']

const useSwap = ({ reverse }) => {
  const [swapTokenA, swapTokenB] = useRecoilValue(tokenSwapAtom)
  const { walletChainName } = useRecoilValue(chainState)
  const { address } = useChain(walletChainName)
  const { signingClient, cosmWasmClient, injectiveSigningClient } = useClients(walletChainName)
  const tokenA = useTokenInfo(swapTokenA?.tokenSymbol)
  const tokenB = useTokenInfo(swapTokenB?.tokenSymbol)
  let slippage = useRecoilValue(slippageAtom)
  slippage = slippage === 0 ? 1 : slippage
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
  const { simulateMsg, encodedExecuteMsg, executeMsg, path, refValue } = useRoute({
    tokenA: {
      ...tokenA,
      ...swapTokenA,
    },
    tokenB: {
      ...tokenB,
      ...swapTokenB,
    },
    amount,
    reverse,
    senderAddress: address,
    slippage: slippageToDecimal,
  })
  const refSimulation = useSimulate({
    cosmWasmClient,
    msg: refValue?.simulateMsg,
    routerAddress,
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
    const minReceiveBaseAmount = reverse ? (swapTokenB.amount * (10 ** swapTokenB.decimals)) : Number(simulated.amount)
    return fromChainAmount((minReceiveBaseAmount * Number(rate1) * Number(rate2)).toFixed(tokenB?.decimals),
      tokenB?.decimals)
  }, [simulated, slippageToDecimal, tokenB?.decimals])

  const priceImpact = useMemo(() => {
    if (!simulated || reverse) {
      return null
    }

    // Currently no refSimulation if tokenA. decimals == 18
    const simulatedValue = Number(refSimulation.simulated?.amount) / Number(refValue?.simulateMsg?.simulate_swap_operations?.offer_amount)
    const diff = Math.abs(simulatedValue - (simulated.amount / Number(amount)))
    // No Price impact on orders below 1$ Value
    if (diff === 0 || Number(simulated.amount) < Number(refSimulation.simulated?.amount)) {
      return 0
    }
    const deviation = (diff / (simulatedValue / 100)).toFixed(2)
    // Catch infinity for now
    if (deviation.includes('Infinity')) {
      return 0
    }
    return deviation
  }, [simulated])

  const updatedExecMsgEncoded = useMemo(() => {
    if (!simulated) {
      return null
    }
    const receive = toChainAmount(minReceive, tokenB?.decimals)
    if (executeMsg?.execute_swap_operations) {
      if (SLIPPAGE.includes(walletChainName)) {
        executeMsg.execute_swap_operations.max_spread = String(slippageToDecimal)
      } else {
        executeMsg.execute_swap_operations.minimum_receive = receive
      }
      return [executeMessage(
        executeMsg,
        num(reverse ? simulated?.amount : amount).toFixed(0),
        tokenA,
        routerAddress,
        address,
      )]
    } else if (executeMsg?.send) {
      const decodedMsg = JSON.parse(fromUtf8(fromBase64(executeMsg.send.msg)))
      if (SLIPPAGE.includes(walletChainName)) {
        decodedMsg.execute_swap_operations.max_spread = String(slippageToDecimal)
      } else {
        decodedMsg.execute_swap_operations.minimum_receive = receive
      }
      executeMsg.send.msg = toBase64(toUtf8(JSON.stringify(decodedMsg)))
      return [executeMessage(
        executeMsg,
        num(reverse ? simulated?.amount : amount).toFixed(0),
        tokenA,
        routerAddress,
        address,
      )]
    }
    return null
  }, [minReceive, simulated])

  const tx = useTransaction({
    enabled: Boolean(executeMsg),
    swapAddress: routerAddress,
    swapAssets: [tokenA, tokenB],
    senderAddress: address,
    signingClient,
    injectiveSigningClient,
    msgs: executeMsg,
    encodedMsgs: updatedExecMsgEncoded || encodedExecuteMsg,
    amount: reverse ? simulated?.amount : amount,
    price: num(simulated?.price).dp(6).
      toNumber(),
    onSuccess: () => { },
    onError: () => { },
  })
  return useMemo(() => ({
    path,
    tx,
    simulated,
    minReceive,
    state: {
      error,
      isLoading,
    },
    priceImpact,
  }),
  [tx, simulated, error, isLoading, minReceive, path, priceImpact])
}

export default useSwap
