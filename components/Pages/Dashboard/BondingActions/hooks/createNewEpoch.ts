import { Config } from 'components/Pages/Dashboard/hooks/useDashboardData'
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate/build/signingcosmwasmclient'

export const createNewEpoch = async (
  signingClient: SigningCosmWasmClient,
  config: Config,
  address: string,
) => {
  const handleMsg = {
    new_epoch: {},
  }

  return await signingClient.execute(
    address,
    config.fee_distributor,
    handleMsg,
    'auto',
  )
}
