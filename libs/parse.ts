import BigNumber from "bignumber.js";
import numeral from "numeral";
// import { SMALLEST } from "constants/constants";
const SMALLEST  = 1e6;

interface FormatConfig {
  integer?: boolean;
  dp?: number;
}

BigNumber.config({ EXPONENTIAL_AT: [-18, 20] });

type Formatter<T = string> = (
  amount?: string,
  symbol?: string,
  config?: FormatConfig
) => T;

const rm = BigNumber.ROUND_DOWN;

export const dp = (symbol?: string) => {
  if (!symbol || lookupSymbol(symbol) === "UST") {
    return 2;
  }

  return 6;
};

export const toNumber = (value = "0") => {
  return new BigNumber(value).toNumber();
};

export const lookup: Formatter = (amount = "0", symbol, config) => {
  let value = new BigNumber(amount);

  if (symbol) {
    value = new BigNumber(amount).div(SMALLEST).dp(6, rm);
  }

  return value
    .dp(
      config?.dp ??
        (config?.integer ? 0 : value.gte(SMALLEST) ? 2 : dp(symbol)),
      rm
    )
    .toString();
};

export const lookupSymbol = (symbol?: string) => {
  if (symbol === "uluna") {
    return "Luna";
  }

  if (symbol?.startsWith("u")) {
    return symbol.slice(1, 3).toUpperCase() + "T";
  }

  return "";
};

export const isBig: Formatter<boolean> = (amount, symbol) => {
  return new BigNumber(lookup(amount, symbol)).gte(1e6);
};

export const format: Formatter = (amount, symbol, config) => {
  const value = new BigNumber(lookup(amount, symbol, config));
  const decimals = Array.from({ length: dp(symbol) }, () => "0").join("");
  let formatted = numeral(value).format(
    config?.integer ? "0,0" : "0,0." + decimals
  );

  if (isBig(amount, symbol)) {
    formatted = numeral(value.div(1e4).integerValue(rm).times(1e4)).format(
      "0,0.00a"
    );
  }

  return formatted.toUpperCase();
};

export const formatAsset: Formatter = (amount, symbol, config) => {
  if (!symbol) {
    return "";
  }

  return `${lookupSymbol(symbol)} ${format(amount, symbol, config)}`;
};

export const toAmount = (value: string | null) => {
  if (!value) {
    return null;
  }

  return new BigNumber(value).times(SMALLEST).integerValue().toString();
};

export const decimal = (value = "0", dp = 6) =>
  new BigNumber(value).decimalPlaces(dp, rm).toString();

export const toFixed = (value = "0", dp = 6) =>
  new BigNumber(value).toFixed(dp, rm).toString();

export const formatRate = (value: string | number | null) => {
  if (!value) {
    return "0";
  }

  return new BigNumber(value).times(100).toFixed(2);
};
