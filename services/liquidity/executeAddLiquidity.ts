import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate/build/signingcosmwasmclient'
import { ChainId } from 'constants/index'
import { TerraTreasuryService } from 'services/treasuryService'

type ExecuteAddLiquidityArgs = {

    swapAddress: string
    chainId?: string
  senderAddress: string
  signingClient: SigningCosmWasmClient
  msgs: any
}

export const executeAddLiquidity = async ({
  signingClient,
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
  }
  return await signingClient.signAndBroadcast(
    senderAddress, msgs, fee, '',
  )
}
