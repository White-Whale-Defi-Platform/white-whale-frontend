import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate/build/signingcosmwasmclient'

type ExecuteFlashloanArgs = {
  senderAddress: string
  contractAddress: string
  signingClient: SigningCosmWasmClient
  msgs: any
}

export const executeFlashloan = async ({
  msgs,
  signingClient,
  contractAddress,
  senderAddress,
}: ExecuteFlashloanArgs): Promise<any> => await signingClient.execute(
  senderAddress, contractAddress, msgs, 'auto',
)
