import { LCDClient } from "@cosmology/lcd";
import { QueryInterchainAccountRequest, QueryInterchainAccountResponseSDKType, QueryParamsRequest, QueryParamsResponseSDKType } from "./query";
export class LCDQueryClient {
  req: LCDClient;
  constructor({
    requestClient
  }: {
    requestClient: LCDClient;
  }) {
    this.req = requestClient;
  }
  /* InterchainAccount returns the interchain account address for a given owner address on a given connection */
  interchainAccount = async (params: QueryInterchainAccountRequest): Promise<QueryInterchainAccountResponseSDKType> => {
    const endpoint = `ibc/apps/interchain_accounts/controller/v1/owners/${params.owner}/connections/${params.connectionId}`;
    return await this.req.get<QueryInterchainAccountResponseSDKType>(endpoint);
  };
  /* Params queries all parameters of the ICA controller submodule. */
  params = async (_params: QueryParamsRequest = {}): Promise<QueryParamsResponseSDKType> => {
    const endpoint = `ibc/apps/interchain_accounts/controller/v1/params`;
    return await this.req.get<QueryParamsResponseSDKType>(endpoint);
  };
}