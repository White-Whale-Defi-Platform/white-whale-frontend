import { Wallet } from 'util/wallet-adapters'

type ExecuteFlashloanArgs = {
  senderAddress: string
  contractAddress: string
  client: Wallet
  msgs: any
}

export const executeFlashloan = async ({
  msgs,
  client,
  contractAddress,
  senderAddress,
}: ExecuteFlashloanArgs): Promise<any> => client.execute(
  senderAddress, contractAddress, msgs, [],
)
