import { AssetInfo, CW20AssetInfo, NativeAssetInfo, Route } from "types";

export function isNativeAssetInfo(
  value: NativeAssetInfo | CW20AssetInfo,
): value is NativeAssetInfo {
  return value.hasOwnProperty("native_token");
}

export const isNativeToken = (token: string = ""): boolean => {
  return token.startsWith("u");
};

export const isNativeAsset = (info: AssetInfo): boolean => {
  return "native_token" in info;
};

export const toAssetInfo = (token: string): AssetInfo => {
  if (isNativeToken(token)) {
    return { native_token: { denom: token } };
  }

  return { token: { contract_addr: token } };
};

type ToAssetOpts = {
  amount: string;
  token: string;
};

export const toAsset = ({ amount, token }: ToAssetOpts) => {
  return {
    amount,
    info: toAssetInfo(token),
  };
};

export const findAsset = (infos: AssetInfo[], token: string) => {
  const asset = infos.find(info => {
    if (isNativeAssetInfo(info)) {
      return info.native_token.denom === token;
    }

    return info.token.contract_addr === token;
  });

  if (!asset) {
    return null;
  }

  return asset;
};

export const createAsset = (amount: string, token: string) => {
  const info = toAssetInfo(token);


  return {
    info,
    amount,
  };
};

export const getTokenDenom = (info: AssetInfo): string => {
  if (isNativeAssetInfo(info)) {
    return info.native_token.denom;
  }

  return info.token.contract_addr;
};

export const getTokenDenoms = (infos: AssetInfo[]): string[] => {
  return infos.map(info => getTokenDenom(info));
};
