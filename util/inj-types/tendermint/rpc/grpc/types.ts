import { ResponseCheckTx, ResponseCheckTxAmino, ResponseCheckTxSDKType, ResponseDeliverTx, ResponseDeliverTxAmino, ResponseDeliverTxSDKType } from "../../abci/types";
import { BinaryReader, BinaryWriter } from "../../../binary";
import { DeepPartial, bytesFromBase64, base64FromBytes } from "../../../helpers";
export interface RequestPing {}
export interface RequestPingProtoMsg {
  typeUrl: "/tendermint.rpc.grpc.RequestPing";
  value: Uint8Array;
}
export interface RequestPingAmino {}
export interface RequestPingAminoMsg {
  type: "/tendermint.rpc.grpc.RequestPing";
  value: RequestPingAmino;
}
export interface RequestPingSDKType {}
export interface RequestBroadcastTx {
  tx: Uint8Array;
}
export interface RequestBroadcastTxProtoMsg {
  typeUrl: "/tendermint.rpc.grpc.RequestBroadcastTx";
  value: Uint8Array;
}
export interface RequestBroadcastTxAmino {
  tx?: string;
}
export interface RequestBroadcastTxAminoMsg {
  type: "/tendermint.rpc.grpc.RequestBroadcastTx";
  value: RequestBroadcastTxAmino;
}
export interface RequestBroadcastTxSDKType {
  tx: Uint8Array;
}
export interface ResponsePing {}
export interface ResponsePingProtoMsg {
  typeUrl: "/tendermint.rpc.grpc.ResponsePing";
  value: Uint8Array;
}
export interface ResponsePingAmino {}
export interface ResponsePingAminoMsg {
  type: "/tendermint.rpc.grpc.ResponsePing";
  value: ResponsePingAmino;
}
export interface ResponsePingSDKType {}
export interface ResponseBroadcastTx {
  checkTx?: ResponseCheckTx;
  deliverTx?: ResponseDeliverTx;
}
export interface ResponseBroadcastTxProtoMsg {
  typeUrl: "/tendermint.rpc.grpc.ResponseBroadcastTx";
  value: Uint8Array;
}
export interface ResponseBroadcastTxAmino {
  check_tx?: ResponseCheckTxAmino;
  deliver_tx?: ResponseDeliverTxAmino;
}
export interface ResponseBroadcastTxAminoMsg {
  type: "/tendermint.rpc.grpc.ResponseBroadcastTx";
  value: ResponseBroadcastTxAmino;
}
export interface ResponseBroadcastTxSDKType {
  check_tx?: ResponseCheckTxSDKType;
  deliver_tx?: ResponseDeliverTxSDKType;
}
function createBaseRequestPing(): RequestPing {
  return {};
}
export const RequestPing = {
  typeUrl: "/tendermint.rpc.grpc.RequestPing",
  encode(_: RequestPing, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): RequestPing {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRequestPing();
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
  fromPartial(_: DeepPartial<RequestPing>): RequestPing {
    const message = createBaseRequestPing();
    return message;
  },
  fromAmino(_: RequestPingAmino): RequestPing {
    const message = createBaseRequestPing();
    return message;
  },
  toAmino(_: RequestPing): RequestPingAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(object: RequestPingAminoMsg): RequestPing {
    return RequestPing.fromAmino(object.value);
  },
  fromProtoMsg(message: RequestPingProtoMsg): RequestPing {
    return RequestPing.decode(message.value);
  },
  toProto(message: RequestPing): Uint8Array {
    return RequestPing.encode(message).finish();
  },
  toProtoMsg(message: RequestPing): RequestPingProtoMsg {
    return {
      typeUrl: "/tendermint.rpc.grpc.RequestPing",
      value: RequestPing.encode(message).finish()
    };
  }
};
function createBaseRequestBroadcastTx(): RequestBroadcastTx {
  return {
    tx: new Uint8Array()
  };
}
export const RequestBroadcastTx = {
  typeUrl: "/tendermint.rpc.grpc.RequestBroadcastTx",
  encode(message: RequestBroadcastTx, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.tx.length !== 0) {
      writer.uint32(10).bytes(message.tx);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): RequestBroadcastTx {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRequestBroadcastTx();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.tx = reader.bytes();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: DeepPartial<RequestBroadcastTx>): RequestBroadcastTx {
    const message = createBaseRequestBroadcastTx();
    message.tx = object.tx ?? new Uint8Array();
    return message;
  },
  fromAmino(object: RequestBroadcastTxAmino): RequestBroadcastTx {
    const message = createBaseRequestBroadcastTx();
    if (object.tx !== undefined && object.tx !== null) {
      message.tx = bytesFromBase64(object.tx);
    }
    return message;
  },
  toAmino(message: RequestBroadcastTx): RequestBroadcastTxAmino {
    const obj: any = {};
    obj.tx = message.tx ? base64FromBytes(message.tx) : undefined;
    return obj;
  },
  fromAminoMsg(object: RequestBroadcastTxAminoMsg): RequestBroadcastTx {
    return RequestBroadcastTx.fromAmino(object.value);
  },
  fromProtoMsg(message: RequestBroadcastTxProtoMsg): RequestBroadcastTx {
    return RequestBroadcastTx.decode(message.value);
  },
  toProto(message: RequestBroadcastTx): Uint8Array {
    return RequestBroadcastTx.encode(message).finish();
  },
  toProtoMsg(message: RequestBroadcastTx): RequestBroadcastTxProtoMsg {
    return {
      typeUrl: "/tendermint.rpc.grpc.RequestBroadcastTx",
      value: RequestBroadcastTx.encode(message).finish()
    };
  }
};
function createBaseResponsePing(): ResponsePing {
  return {};
}
export const ResponsePing = {
  typeUrl: "/tendermint.rpc.grpc.ResponsePing",
  encode(_: ResponsePing, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): ResponsePing {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseResponsePing();
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
  fromPartial(_: DeepPartial<ResponsePing>): ResponsePing {
    const message = createBaseResponsePing();
    return message;
  },
  fromAmino(_: ResponsePingAmino): ResponsePing {
    const message = createBaseResponsePing();
    return message;
  },
  toAmino(_: ResponsePing): ResponsePingAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(object: ResponsePingAminoMsg): ResponsePing {
    return ResponsePing.fromAmino(object.value);
  },
  fromProtoMsg(message: ResponsePingProtoMsg): ResponsePing {
    return ResponsePing.decode(message.value);
  },
  toProto(message: ResponsePing): Uint8Array {
    return ResponsePing.encode(message).finish();
  },
  toProtoMsg(message: ResponsePing): ResponsePingProtoMsg {
    return {
      typeUrl: "/tendermint.rpc.grpc.ResponsePing",
      value: ResponsePing.encode(message).finish()
    };
  }
};
function createBaseResponseBroadcastTx(): ResponseBroadcastTx {
  return {
    checkTx: undefined,
    deliverTx: undefined
  };
}
export const ResponseBroadcastTx = {
  typeUrl: "/tendermint.rpc.grpc.ResponseBroadcastTx",
  encode(message: ResponseBroadcastTx, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.checkTx !== undefined) {
      ResponseCheckTx.encode(message.checkTx, writer.uint32(10).fork()).ldelim();
    }
    if (message.deliverTx !== undefined) {
      ResponseDeliverTx.encode(message.deliverTx, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): ResponseBroadcastTx {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseResponseBroadcastTx();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.checkTx = ResponseCheckTx.decode(reader, reader.uint32());
          break;
        case 2:
          message.deliverTx = ResponseDeliverTx.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: DeepPartial<ResponseBroadcastTx>): ResponseBroadcastTx {
    const message = createBaseResponseBroadcastTx();
    message.checkTx = object.checkTx !== undefined && object.checkTx !== null ? ResponseCheckTx.fromPartial(object.checkTx) : undefined;
    message.deliverTx = object.deliverTx !== undefined && object.deliverTx !== null ? ResponseDeliverTx.fromPartial(object.deliverTx) : undefined;
    return message;
  },
  fromAmino(object: ResponseBroadcastTxAmino): ResponseBroadcastTx {
    const message = createBaseResponseBroadcastTx();
    if (object.check_tx !== undefined && object.check_tx !== null) {
      message.checkTx = ResponseCheckTx.fromAmino(object.check_tx);
    }
    if (object.deliver_tx !== undefined && object.deliver_tx !== null) {
      message.deliverTx = ResponseDeliverTx.fromAmino(object.deliver_tx);
    }
    return message;
  },
  toAmino(message: ResponseBroadcastTx): ResponseBroadcastTxAmino {
    const obj: any = {};
    obj.check_tx = message.checkTx ? ResponseCheckTx.toAmino(message.checkTx) : undefined;
    obj.deliver_tx = message.deliverTx ? ResponseDeliverTx.toAmino(message.deliverTx) : undefined;
    return obj;
  },
  fromAminoMsg(object: ResponseBroadcastTxAminoMsg): ResponseBroadcastTx {
    return ResponseBroadcastTx.fromAmino(object.value);
  },
  fromProtoMsg(message: ResponseBroadcastTxProtoMsg): ResponseBroadcastTx {
    return ResponseBroadcastTx.decode(message.value);
  },
  toProto(message: ResponseBroadcastTx): Uint8Array {
    return ResponseBroadcastTx.encode(message).finish();
  },
  toProtoMsg(message: ResponseBroadcastTx): ResponseBroadcastTxProtoMsg {
    return {
      typeUrl: "/tendermint.rpc.grpc.ResponseBroadcastTx",
      value: ResponseBroadcastTx.encode(message).finish()
    };
  }
};