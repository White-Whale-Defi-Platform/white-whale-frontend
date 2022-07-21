import BigNumber from "bignumber.js";
import numeral from "numeral";
import { get, has, isNaN } from "lodash";

import { Pool } from "types/common";

export const isAssetNative = (info) => {
  return has(info, "native_token");
};

export const getAssetDenom = (info) => {
  if (isAssetNative(info)) {
    return get(info, "native_token.denom");
  }

  return get(info, "token.contract_addr");
};

export const findAssetInPool = (pool: Pool, asset: string) => {
  return pool.assets.find((a) => {
    return getAssetDenom(a.info) === asset;
  });
};

export const fromTerraAmount = (value: string, format = "0.0a") => {
  if (value == null || isNaN(value)) {
    return "0.00";
  }

  return numeral(value).divide("1000000").format(format);
};

export const getAmountsInPool = (pool: Pool) => {
  return pool.assets.reduce(
    (prev, a) => {
      const key = getAssetDenom(a.info) === "uusd" ? "uusd" : "other";

      return {
        ...prev,
        [key]: a.amount,
      };
    },
    { uusd: "0", other: "0" }
  );
};
