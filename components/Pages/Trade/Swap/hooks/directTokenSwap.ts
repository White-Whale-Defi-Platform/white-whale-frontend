import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate/build/signingcosmwasmclient'
import { coin } from '@cosmjs/stargate'
import { InjectiveSigningStargateClient } from '@injectivelabs/sdk-ts/dist/cjs/core/stargate'
import { TokenInfo } from 'components/Pages/Trade/Pools/hooks/usePoolsListQuery'
import { ChainId } from 'constants/index'
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import { TerraTreasuryService, getInjectiveFee } from 'services/treasuryService'
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
  signingClient: SigningCosmWasmClient | InjectiveSigningStargateClient
  msgs: Record<string, any>
  chainId?: string
  cosmWasmClient: CosmWasmClient
}

export const directTokenSwap = async ({
  tokenA,
  swapAddress,
  senderAddress,
  tokenAmount,
  signingClient,
  cosmWasmClient,
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
  const execMsg = createExecuteMessage({ senderAddress,
    contractAddress: swapAddress,
    message: msgs,
    funds: [coin(tokenAmount, tokenA.denom)] })
  if (await signingClient.getChainId() === ChainId.terrac) {
    const gas = Math.ceil(await signingClient.simulate(
      senderAddress, [execMsg], '',
    ) * 1.3)
    fee = await TerraTreasuryService.getInstance().getTerraClassicFee(execMsg.value.funds, gas)
  } else if (await signingClient.getChainId() === ChainId.injective) {
    const gas = Math.ceil(await signingClient.simulate(
      senderAddress, [execMsg], '',
    ) * 1.3)
    const injectiveTxData = await signingClient.sign(
      senderAddress, [execMsg], getInjectiveFee(gas), '',
    )
    return await cosmWasmClient.broadcastTx(TxRaw.encode(injectiveTxData).finish())
  }

  return await signingClient.signAndBroadcast(
    senderAddress, [execMsg], fee, '',
  )
}
