import { toast } from 'react-hot-toast'
import { useMutation } from 'react-query'

import { Button } from '@chakra-ui/react'
import { useChain } from '@cosmos-kit/react-lite'
import { useQueryMatchingPoolForSwap } from 'components/Pages/Trade/Pools/hooks/useQueryMatchingPoolForSwap'
import { slippageAtom, tokenSwapAtom } from 'components/Pages/Trade/Swap/swapAtoms'
import { useClients } from 'hooks/useClients'
import { useRefetchQueries } from 'hooks/useRefetchQueries'
import { useTokenInfo } from 'hooks/useTokenInfo'
// TODO: These should be deprecated in place of some other chakra component so we can remove the dep on junoblocks
import {
  ErrorIcon,
  IconWrapper,
  Toast,
  UpRightArrow,
  Valid,
} from 'junoblocks'
import { useRecoilValue, useSetRecoilState } from 'recoil'
import { passThroughTokenSwap } from 'services/swap/index'
import { chainState } from 'state/chainState'
import {
  TransactionStatus,
  transactionStatusState,
} from 'state/transactionStatusState'
import { convertDenomToMicroDenom } from 'util/conversion/index'

type UseTokenSwapArgs = {
  tokenASymbol: string
  tokenBSymbol: string
  /* Token amount in denom */
  tokenAmount: number
  tokenToTokenPrice: number
}

export const useTokenSwap = ({
  tokenASymbol,
  tokenBSymbol,
  tokenAmount: providedTokenAmount,
  tokenToTokenPrice,
}: UseTokenSwapArgs) => {
  const { walletChainName } = useRecoilValue(chainState)
  const { isWalletConnected, address } = useChain(walletChainName)
  const { signingClient } = useClients(walletChainName)
  const setTransactionState = useSetRecoilState(transactionStatusState)
  const slippage = useRecoilValue(slippageAtom)
  const setTokenSwap = useSetRecoilState(tokenSwapAtom)

  const tokenA = useTokenInfo(tokenASymbol)
  const tokenB = useTokenInfo(tokenBSymbol)
  const [matchingPools] = useQueryMatchingPoolForSwap({ tokenA,
    tokenB })
  const refetchQueries = useRefetchQueries(['tokenBalance'])

  return useMutation(
    'swapTokens',
    () => {
      if (!isWalletConnected) {
        throw new Error('Please connect your wallet.')
      }

      setTransactionState(TransactionStatus.EXECUTING)

      const tokenAmount = convertDenomToMicroDenom(providedTokenAmount,
        tokenA.decimals).toString()

      const price = convertDenomToMicroDenom(tokenToTokenPrice, tokenB.decimals)

      const {
        baseTokenAPool,
        baseTokenBPool,
      } = matchingPools

      return passThroughTokenSwap({
        tokenAmount,
        price,
        slippage,
        senderAddress: address,
        tokenA,
        swapAddress: baseTokenAPool.swap_address,
        outputSwapAddress: baseTokenBPool.swap_address,
        signingClient,
      })
    },
    {
      async onSuccess() {
        toast.custom((t) => (
          <Toast
            icon={<IconWrapper icon={<Valid />} color="valid" />}
            title="Swap successful!"
            onClose={() => toast.dismiss(t.id)}
          />
        ))

        setTokenSwap(([aToken, bToken]) => [
          {
            ...aToken,
            amount: 0,
          },
          bToken,
        ])

        await refetchQueries()
      },
      onError(e) {
        const errorMessage =
          String(e).length > 300
            ? `${String(e).substring(0, 150)} ... ${String(e).substring(String(e).length - 150)}`
            : String(e)

        toast.custom((t) => (
          <Toast
            icon={<ErrorIcon color="error" />}
            title="Oops swap error!"
            body={errorMessage}
            buttons={
              <Button
                as="a"
                variant="ghost"
                href={process.env.NEXT_PUBLIC_FEEDBACK_LINK}
                target="__blank"
                rightIcon={<UpRightArrow />}
              >
                Provide feedback
              </Button>
            }
            onClose={() => toast.dismiss(t.id)}
          />
        ))
      },
      onSettled() {
        setTransactionState(TransactionStatus.IDLE)
      },
    },
  )
}
