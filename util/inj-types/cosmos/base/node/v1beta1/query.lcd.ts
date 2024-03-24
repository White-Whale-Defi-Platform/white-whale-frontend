import { LCDClient } from "@cosmology/lcd";
import { ConfigRequest, ConfigResponseSDKType } from "./query";
export class LCDQueryClient {
  req: LCDClient;
  constructor({
    requestClient
  }: {
    requestClient: LCDClient;
  }) {
    this.req = requestClient;
  }
  /* Config queries for the operator configuration. */
  config = async (_params: ConfigRequest = {}): Promise<ConfigResponseSDKType> => {
    const endpoint = `cosmos/base/node/v1beta1/config`;
    return await this.req.get<ConfigResponseSDKType>(endpoint);
  };
}