export type NetworkConfig = ExtNetworkConfig & LocalNetworkConfig;

export interface Network extends NetworkConfig {
  /** Get finder link */
  finder: (address: string, path?: string) => string;
}

export interface ExtNetworkConfig {
  name: string;
  chainID: string;
}

export interface LocalNetworkConfig {
  /** Contract Addresses JSON URL */
  contract: string;
  routeContract: string;
  /** Graphql server URL */
  mantle: string;
  stats: string;
  routerAddress: string;
  /** Fixed fee */
  fee: { gasPrice: number; amount: number };
}
