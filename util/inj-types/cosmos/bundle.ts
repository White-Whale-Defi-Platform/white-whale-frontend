import * as _2 from "./app/runtime/v1alpha1/module";
import * as _3 from "./auth/module/v1/module";
import * as _4 from "./auth/v1beta1/auth";
import * as _5 from "./auth/v1beta1/genesis";
import * as _6 from "./auth/v1beta1/query";
import * as _7 from "./auth/v1beta1/tx";
import * as _8 from "./authz/module/v1/module";
import * as _9 from "./authz/v1beta1/authz";
import * as _10 from "./authz/v1beta1/event";
import * as _11 from "./authz/v1beta1/genesis";
import * as _12 from "./authz/v1beta1/query";
import * as _13 from "./authz/v1beta1/tx";
import * as _14 from "./bank/module/v1/module";
import * as _15 from "./bank/v1beta1/authz";
import * as _16 from "./bank/v1beta1/bank";
import * as _17 from "./bank/v1beta1/events";
import * as _18 from "./bank/v1beta1/genesis";
import * as _19 from "./bank/v1beta1/query";
import * as _20 from "./bank/v1beta1/tx";
import * as _21 from "./base/abci/v1beta1/abci";
import * as _22 from "./base/node/v1beta1/query";
import * as _23 from "./base/query/v1beta1/pagination";
import * as _24 from "./base/reflection/v2alpha1/reflection";
import * as _25 from "./base/v1beta1/coin";
import * as _26 from "./capability/module/v1/module";
import * as _27 from "./consensus/module/v1/module";
import * as _28 from "./consensus/v1/query";
import * as _29 from "./consensus/v1/tx";
import * as _30 from "./crisis/module/v1/module";
import * as _31 from "./crypto/ed25519/keys";
import * as _32 from "./crypto/hd/v1/hd";
import * as _33 from "./crypto/keyring/v1/record";
import * as _34 from "./crypto/multisig/keys";
import * as _35 from "./crypto/secp256k1/keys";
import * as _36 from "./crypto/secp256r1/keys";
import * as _37 from "./distribution/module/v1/module";
import * as _38 from "./distribution/v1beta1/distribution";
import * as _39 from "./distribution/v1beta1/genesis";
import * as _40 from "./distribution/v1beta1/query";
import * as _41 from "./distribution/v1beta1/tx";
import * as _42 from "./evidence/module/v1/module";
import * as _43 from "./feegrant/module/v1/module";
import * as _44 from "./feegrant/v1beta1/feegrant";
import * as _45 from "./feegrant/v1beta1/genesis";
import * as _46 from "./feegrant/v1beta1/query";
import * as _47 from "./feegrant/v1beta1/tx";
import * as _48 from "./genutil/module/v1/module";
import * as _49 from "./gov/module/v1/module";
import * as _50 from "./gov/v1/genesis";
import * as _51 from "./gov/v1/gov";
import * as _52 from "./gov/v1/query";
import * as _53 from "./gov/v1/tx";
import * as _54 from "./gov/v1beta1/genesis";
import * as _55 from "./gov/v1beta1/gov";
import * as _56 from "./gov/v1beta1/query";
import * as _57 from "./gov/v1beta1/tx";
import * as _58 from "./group/module/v1/module";
import * as _59 from "./group/v1/events";
import * as _60 from "./group/v1/genesis";
import * as _61 from "./group/v1/query";
import * as _62 from "./group/v1/tx";
import * as _63 from "./group/v1/types";
import * as _64 from "./ics23/v1/proofs";
import * as _65 from "./mint/module/v1/module";
import * as _66 from "./mint/v1beta1/genesis";
import * as _67 from "./mint/v1beta1/mint";
import * as _68 from "./mint/v1beta1/query";
import * as _69 from "./mint/v1beta1/tx";
import * as _70 from "./nft/module/v1/module";
import * as _71 from "./orm/module/v1alpha1/module";
import * as _72 from "./orm/query/v1alpha1/query";
import * as _73 from "./params/module/v1/module";
import * as _74 from "./params/v1beta1/params";
import * as _75 from "./params/v1beta1/query";
import * as _76 from "./query/v1/query";
import * as _77 from "./reflection/v1/reflection";
import * as _78 from "./slashing/module/v1/module";
import * as _79 from "./staking/module/v1/module";
import * as _80 from "./staking/v1beta1/authz";
import * as _81 from "./staking/v1beta1/genesis";
import * as _82 from "./staking/v1beta1/query";
import * as _83 from "./staking/v1beta1/staking";
import * as _84 from "./staking/v1beta1/tx";
import * as _85 from "./tx/config/v1/config";
import * as _86 from "./tx/signing/v1beta1/signing";
import * as _87 from "./tx/v1beta1/service";
import * as _88 from "./tx/v1beta1/tx";
import * as _89 from "./upgrade/module/v1/module";
import * as _90 from "./upgrade/v1beta1/query";
import * as _91 from "./upgrade/v1beta1/tx";
import * as _92 from "./upgrade/v1beta1/upgrade";
import * as _93 from "./vesting/module/v1/module";
import * as _94 from "./vesting/v1beta1/tx";
import * as _95 from "./vesting/v1beta1/vesting";
import * as _164 from "./auth/v1beta1/tx.amino";
import * as _165 from "./bank/v1beta1/tx.amino";
import * as _166 from "./consensus/v1/tx.amino";
import * as _167 from "./distribution/v1beta1/tx.amino";
import * as _168 from "./feegrant/v1beta1/tx.amino";
import * as _169 from "./gov/v1/tx.amino";
import * as _170 from "./gov/v1beta1/tx.amino";
import * as _171 from "./group/v1/tx.amino";
import * as _172 from "./mint/v1beta1/tx.amino";
import * as _173 from "./staking/v1beta1/tx.amino";
import * as _174 from "./upgrade/v1beta1/tx.amino";
import * as _175 from "./vesting/v1beta1/tx.amino";
import * as _176 from "./auth/v1beta1/tx.registry";
import * as _177 from "./bank/v1beta1/tx.registry";
import * as _178 from "./consensus/v1/tx.registry";
import * as _179 from "./distribution/v1beta1/tx.registry";
import * as _180 from "./feegrant/v1beta1/tx.registry";
import * as _181 from "./gov/v1/tx.registry";
import * as _182 from "./gov/v1beta1/tx.registry";
import * as _183 from "./group/v1/tx.registry";
import * as _184 from "./mint/v1beta1/tx.registry";
import * as _185 from "./staking/v1beta1/tx.registry";
import * as _186 from "./upgrade/v1beta1/tx.registry";
import * as _187 from "./vesting/v1beta1/tx.registry";
import * as _188 from "./auth/v1beta1/query.lcd";
import * as _189 from "./authz/v1beta1/query.lcd";
import * as _190 from "./bank/v1beta1/query.lcd";
import * as _191 from "./base/node/v1beta1/query.lcd";
import * as _192 from "./consensus/v1/query.lcd";
import * as _193 from "./distribution/v1beta1/query.lcd";
import * as _194 from "./feegrant/v1beta1/query.lcd";
import * as _195 from "./gov/v1/query.lcd";
import * as _196 from "./gov/v1beta1/query.lcd";
import * as _197 from "./group/v1/query.lcd";
import * as _198 from "./mint/v1beta1/query.lcd";
import * as _199 from "./params/v1beta1/query.lcd";
import * as _200 from "./staking/v1beta1/query.lcd";
import * as _201 from "./tx/v1beta1/service.lcd";
import * as _202 from "./upgrade/v1beta1/query.lcd";
import * as _203 from "./auth/v1beta1/query.rpc.Query";
import * as _204 from "./authz/v1beta1/query.rpc.Query";
import * as _205 from "./bank/v1beta1/query.rpc.Query";
import * as _206 from "./base/node/v1beta1/query.rpc.Service";
import * as _207 from "./consensus/v1/query.rpc.Query";
import * as _208 from "./distribution/v1beta1/query.rpc.Query";
import * as _209 from "./feegrant/v1beta1/query.rpc.Query";
import * as _210 from "./gov/v1/query.rpc.Query";
import * as _211 from "./gov/v1beta1/query.rpc.Query";
import * as _212 from "./group/v1/query.rpc.Query";
import * as _213 from "./mint/v1beta1/query.rpc.Query";
import * as _214 from "./orm/query/v1alpha1/query.rpc.Query";
import * as _215 from "./params/v1beta1/query.rpc.Query";
import * as _216 from "./staking/v1beta1/query.rpc.Query";
import * as _217 from "./tx/v1beta1/service.rpc.Service";
import * as _218 from "./upgrade/v1beta1/query.rpc.Query";
import * as _219 from "./auth/v1beta1/tx.rpc.msg";
import * as _220 from "./authz/v1beta1/tx.rpc.msg";
import * as _221 from "./bank/v1beta1/tx.rpc.msg";
import * as _222 from "./consensus/v1/tx.rpc.msg";
import * as _223 from "./distribution/v1beta1/tx.rpc.msg";
import * as _224 from "./feegrant/v1beta1/tx.rpc.msg";
import * as _225 from "./gov/v1/tx.rpc.msg";
import * as _226 from "./gov/v1beta1/tx.rpc.msg";
import * as _227 from "./group/v1/tx.rpc.msg";
import * as _228 from "./mint/v1beta1/tx.rpc.msg";
import * as _229 from "./staking/v1beta1/tx.rpc.msg";
import * as _230 from "./upgrade/v1beta1/tx.rpc.msg";
import * as _231 from "./vesting/v1beta1/tx.rpc.msg";
import * as _265 from "./rpc.query";
import * as _266 from "./rpc.tx";
export namespace cosmos {
  export namespace app {
    export namespace runtime {
      export const v1alpha1 = {
        ..._2
      };
    }
  }
  export namespace auth {
    export namespace module {
      export const v1 = {
        ..._3
      };
    }
    export const v1beta1 = {
      ..._4,
      ..._5,
      ..._6,
      ..._7,
      ..._164,
      ..._176,
      ..._188,
      ..._203,
      ..._219
    };
  }
  export namespace authz {
    export namespace module {
      export const v1 = {
        ..._8
      };
    }
    export const v1beta1 = {
      ..._9,
      ..._10,
      ..._11,
      ..._12,
      ..._13,
      ..._189,
      ..._204,
      ..._220
    };
  }
  export namespace bank {
    export namespace module {
      export const v1 = {
        ..._14
      };
    }
    export const v1beta1 = {
      ..._15,
      ..._16,
      ..._17,
      ..._18,
      ..._19,
      ..._20,
      ..._165,
      ..._177,
      ..._190,
      ..._205,
      ..._221
    };
  }
  export namespace base {
    export namespace abci {
      export const v1beta1 = {
        ..._21
      };
    }
    export namespace node {
      export const v1beta1 = {
        ..._22,
        ..._191,
        ..._206
      };
    }
    export namespace query {
      export const v1beta1 = {
        ..._23
      };
    }
    export namespace reflection {
      export const v2alpha1 = {
        ..._24
      };
    }
    export const v1beta1 = {
      ..._25
    };
  }
  export namespace capability {
    export namespace module {
      export const v1 = {
        ..._26
      };
    }
  }
  export namespace consensus {
    export namespace module {
      export const v1 = {
        ..._27
      };
    }
    export const v1 = {
      ..._28,
      ..._29,
      ..._166,
      ..._178,
      ..._192,
      ..._207,
      ..._222
    };
  }
  export namespace crisis {
    export namespace module {
      export const v1 = {
        ..._30
      };
    }
  }
  export namespace crypto {
    export const ed25519 = {
      ..._31
    };
    export namespace hd {
      export const v1 = {
        ..._32
      };
    }
    export namespace keyring {
      export const v1 = {
        ..._33
      };
    }
    export const multisig = {
      ..._34
    };
    export const secp256k1 = {
      ..._35
    };
    export const secp256r1 = {
      ..._36
    };
  }
  export namespace distribution {
    export namespace module {
      export const v1 = {
        ..._37
      };
    }
    export const v1beta1 = {
      ..._38,
      ..._39,
      ..._40,
      ..._41,
      ..._167,
      ..._179,
      ..._193,
      ..._208,
      ..._223
    };
  }
  export namespace evidence {
    export namespace module {
      export const v1 = {
        ..._42
      };
    }
  }
  export namespace feegrant {
    export namespace module {
      export const v1 = {
        ..._43
      };
    }
    export const v1beta1 = {
      ..._44,
      ..._45,
      ..._46,
      ..._47,
      ..._168,
      ..._180,
      ..._194,
      ..._209,
      ..._224
    };
  }
  export namespace genutil {
    export namespace module {
      export const v1 = {
        ..._48
      };
    }
  }
  export namespace gov {
    export namespace module {
      export const v1 = {
        ..._49
      };
    }
    export const v1 = {
      ..._50,
      ..._51,
      ..._52,
      ..._53,
      ..._169,
      ..._181,
      ..._195,
      ..._210,
      ..._225
    };
    export const v1beta1 = {
      ..._54,
      ..._55,
      ..._56,
      ..._57,
      ..._170,
      ..._182,
      ..._196,
      ..._211,
      ..._226
    };
  }
  export namespace group {
    export namespace module {
      export const v1 = {
        ..._58
      };
    }
    export const v1 = {
      ..._59,
      ..._60,
      ..._61,
      ..._62,
      ..._63,
      ..._171,
      ..._183,
      ..._197,
      ..._212,
      ..._227
    };
  }
  export namespace ics23 {
    export const v1 = {
      ..._64
    };
  }
  export namespace mint {
    export namespace module {
      export const v1 = {
        ..._65
      };
    }
    export const v1beta1 = {
      ..._66,
      ..._67,
      ..._68,
      ..._69,
      ..._172,
      ..._184,
      ..._198,
      ..._213,
      ..._228
    };
  }
  export namespace nft {
    export namespace module {
      export const v1 = {
        ..._70
      };
    }
  }
  export namespace orm {
    export namespace module {
      export const v1alpha1 = {
        ..._71
      };
    }
    export namespace query {
      export const v1alpha1 = {
        ..._72,
        ..._214
      };
    }
  }
  export namespace params {
    export namespace module {
      export const v1 = {
        ..._73
      };
    }
    export const v1beta1 = {
      ..._74,
      ..._75,
      ..._199,
      ..._215
    };
  }
  export namespace query {
    export const v1 = {
      ..._76
    };
  }
  export namespace reflection {
    export const v1 = {
      ..._77
    };
  }
  export namespace slashing {
    export namespace module {
      export const v1 = {
        ..._78
      };
    }
  }
  export namespace staking {
    export namespace module {
      export const v1 = {
        ..._79
      };
    }
    export const v1beta1 = {
      ..._80,
      ..._81,
      ..._82,
      ..._83,
      ..._84,
      ..._173,
      ..._185,
      ..._200,
      ..._216,
      ..._229
    };
  }
  export namespace tx {
    export namespace config {
      export const v1 = {
        ..._85
      };
    }
    export namespace signing {
      export const v1beta1 = {
        ..._86
      };
    }
    export const v1beta1 = {
      ..._87,
      ..._88,
      ..._201,
      ..._217
    };
  }
  export namespace upgrade {
    export namespace module {
      export const v1 = {
        ..._89
      };
    }
    export const v1beta1 = {
      ..._90,
      ..._91,
      ..._92,
      ..._174,
      ..._186,
      ..._202,
      ..._218,
      ..._230
    };
  }
  export namespace vesting {
    export namespace module {
      export const v1 = {
        ..._93
      };
    }
    export const v1beta1 = {
      ..._94,
      ..._95,
      ..._175,
      ..._187,
      ..._231
    };
  }
  export const ClientFactory = {
    ..._265,
    ..._266
  };
}