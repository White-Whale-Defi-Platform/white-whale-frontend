import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate/build/signingcosmwasmclient'
import { coin } from '@cosmjs/stargate'
import { InjectiveSigningStargateClient } from '@injectivelabs/sdk-ts/dist/cjs/core/stargate'
import { ChainId } from 'constants/index'
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx'
import { getInjectiveTxData } from 'util/injective'
import { createExecuteMessage } from 'util/messages/index'

type ExecuteAddLiquidityArgs = {
  denom: string
  amount: string | number
  senderAddress: string
  contractAddress: string
  signingClient: SigningCosmWasmClient
  msgs: any
  injectiveSigningClient?: InjectiveSigningStargateClient
}

export const executeVault = async ({
  denom,
  msgs,
  amount,
  signingClient,
  injectiveSigningClient,
  contractAddress,
  senderAddress,
}: ExecuteAddLiquidityArgs): Promise<any> => {
  const funds = [coin(amount, denom)]

  if (injectiveSigningClient && await signingClient.getChainId() === ChainId.injective) {
    const execMsg = createExecuteMessage({ senderAddress,
      contractAddress,
      message: msgs,
      funds })
    const injectiveTxData = await getInjectiveTxData(
      injectiveSigningClient, senderAddress, [execMsg],
    )
    return await signingClient.broadcastTx(TxRaw.encode(injectiveTxData).finish())
  }

  return signingClient.execute(
    senderAddress,
    contractAddress,
    msgs,
    'auto',
    null,
    funds,
  )
}
