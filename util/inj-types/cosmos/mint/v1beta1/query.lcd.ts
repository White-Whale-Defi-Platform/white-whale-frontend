import { LCDClient } from "@cosmology/lcd";
import { QueryParamsRequest, QueryParamsResponseSDKType, QueryInflationRequest, QueryInflationResponseSDKType, QueryAnnualProvisionsRequest, QueryAnnualProvisionsResponseSDKType } from "./query";
export class LCDQueryClient {
  req: LCDClient;
  constructor({
    requestClient
  }: {
    requestClient: LCDClient;
  }) {
    this.req = requestClient;
  }
  /* Params returns the total set of minting parameters. */
  params = async (_params: QueryParamsRequest = {}): Promise<QueryParamsResponseSDKType> => {
    const endpoint = `cosmos/mint/v1beta1/params`;
    return await this.req.get<QueryParamsResponseSDKType>(endpoint);
  };
  /* Inflation returns the current minting inflation value. */
  inflation = async (_params: QueryInflationRequest = {}): Promise<QueryInflationResponseSDKType> => {
    const endpoint = `cosmos/mint/v1beta1/inflation`;
    return await this.req.get<QueryInflationResponseSDKType>(endpoint);
  };
  /* AnnualProvisions current minting annual provisions value. */
  annualProvisions = async (_params: QueryAnnualProvisionsRequest = {}): Promise<QueryAnnualProvisionsResponseSDKType> => {
    const endpoint = `cosmos/mint/v1beta1/annual_provisions`;
    return await this.req.get<QueryAnnualProvisionsResponseSDKType>(endpoint);
  };
}