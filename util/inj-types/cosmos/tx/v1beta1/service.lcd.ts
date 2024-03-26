import { setPaginationParams } from "../../../helpers";
import { LCDClient } from "@cosmology/lcd";
import { GetTxRequest, GetTxResponseSDKType, GetTxsEventRequest, GetTxsEventResponseSDKType, GetBlockWithTxsRequest, GetBlockWithTxsResponseSDKType } from "./service";
export class LCDQueryClient {
  req: LCDClient;
  constructor({
    requestClient
  }: {
    requestClient: LCDClient;
  }) {
    this.req = requestClient;
  }
  /* GetTx fetches a tx by hash. */
  getTx = async (params: GetTxRequest): Promise<GetTxResponseSDKType> => {
    const endpoint = `cosmos/tx/v1beta1/txs/${params.hash}`;
    return await this.req.get<GetTxResponseSDKType>(endpoint);
  };
  /* GetTxsEvent fetches txs by event. */
  getTxsEvent = async (params: GetTxsEventRequest): Promise<GetTxsEventResponseSDKType> => {
    const options: any = {
      params: {}
    };
    if (typeof params?.events !== "undefined") {
      options.params.events = params.events;
    }
    if (typeof params?.pagination !== "undefined") {
      setPaginationParams(options, params.pagination);
    }
    if (typeof params?.orderBy !== "undefined") {
      options.params.order_by = params.orderBy;
    }
    if (typeof params?.page !== "undefined") {
      options.params.page = params.page;
    }
    if (typeof params?.limit !== "undefined") {
      options.params.limit = params.limit;
    }
    const endpoint = `cosmos/tx/v1beta1/txs`;
    return await this.req.get<GetTxsEventResponseSDKType>(endpoint, options);
  };
  /* GetBlockWithTxs fetches a block with decoded txs.
  
   Since: cosmos-sdk 0.45.2 */
  getBlockWithTxs = async (params: GetBlockWithTxsRequest): Promise<GetBlockWithTxsResponseSDKType> => {
    const options: any = {
      params: {}
    };
    if (typeof params?.pagination !== "undefined") {
      setPaginationParams(options, params.pagination);
    }
    const endpoint = `cosmos/tx/v1beta1/txs/block/${params.height}`;
    return await this.req.get<GetBlockWithTxsResponseSDKType>(endpoint, options);
  };
}