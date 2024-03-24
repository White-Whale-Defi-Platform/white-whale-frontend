import { setPaginationParams } from "../../../../helpers";
import { LCDClient } from "@cosmology/lcd";
import { QueryDenomTraceRequest, QueryDenomTraceResponseSDKType, QueryDenomTracesRequest, QueryDenomTracesResponseSDKType, QueryParamsRequest, QueryParamsResponseSDKType, QueryDenomHashRequest, QueryDenomHashResponseSDKType, QueryEscrowAddressRequest, QueryEscrowAddressResponseSDKType, QueryTotalEscrowForDenomRequest, QueryTotalEscrowForDenomResponseSDKType } from "./query";
export class LCDQueryClient {
  req: LCDClient;
  constructor({
    requestClient
  }: {
    requestClient: LCDClient;
  }) {
    this.req = requestClient;
  }
  /* DenomTrace queries a denomination trace information. */
  denomTrace = async (params: QueryDenomTraceRequest): Promise<QueryDenomTraceResponseSDKType> => {
    const options: any = {
      params: {}
    };
    if (typeof params?.hash !== "undefined") {
      options.params.hash = params.hash;
    }
    const endpoint = `ibc/apps/transfer/v1/denom_traces/${params.hash}`;
    return await this.req.get<QueryDenomTraceResponseSDKType>(endpoint, options);
  };
  /* DenomTraces queries all denomination traces. */
  denomTraces = async (params: QueryDenomTracesRequest = {
    pagination: undefined
  }): Promise<QueryDenomTracesResponseSDKType> => {
    const options: any = {
      params: {}
    };
    if (typeof params?.pagination !== "undefined") {
      setPaginationParams(options, params.pagination);
    }
    const endpoint = `ibc/apps/transfer/v1/denom_traces`;
    return await this.req.get<QueryDenomTracesResponseSDKType>(endpoint, options);
  };
  /* Params queries all parameters of the ibc-transfer module. */
  params = async (_params: QueryParamsRequest = {}): Promise<QueryParamsResponseSDKType> => {
    const endpoint = `ibc/apps/transfer/v1/params`;
    return await this.req.get<QueryParamsResponseSDKType>(endpoint);
  };
  /* DenomHash queries a denomination hash information. */
  denomHash = async (params: QueryDenomHashRequest): Promise<QueryDenomHashResponseSDKType> => {
    const options: any = {
      params: {}
    };
    if (typeof params?.trace !== "undefined") {
      options.params.trace = params.trace;
    }
    const endpoint = `ibc/apps/transfer/v1/denom_hashes/${params.trace}`;
    return await this.req.get<QueryDenomHashResponseSDKType>(endpoint, options);
  };
  /* EscrowAddress returns the escrow address for a particular port and channel id. */
  escrowAddress = async (params: QueryEscrowAddressRequest): Promise<QueryEscrowAddressResponseSDKType> => {
    const endpoint = `ibc/apps/transfer/v1/channels/${params.channelId}/ports/${params.portId}/escrow_address`;
    return await this.req.get<QueryEscrowAddressResponseSDKType>(endpoint);
  };
  /* TotalEscrowForDenom returns the total amount of tokens in escrow based on the denom. */
  totalEscrowForDenom = async (params: QueryTotalEscrowForDenomRequest): Promise<QueryTotalEscrowForDenomResponseSDKType> => {
    const options: any = {
      params: {}
    };
    if (typeof params?.denom !== "undefined") {
      options.params.denom = params.denom;
    }
    const endpoint = `ibc/apps/transfer/v1/denoms/${params.denom}/total_escrow`;
    return await this.req.get<QueryTotalEscrowForDenomResponseSDKType>(endpoint, options);
  };
}