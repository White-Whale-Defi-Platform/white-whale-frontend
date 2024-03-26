import { BinaryReader, BinaryWriter } from "../../../binary";
import { DeepPartial, bytesFromBase64, base64FromBytes } from "../../../helpers";
/** EventSetBalance is an event that tracks the latest bank balance. */
export interface EventSetBalances {
  balanceUpdates: BalanceUpdate[];
}
export interface EventSetBalancesProtoMsg {
  typeUrl: "/cosmos.bank.v1beta1.EventSetBalances";
  value: Uint8Array;
}
/** EventSetBalance is an event that tracks the latest bank balance. */
export interface EventSetBalancesAmino {
  balance_updates?: BalanceUpdateAmino[];
}
export interface EventSetBalancesAminoMsg {
  type: "cosmos-sdk/EventSetBalances";
  value: EventSetBalancesAmino;
}
/** EventSetBalance is an event that tracks the latest bank balance. */
export interface EventSetBalancesSDKType {
  balance_updates: BalanceUpdateSDKType[];
}
/** BalanceUpdate contains a given address's latest balance */
export interface BalanceUpdate {
  addr: Uint8Array;
  denom: Uint8Array;
  /** the latest amount */
  amt: string;
}
export interface BalanceUpdateProtoMsg {
  typeUrl: "/cosmos.bank.v1beta1.BalanceUpdate";
  value: Uint8Array;
}
/** BalanceUpdate contains a given address's latest balance */
export interface BalanceUpdateAmino {
  addr?: string;
  denom?: string;
  /** the latest amount */
  amt: string;
}
export interface BalanceUpdateAminoMsg {
  type: "cosmos-sdk/BalanceUpdate";
  value: BalanceUpdateAmino;
}
/** BalanceUpdate contains a given address's latest balance */
export interface BalanceUpdateSDKType {
  addr: Uint8Array;
  denom: Uint8Array;
  amt: string;
}
function createBaseEventSetBalances(): EventSetBalances {
  return {
    balanceUpdates: []
  };
}
export const EventSetBalances = {
  typeUrl: "/cosmos.bank.v1beta1.EventSetBalances",
  aminoType: "cosmos-sdk/EventSetBalances",
  encode(message: EventSetBalances, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    for (const v of message.balanceUpdates) {
      BalanceUpdate.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): EventSetBalances {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEventSetBalances();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.balanceUpdates.push(BalanceUpdate.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: DeepPartial<EventSetBalances>): EventSetBalances {
    const message = createBaseEventSetBalances();
    message.balanceUpdates = object.balanceUpdates?.map(e => BalanceUpdate.fromPartial(e)) || [];
    return message;
  },
  fromAmino(object: EventSetBalancesAmino): EventSetBalances {
    const message = createBaseEventSetBalances();
    message.balanceUpdates = object.balance_updates?.map(e => BalanceUpdate.fromAmino(e)) || [];
    return message;
  },
  toAmino(message: EventSetBalances): EventSetBalancesAmino {
    const obj: any = {};
    if (message.balanceUpdates) {
      obj.balance_updates = message.balanceUpdates.map(e => e ? BalanceUpdate.toAmino(e) : undefined);
    } else {
      obj.balance_updates = message.balanceUpdates;
    }
    return obj;
  },
  fromAminoMsg(object: EventSetBalancesAminoMsg): EventSetBalances {
    return EventSetBalances.fromAmino(object.value);
  },
  toAminoMsg(message: EventSetBalances): EventSetBalancesAminoMsg {
    return {
      type: "cosmos-sdk/EventSetBalances",
      value: EventSetBalances.toAmino(message)
    };
  },
  fromProtoMsg(message: EventSetBalancesProtoMsg): EventSetBalances {
    return EventSetBalances.decode(message.value);
  },
  toProto(message: EventSetBalances): Uint8Array {
    return EventSetBalances.encode(message).finish();
  },
  toProtoMsg(message: EventSetBalances): EventSetBalancesProtoMsg {
    return {
      typeUrl: "/cosmos.bank.v1beta1.EventSetBalances",
      value: EventSetBalances.encode(message).finish()
    };
  }
};
function createBaseBalanceUpdate(): BalanceUpdate {
  return {
    addr: new Uint8Array(),
    denom: new Uint8Array(),
    amt: ""
  };
}
export const BalanceUpdate = {
  typeUrl: "/cosmos.bank.v1beta1.BalanceUpdate",
  aminoType: "cosmos-sdk/BalanceUpdate",
  encode(message: BalanceUpdate, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.addr.length !== 0) {
      writer.uint32(10).bytes(message.addr);
    }
    if (message.denom.length !== 0) {
      writer.uint32(18).bytes(message.denom);
    }
    if (message.amt !== "") {
      writer.uint32(26).string(message.amt);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): BalanceUpdate {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseBalanceUpdate();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.addr = reader.bytes();
          break;
        case 2:
          message.denom = reader.bytes();
          break;
        case 3:
          message.amt = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: DeepPartial<BalanceUpdate>): BalanceUpdate {
    const message = createBaseBalanceUpdate();
    message.addr = object.addr ?? new Uint8Array();
    message.denom = object.denom ?? new Uint8Array();
    message.amt = object.amt ?? "";
    return message;
  },
  fromAmino(object: BalanceUpdateAmino): BalanceUpdate {
    const message = createBaseBalanceUpdate();
    if (object.addr !== undefined && object.addr !== null) {
      message.addr = bytesFromBase64(object.addr);
    }
    if (object.denom !== undefined && object.denom !== null) {
      message.denom = bytesFromBase64(object.denom);
    }
    if (object.amt !== undefined && object.amt !== null) {
      message.amt = object.amt;
    }
    return message;
  },
  toAmino(message: BalanceUpdate): BalanceUpdateAmino {
    const obj: any = {};
    obj.addr = message.addr ? base64FromBytes(message.addr) : undefined;
    obj.denom = message.denom ? base64FromBytes(message.denom) : undefined;
    obj.amt = message.amt ?? "";
    return obj;
  },
  fromAminoMsg(object: BalanceUpdateAminoMsg): BalanceUpdate {
    return BalanceUpdate.fromAmino(object.value);
  },
  toAminoMsg(message: BalanceUpdate): BalanceUpdateAminoMsg {
    return {
      type: "cosmos-sdk/BalanceUpdate",
      value: BalanceUpdate.toAmino(message)
    };
  },
  fromProtoMsg(message: BalanceUpdateProtoMsg): BalanceUpdate {
    return BalanceUpdate.decode(message.value);
  },
  toProto(message: BalanceUpdate): Uint8Array {
    return BalanceUpdate.encode(message).finish();
  },
  toProtoMsg(message: BalanceUpdate): BalanceUpdateProtoMsg {
    return {
      typeUrl: "/cosmos.bank.v1beta1.BalanceUpdate",
      value: BalanceUpdate.encode(message).finish()
    };
  }
};