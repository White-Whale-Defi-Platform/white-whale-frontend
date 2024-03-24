import { setPaginationParams } from "../../../../helpers";
import { LCDClient } from "@cosmology/lcd";
import { QueryClientStateRequest, QueryClientStateResponseSDKType, QueryClientStatesRequest, QueryClientStatesResponseSDKType, QueryConsensusStateRequest, QueryConsensusStateResponseSDKType, QueryConsensusStatesRequest, QueryConsensusStatesResponseSDKType, QueryConsensusStateHeightsRequest, QueryConsensusStateHeightsResponseSDKType, QueryClientStatusRequest, QueryClientStatusResponseSDKType, QueryClientParamsRequest, QueryClientParamsResponseSDKType, QueryUpgradedClientStateRequest, QueryUpgradedClientStateResponseSDKType, QueryUpgradedConsensusStateRequest, QueryUpgradedConsensusStateResponseSDKType } from "./query";
export class LCDQueryClient {
  req: LCDClient;
  constructor({
    requestClient
  }: {
    requestClient: LCDClient;
  }) {
    this.req = requestClient;
  }
  /* ClientState queries an IBC light client. */
  clientState = async (params: QueryClientStateRequest): Promise<QueryClientStateResponseSDKType> => {
    const endpoint = `ibc/core/client/v1/client_states/${params.clientId}`;
    return await this.req.get<QueryClientStateResponseSDKType>(endpoint);
  };
  /* ClientStates queries all the IBC light clients of a chain. */
  clientStates = async (params: QueryClientStatesRequest = {
    pagination: undefined
  }): Promise<QueryClientStatesResponseSDKType> => {
    const options: any = {
      params: {}
    };
    if (typeof params?.pagination !== "undefined") {
      setPaginationParams(options, params.pagination);
    }
    const endpoint = `ibc/core/client/v1/client_states`;
    return await this.req.get<QueryClientStatesResponseSDKType>(endpoint, options);
  };
  /* ConsensusState queries a consensus state associated with a client state at
   a given height. */
  consensusState = async (params: QueryConsensusStateRequest): Promise<QueryConsensusStateResponseSDKType> => {
    const options: any = {
      params: {}
    };
    if (typeof params?.latestHeight !== "undefined") {
      options.params.latest_height = params.latestHeight;
    }
    const endpoint = `ibc/core/client/v1/consensus_states/${params.clientId}/revision/${params.revisionNumber}/height/${params.revisionHeight}`;
    return await this.req.get<QueryConsensusStateResponseSDKType>(endpoint, options);
  };
  /* ConsensusStates queries all the consensus state associated with a given
   client. */
  consensusStates = async (params: QueryConsensusStatesRequest): Promise<QueryConsensusStatesResponseSDKType> => {
    const options: any = {
      params: {}
    };
    if (typeof params?.pagination !== "undefined") {
      setPaginationParams(options, params.pagination);
    }
    const endpoint = `ibc/core/client/v1/consensus_states/${params.clientId}`;
    return await this.req.get<QueryConsensusStatesResponseSDKType>(endpoint, options);
  };
  /* ConsensusStateHeights queries the height of every consensus states associated with a given client. */
  consensusStateHeights = async (params: QueryConsensusStateHeightsRequest): Promise<QueryConsensusStateHeightsResponseSDKType> => {
    const options: any = {
      params: {}
    };
    if (typeof params?.pagination !== "undefined") {
      setPaginationParams(options, params.pagination);
    }
    const endpoint = `ibc/core/client/v1/consensus_states/${params.clientId}/heights`;
    return await this.req.get<QueryConsensusStateHeightsResponseSDKType>(endpoint, options);
  };
  /* Status queries the status of an IBC client. */
  clientStatus = async (params: QueryClientStatusRequest): Promise<QueryClientStatusResponseSDKType> => {
    const endpoint = `ibc/core/client/v1/client_status/${params.clientId}`;
    return await this.req.get<QueryClientStatusResponseSDKType>(endpoint);
  };
  /* ClientParams queries all parameters of the ibc client submodule. */
  clientParams = async (_params: QueryClientParamsRequest = {}): Promise<QueryClientParamsResponseSDKType> => {
    const endpoint = `ibc/core/client/v1/params`;
    return await this.req.get<QueryClientParamsResponseSDKType>(endpoint);
  };
  /* UpgradedClientState queries an Upgraded IBC light client. */
  upgradedClientState = async (_params: QueryUpgradedClientStateRequest = {}): Promise<QueryUpgradedClientStateResponseSDKType> => {
    const endpoint = `ibc/core/client/v1/upgraded_client_states`;
    return await this.req.get<QueryUpgradedClientStateResponseSDKType>(endpoint);
  };
  /* UpgradedConsensusState queries an Upgraded IBC consensus state. */
  upgradedConsensusState = async (_params: QueryUpgradedConsensusStateRequest = {}): Promise<QueryUpgradedConsensusStateResponseSDKType> => {
    const endpoint = `ibc/core/client/v1/upgraded_consensus_states`;
    return await this.req.get<QueryUpgradedConsensusStateResponseSDKType>(endpoint);
  };
}