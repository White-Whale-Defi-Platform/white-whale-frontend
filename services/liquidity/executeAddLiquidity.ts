import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate/build/signingcosmwasmclient'

type ExecuteAddLiquidityArgs = {
  senderAddress: string
  signingClient: SigningCosmWasmClient
  msgs: any
}

export const executeAddLiquidity = async ({
  signingClient,
  senderAddress,
  msgs,
}: ExecuteAddLiquidityArgs): Promise<any> => await signingClient.signAndBroadcast(
  senderAddress, msgs, 'auto', null,
)
