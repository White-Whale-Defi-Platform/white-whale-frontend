import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate/build/signingcosmwasmclient'
import { InjectiveSigningStargateClient } from '@injectivelabs/sdk-ts/dist/cjs/core/stargate';
import { ChainId } from 'constants/index'
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import { TerraTreasuryService, getInjectiveFee } from 'services/treasuryService'

type ExecuteAddLiquidityArgs = {
  swapAddress: string
  chainId?: string
  senderAddress: string
  signingClient: SigningCosmWasmClient | InjectiveSigningStargateClient
  msgs: any
  cosmWasmClient: CosmWasmClient
}

export const executeAddLiquidity = async ({
  signingClient,
  senderAddress,
  msgs,
  cosmWasmClient,
}: ExecuteAddLiquidityArgs): Promise<any> => {
  let fee: any = 'auto'
  if (await signingClient.getChainId() === ChainId.terrac) {
    const gas = Math.ceil(await signingClient.simulate(
      senderAddress, msgs, '',
    ) * 1.3)
    const funds = msgs.flatMap((elem) => elem.value.funds)
    fee = await TerraTreasuryService.getInstance().getTerraClassicFee(funds, gas)
  } else if (await signingClient.getChainId() === ChainId.injective) {
    const gas = Math.ceil(await signingClient.simulate(
      senderAddress, msgs, '',
    ) * 1.3)
    const injectiveTxData = await signingClient.sign(
      senderAddress, msgs, getInjectiveFee(gas), '',
    )
    return await cosmWasmClient.broadcastTx(TxRaw.encode(injectiveTxData).finish())
  }
  return await signingClient.signAndBroadcast(
    senderAddress, msgs, fee, '',
  )
}
