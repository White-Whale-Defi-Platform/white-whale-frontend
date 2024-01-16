import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate/build/signingcosmwasmclient'
import { coin } from '@cosmjs/stargate'
import { InjectiveSigningStargateClient } from '@injectivelabs/sdk-ts/dist/cjs/core/stargate'
import { TokenInfo } from 'components/Pages/Trade/Pools/hooks/usePoolsListQuery'
import { ChainId } from 'constants/index'
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import { TerraTreasuryService } from 'services/treasuryService'
import { getInjectiveTxData } from 'util/injective'
import {
  createExecuteMessage,
  createIncreaseAllowanceMessage,
  validateTransactionSuccess,
} from 'util/messages/index'

type DirectTokenSwapArgs = {
  tokenAmount: string
  senderAddress: string
  swapAddress: string
  tokenA: TokenInfo
  signingClient: SigningCosmWasmClient
  msgs: Record<string, any>
  chainId?: string
  injectiveSigningClient?: InjectiveSigningStargateClient
}

export const directTokenSwap = async ({
  tokenA,
  swapAddress,
  senderAddress,
  tokenAmount,
  signingClient,
  injectiveSigningClient,
  msgs,
}: DirectTokenSwapArgs) => {
  let fee: any = 'auto'
  if (!tokenA.native) {
    const increaseAllowanceMessage = createIncreaseAllowanceMessage({
      senderAddress,
      tokenAmount,
      tokenAddress: tokenA.token_address,
      swapAddress,
    })

    const executeMessage = createExecuteMessage({
      senderAddress,
      contractAddress: tokenA.token_address,
      message: msgs,
    })
    return validateTransactionSuccess(await signingClient.signAndBroadcast(
      senderAddress,
      [increaseAllowanceMessage, executeMessage],
      'auto',
      null,
    ))
  }
  console.log(signingClient)
  const execMsg = createExecuteMessage({ senderAddress,
    contractAddress: swapAddress,
    message: msgs,
    funds: [coin(tokenAmount, tokenA.denom)] })
  if (await signingClient.getChainId() === ChainId.terrac) {
    const gas = Math.ceil(await signingClient.simulate(
      senderAddress, [execMsg], '',
    ) * 1.3)
    fee = await TerraTreasuryService.getInstance().getTerraClassicFee(execMsg.value.funds, gas)
  } else if (injectiveSigningClient && await signingClient.getChainId() === ChainId.injective) {
    const injectiveTxData = await getInjectiveTxData(
      injectiveSigningClient, senderAddress, [execMsg],
    )
    return await signingClient.broadcastTx(TxRaw.encode(injectiveTxData).finish())
  }

  return await signingClient.signAndBroadcast(
    senderAddress, [execMsg], fee, '',
  )
}
