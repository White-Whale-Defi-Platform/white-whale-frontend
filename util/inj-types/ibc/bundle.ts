import * as _104 from "./applications/interchain_accounts/controller/v1/controller";
import * as _105 from "./applications/interchain_accounts/controller/v1/query";
import * as _106 from "./applications/interchain_accounts/controller/v1/tx";
import * as _107 from "./applications/interchain_accounts/genesis/v1/genesis";
import * as _108 from "./applications/interchain_accounts/host/v1/host";
import * as _109 from "./applications/interchain_accounts/host/v1/query";
import * as _110 from "./applications/interchain_accounts/v1/account";
import * as _111 from "./applications/interchain_accounts/v1/metadata";
import * as _112 from "./applications/interchain_accounts/v1/packet";
import * as _113 from "./applications/transfer/v1/authz";
import * as _114 from "./applications/transfer/v1/genesis";
import * as _115 from "./applications/transfer/v1/query";
import * as _116 from "./applications/transfer/v1/transfer";
import * as _117 from "./applications/transfer/v1/tx";
import * as _118 from "./applications/transfer/v2/packet";
import * as _119 from "./core/channel/v1/channel";
import * as _120 from "./core/channel/v1/genesis";
import * as _121 from "./core/channel/v1/query";
import * as _122 from "./core/channel/v1/tx";
import * as _123 from "./core/client/v1/client";
import * as _124 from "./core/client/v1/genesis";
import * as _125 from "./core/client/v1/query";
import * as _126 from "./core/client/v1/tx";
import * as _127 from "./core/commitment/v1/commitment";
import * as _128 from "./core/connection/v1/connection";
import * as _129 from "./core/connection/v1/genesis";
import * as _130 from "./core/connection/v1/query";
import * as _131 from "./core/connection/v1/tx";
import * as _132 from "./lightclients/localhost/v2/localhost";
import * as _133 from "./lightclients/solomachine/v2/solomachine";
import * as _134 from "./lightclients/solomachine/v3/solomachine";
import * as _135 from "./lightclients/tendermint/v1/tendermint";
import * as _237 from "./applications/interchain_accounts/controller/v1/tx.amino";
import * as _238 from "./applications/transfer/v1/tx.amino";
import * as _239 from "./core/channel/v1/tx.amino";
import * as _240 from "./core/client/v1/tx.amino";
import * as _241 from "./core/connection/v1/tx.amino";
import * as _242 from "./applications/interchain_accounts/controller/v1/tx.registry";
import * as _243 from "./applications/transfer/v1/tx.registry";
import * as _244 from "./core/channel/v1/tx.registry";
import * as _245 from "./core/client/v1/tx.registry";
import * as _246 from "./core/connection/v1/tx.registry";
import * as _247 from "./applications/interchain_accounts/controller/v1/query.lcd";
import * as _248 from "./applications/interchain_accounts/host/v1/query.lcd";
import * as _249 from "./applications/transfer/v1/query.lcd";
import * as _250 from "./core/channel/v1/query.lcd";
import * as _251 from "./core/client/v1/query.lcd";
import * as _252 from "./core/connection/v1/query.lcd";
import * as _253 from "./applications/interchain_accounts/controller/v1/query.rpc.Query";
import * as _254 from "./applications/interchain_accounts/host/v1/query.rpc.Query";
import * as _255 from "./applications/transfer/v1/query.rpc.Query";
import * as _256 from "./core/channel/v1/query.rpc.Query";
import * as _257 from "./core/client/v1/query.rpc.Query";
import * as _258 from "./core/connection/v1/query.rpc.Query";
import * as _259 from "./applications/interchain_accounts/controller/v1/tx.rpc.msg";
import * as _260 from "./applications/transfer/v1/tx.rpc.msg";
import * as _261 from "./core/channel/v1/tx.rpc.msg";
import * as _262 from "./core/client/v1/tx.rpc.msg";
import * as _263 from "./core/connection/v1/tx.rpc.msg";
import * as _271 from "./rpc.query";
import * as _272 from "./rpc.tx";
export namespace ibc {
  export namespace applications {
    export namespace interchain_accounts {
      export namespace controller {
        export const v1 = {
          ..._104,
          ..._105,
          ..._106,
          ..._237,
          ..._242,
          ..._247,
          ..._253,
          ..._259
        };
      }
      export namespace genesis {
        export const v1 = {
          ..._107
        };
      }
      export namespace host {
        export const v1 = {
          ..._108,
          ..._109,
          ..._248,
          ..._254
        };
      }
      export const v1 = {
        ..._110,
        ..._111,
        ..._112
      };
    }
    export namespace transfer {
      export const v1 = {
        ..._113,
        ..._114,
        ..._115,
        ..._116,
        ..._117,
        ..._238,
        ..._243,
        ..._249,
        ..._255,
        ..._260
      };
      export const v2 = {
        ..._118
      };
    }
  }
  export namespace core {
    export namespace channel {
      export const v1 = {
        ..._119,
        ..._120,
        ..._121,
        ..._122,
        ..._239,
        ..._244,
        ..._250,
        ..._256,
        ..._261
      };
    }
    export namespace client {
      export const v1 = {
        ..._123,
        ..._124,
        ..._125,
        ..._126,
        ..._240,
        ..._245,
        ..._251,
        ..._257,
        ..._262
      };
    }
    export namespace commitment {
      export const v1 = {
        ..._127
      };
    }
    export namespace connection {
      export const v1 = {
        ..._128,
        ..._129,
        ..._130,
        ..._131,
        ..._241,
        ..._246,
        ..._252,
        ..._258,
        ..._263
      };
    }
  }
  export namespace lightclients {
    export namespace localhost {
      export const v2 = {
        ..._132
      };
    }
    export namespace solomachine {
      export const v2 = {
        ..._133
      };
      export const v3 = {
        ..._134
      };
    }
    export namespace tendermint {
      export const v1 = {
        ..._135
      };
    }
  }
  export const ClientFactory = {
    ..._271,
    ..._272
  };
}