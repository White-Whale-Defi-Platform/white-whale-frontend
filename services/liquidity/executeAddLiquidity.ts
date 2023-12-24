import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate/build/signingcosmwasmclient'
import { InjectiveSigningStargateClient } from '@injectivelabs/sdk-ts/dist/cjs/core/stargate';
import { ChainId } from 'constants/index'
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import { TerraTreasuryService } from 'services/treasuryService'
import { getInjectiveTxData } from 'util/injective'

type ExecuteAddLiquidityArgs = {
  swapAddress: string
  chainId?: string
  senderAddress: string
  signingClient: SigningCosmWasmClient
  msgs: any
  injectiveSigningClient: InjectiveSigningStargateClient
}

export const executeAddLiquidity = async ({
  signingClient,
  injectiveSigningClient,
  senderAddress,
  msgs,
}: ExecuteAddLiquidityArgs): Promise<any> => {
  let fee: any = 'auto'
  if (await signingClient.getChainId() === ChainId.terrac) {
    const gas = Math.ceil(await signingClient.simulate(
      senderAddress, msgs, '',
    ) * 1.3)
    const funds = msgs.flatMap((elem) => elem.value.funds)
    fee = await TerraTreasuryService.getInstance().getTerraClassicFee(funds, gas)
  } else if (await signingClient.getChainId() === ChainId.injective) {
    const injectiveTxData = await getInjectiveTxData(
      injectiveSigningClient, senderAddress, msgs,
    )
    return await signingClient.broadcastTx(TxRaw.encode(injectiveTxData).finish())
  }
  return await signingClient.signAndBroadcast(
    senderAddress, msgs, fee, '',
  )
}
