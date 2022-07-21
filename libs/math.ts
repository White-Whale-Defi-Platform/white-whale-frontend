import num from "bignumber.js";
import { isNil } from "ramda";

export const plus = (a?: num.Value, b?: num.Value): string =>
  new num(a || 0).plus(b || 0).toString();

export const minus = (a?: num.Value, b?: num.Value): string =>
  new num(a || 0).minus(b || 0).toString();

export const times = (a?: num.Value, b?: num.Value): string =>
  new num(a || 0).times(b || 0).toString();

export const div = (a?: num.Value, b?: num.Value): string =>
  new num(a || 0).div(b || 1).toString();

export const pow = (a: num.Value, b: num.Value): string =>
  new num(a).pow(b).toString();

export const sum = (array: num.Value[]): string =>
  array.length ? num.sum.apply(null, array.filter(isFinite)).toString() : "0";

export const min = (array: num.Value[]): string =>
  num.min.apply(null, array.filter(isFinite)).toString();

export const max = (array: num.Value[]): string =>
  num.max.apply(null, array.filter(isFinite)).toString();

export const ceil = (n: num.Value): string =>
  new num(n).integerValue(num.ROUND_CEIL).toString();

export const floor = (n: num.Value): string =>
  new num(n).integerValue(num.ROUND_FLOOR).toString();

export const abs = (n: num.Value): string => new num(n).abs().toString();

/* format */
export const number = (n: num.Value): number => new num(n).toNumber();

/* boolean */
export const gt = (a: num.Value, b: num.Value): boolean => new num(a).gt(b);
export const lt = (a: num.Value, b: num.Value): boolean => new num(a).lt(b);
export const gte = (a: num.Value, b: num.Value): boolean => new num(a).gte(b);
export const lte = (a: num.Value, b: num.Value): boolean => new num(a).lte(b);

export const isFinite = (n?: num.Value): boolean =>
  !isNil(n) && new num(n).isFinite();

export const isInteger = (n?: num.Value): boolean =>
  !isNil(n) && new num(n).isInteger();
