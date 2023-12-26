import { InjectiveSigningStargateClient } from '@injectivelabs/sdk-ts/dist/cjs/core/stargate'
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx'
import { getInjectiveFee } from 'services/treasuryService'

export const getInjectiveTxData = async (
  injectiveSigningClient: InjectiveSigningStargateClient, address: string, msgs: Array<any>,
): Promise<TxRaw> => {
  const gas = Math.ceil(await injectiveSigningClient.simulate(
    address, msgs, '',
  ) * 1.3)
  return await injectiveSigningClient.sign(
    address, msgs, getInjectiveFee(gas), '',
  )
}
