import { NetAddress, NetAddressAmino, NetAddressSDKType } from "./types";
import { BinaryReader, BinaryWriter } from "../../binary";
import { DeepPartial } from "../../helpers";
export interface PexRequest {}
export interface PexRequestProtoMsg {
  typeUrl: "/tendermint.p2p.PexRequest";
  value: Uint8Array;
}
export interface PexRequestAmino {}
export interface PexRequestAminoMsg {
  type: "/tendermint.p2p.PexRequest";
  value: PexRequestAmino;
}
export interface PexRequestSDKType {}
export interface PexAddrs {
  addrs: NetAddress[];
}
export interface PexAddrsProtoMsg {
  typeUrl: "/tendermint.p2p.PexAddrs";
  value: Uint8Array;
}
export interface PexAddrsAmino {
  addrs?: NetAddressAmino[];
}
export interface PexAddrsAminoMsg {
  type: "/tendermint.p2p.PexAddrs";
  value: PexAddrsAmino;
}
export interface PexAddrsSDKType {
  addrs: NetAddressSDKType[];
}
export interface Message {
  pexRequest?: PexRequest;
  pexAddrs?: PexAddrs;
}
export interface MessageProtoMsg {
  typeUrl: "/tendermint.p2p.Message";
  value: Uint8Array;
}
export interface MessageAmino {
  pex_request?: PexRequestAmino;
  pex_addrs?: PexAddrsAmino;
}
export interface MessageAminoMsg {
  type: "/tendermint.p2p.Message";
  value: MessageAmino;
}
export interface MessageSDKType {
  pex_request?: PexRequestSDKType;
  pex_addrs?: PexAddrsSDKType;
}
function createBasePexRequest(): PexRequest {
  return {};
}
export const PexRequest = {
  typeUrl: "/tendermint.p2p.PexRequest",
  encode(_: PexRequest, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): PexRequest {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePexRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(_: DeepPartial<PexRequest>): PexRequest {
    const message = createBasePexRequest();
    return message;
  },
  fromAmino(_: PexRequestAmino): PexRequest {
    const message = createBasePexRequest();
    return message;
  },
  toAmino(_: PexRequest): PexRequestAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(object: PexRequestAminoMsg): PexRequest {
    return PexRequest.fromAmino(object.value);
  },
  fromProtoMsg(message: PexRequestProtoMsg): PexRequest {
    return PexRequest.decode(message.value);
  },
  toProto(message: PexRequest): Uint8Array {
    return PexRequest.encode(message).finish();
  },
  toProtoMsg(message: PexRequest): PexRequestProtoMsg {
    return {
      typeUrl: "/tendermint.p2p.PexRequest",
      value: PexRequest.encode(message).finish()
    };
  }
};
function createBasePexAddrs(): PexAddrs {
  return {
    addrs: []
  };
}
export const PexAddrs = {
  typeUrl: "/tendermint.p2p.PexAddrs",
  encode(message: PexAddrs, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    for (const v of message.addrs) {
      NetAddress.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): PexAddrs {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePexAddrs();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.addrs.push(NetAddress.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: DeepPartial<PexAddrs>): PexAddrs {
    const message = createBasePexAddrs();
    message.addrs = object.addrs?.map(e => NetAddress.fromPartial(e)) || [];
    return message;
  },
  fromAmino(object: PexAddrsAmino): PexAddrs {
    const message = createBasePexAddrs();
    message.addrs = object.addrs?.map(e => NetAddress.fromAmino(e)) || [];
    return message;
  },
  toAmino(message: PexAddrs): PexAddrsAmino {
    const obj: any = {};
    if (message.addrs) {
      obj.addrs = message.addrs.map(e => e ? NetAddress.toAmino(e) : undefined);
    } else {
      obj.addrs = message.addrs;
    }
    return obj;
  },
  fromAminoMsg(object: PexAddrsAminoMsg): PexAddrs {
    return PexAddrs.fromAmino(object.value);
  },
  fromProtoMsg(message: PexAddrsProtoMsg): PexAddrs {
    return PexAddrs.decode(message.value);
  },
  toProto(message: PexAddrs): Uint8Array {
    return PexAddrs.encode(message).finish();
  },
  toProtoMsg(message: PexAddrs): PexAddrsProtoMsg {
    return {
      typeUrl: "/tendermint.p2p.PexAddrs",
      value: PexAddrs.encode(message).finish()
    };
  }
};
function createBaseMessage(): Message {
  return {
    pexRequest: undefined,
    pexAddrs: undefined
  };
}
export const Message = {
  typeUrl: "/tendermint.p2p.Message",
  encode(message: Message, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.pexRequest !== undefined) {
      PexRequest.encode(message.pexRequest, writer.uint32(10).fork()).ldelim();
    }
    if (message.pexAddrs !== undefined) {
      PexAddrs.encode(message.pexAddrs, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): Message {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMessage();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.pexRequest = PexRequest.decode(reader, reader.uint32());
          break;
        case 2:
          message.pexAddrs = PexAddrs.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: DeepPartial<Message>): Message {
    const message = createBaseMessage();
    message.pexRequest = object.pexRequest !== undefined && object.pexRequest !== null ? PexRequest.fromPartial(object.pexRequest) : undefined;
    message.pexAddrs = object.pexAddrs !== undefined && object.pexAddrs !== null ? PexAddrs.fromPartial(object.pexAddrs) : undefined;
    return message;
  },
  fromAmino(object: MessageAmino): Message {
    const message = createBaseMessage();
    if (object.pex_request !== undefined && object.pex_request !== null) {
      message.pexRequest = PexRequest.fromAmino(object.pex_request);
    }
    if (object.pex_addrs !== undefined && object.pex_addrs !== null) {
      message.pexAddrs = PexAddrs.fromAmino(object.pex_addrs);
    }
    return message;
  },
  toAmino(message: Message): MessageAmino {
    const obj: any = {};
    obj.pex_request = message.pexRequest ? PexRequest.toAmino(message.pexRequest) : undefined;
    obj.pex_addrs = message.pexAddrs ? PexAddrs.toAmino(message.pexAddrs) : undefined;
    return obj;
  },
  fromAminoMsg(object: MessageAminoMsg): Message {
    return Message.fromAmino(object.value);
  },
  fromProtoMsg(message: MessageProtoMsg): Message {
    return Message.decode(message.value);
  },
  toProto(message: Message): Uint8Array {
    return Message.encode(message).finish();
  },
  toProtoMsg(message: Message): MessageProtoMsg {
    return {
      typeUrl: "/tendermint.p2p.Message",
      value: Message.encode(message).finish()
    };
  }
};