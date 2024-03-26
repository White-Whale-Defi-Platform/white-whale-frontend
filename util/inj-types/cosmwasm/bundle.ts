import * as _96 from "./wasm/v1/authz";
import * as _97 from "./wasm/v1/genesis";
import * as _98 from "./wasm/v1/ibc";
import * as _99 from "./wasm/v1/proposal_legacy";
import * as _100 from "./wasm/v1/query";
import * as _101 from "./wasm/v1/tx";
import * as _102 from "./wasm/v1/types";
import * as _232 from "./wasm/v1/tx.amino";
import * as _233 from "./wasm/v1/tx.registry";
import * as _234 from "./wasm/v1/query.lcd";
import * as _235 from "./wasm/v1/query.rpc.Query";
import * as _236 from "./wasm/v1/tx.rpc.msg";
import * as _268 from "./rpc.query";
import * as _269 from "./rpc.tx";
export namespace cosmwasm {
  export namespace wasm {
    export const v1 = {
      ..._96,
      ..._97,
      ..._98,
      ..._99,
      ..._100,
      ..._101,
      ..._102,
      ..._232,
      ..._233,
      ..._234,
      ..._235,
      ..._236
    };
  }
  export const ClientFactory = {
    ..._268,
    ..._269
  };
}