import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate/build/signingcosmwasmclient'
import { InjectiveSigningStargateClient } from '@injectivelabs/sdk-ts/dist/cjs/core/stargate';
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx';

import { ChainId } from '../../../../constants';
import { getInjectiveFee } from '../../../../services/treasuryService';
import { createExecuteMessage } from '../../../../util/messages';

type ExecuteFlashloanArgs = {
  senderAddress: string
  contractAddress: string
  signingClient: SigningCosmWasmClient | InjectiveSigningStargateClient
  cosmWasmClient: CosmWasmClient
  msgs: any
}

export const executeFlashloan = async ({
  msgs,
  signingClient,
  cosmWasmClient,
  contractAddress,
  senderAddress,
}: ExecuteFlashloanArgs): Promise<any> => {
  if (await signingClient.getChainId() === ChainId.injective) {
    const msgencoded = createExecuteMessage({ senderAddress,
      contractAddress,
      msgs })
    console.log(msgencoded)
    const gas = Math.ceil(await signingClient.simulate(
      senderAddress, [msgencoded], '',
    ) * 1.3)
    const injectiveTxData = await signingClient.sign(
      senderAddress, [msgencoded], getInjectiveFee(gas), '',
    )
    return await cosmWasmClient.broadcastTx(TxRaw.encode(injectiveTxData).finish())
  }

  return await signingClient.execute(
    senderAddress, contractAddress, msgs, 'auto',
  )
}
