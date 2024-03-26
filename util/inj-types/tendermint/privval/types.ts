import { PublicKey, PublicKeyAmino, PublicKeySDKType } from "../crypto/keys";
import { Vote, VoteAmino, VoteSDKType, Proposal, ProposalAmino, ProposalSDKType } from "../types/types";
import { BinaryReader, BinaryWriter } from "../../binary";
import { DeepPartial } from "../../helpers";
export enum Errors {
  ERRORS_UNKNOWN = 0,
  ERRORS_UNEXPECTED_RESPONSE = 1,
  ERRORS_NO_CONNECTION = 2,
  ERRORS_CONNECTION_TIMEOUT = 3,
  ERRORS_READ_TIMEOUT = 4,
  ERRORS_WRITE_TIMEOUT = 5,
  UNRECOGNIZED = -1,
}
export const ErrorsSDKType = Errors;
export const ErrorsAmino = Errors;
export function errorsFromJSON(object: any): Errors {
  switch (object) {
    case 0:
    case "ERRORS_UNKNOWN":
      return Errors.ERRORS_UNKNOWN;
    case 1:
    case "ERRORS_UNEXPECTED_RESPONSE":
      return Errors.ERRORS_UNEXPECTED_RESPONSE;
    case 2:
    case "ERRORS_NO_CONNECTION":
      return Errors.ERRORS_NO_CONNECTION;
    case 3:
    case "ERRORS_CONNECTION_TIMEOUT":
      return Errors.ERRORS_CONNECTION_TIMEOUT;
    case 4:
    case "ERRORS_READ_TIMEOUT":
      return Errors.ERRORS_READ_TIMEOUT;
    case 5:
    case "ERRORS_WRITE_TIMEOUT":
      return Errors.ERRORS_WRITE_TIMEOUT;
    case -1:
    case "UNRECOGNIZED":
    default:
      return Errors.UNRECOGNIZED;
  }
}
export function errorsToJSON(object: Errors): string {
  switch (object) {
    case Errors.ERRORS_UNKNOWN:
      return "ERRORS_UNKNOWN";
    case Errors.ERRORS_UNEXPECTED_RESPONSE:
      return "ERRORS_UNEXPECTED_RESPONSE";
    case Errors.ERRORS_NO_CONNECTION:
      return "ERRORS_NO_CONNECTION";
    case Errors.ERRORS_CONNECTION_TIMEOUT:
      return "ERRORS_CONNECTION_TIMEOUT";
    case Errors.ERRORS_READ_TIMEOUT:
      return "ERRORS_READ_TIMEOUT";
    case Errors.ERRORS_WRITE_TIMEOUT:
      return "ERRORS_WRITE_TIMEOUT";
    case Errors.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}
export interface RemoteSignerError {
  code: number;
  description: string;
}
export interface RemoteSignerErrorProtoMsg {
  typeUrl: "/tendermint.privval.RemoteSignerError";
  value: Uint8Array;
}
export interface RemoteSignerErrorAmino {
  code?: number;
  description?: string;
}
export interface RemoteSignerErrorAminoMsg {
  type: "/tendermint.privval.RemoteSignerError";
  value: RemoteSignerErrorAmino;
}
export interface RemoteSignerErrorSDKType {
  code: number;
  description: string;
}
/** PubKeyRequest requests the consensus public key from the remote signer. */
export interface PubKeyRequest {
  chainId: string;
}
export interface PubKeyRequestProtoMsg {
  typeUrl: "/tendermint.privval.PubKeyRequest";
  value: Uint8Array;
}
/** PubKeyRequest requests the consensus public key from the remote signer. */
export interface PubKeyRequestAmino {
  chain_id?: string;
}
export interface PubKeyRequestAminoMsg {
  type: "/tendermint.privval.PubKeyRequest";
  value: PubKeyRequestAmino;
}
/** PubKeyRequest requests the consensus public key from the remote signer. */
export interface PubKeyRequestSDKType {
  chain_id: string;
}
/** PubKeyResponse is a response message containing the public key. */
export interface PubKeyResponse {
  pubKey: PublicKey;
  error?: RemoteSignerError;
}
export interface PubKeyResponseProtoMsg {
  typeUrl: "/tendermint.privval.PubKeyResponse";
  value: Uint8Array;
}
/** PubKeyResponse is a response message containing the public key. */
export interface PubKeyResponseAmino {
  pub_key?: PublicKeyAmino;
  error?: RemoteSignerErrorAmino;
}
export interface PubKeyResponseAminoMsg {
  type: "/tendermint.privval.PubKeyResponse";
  value: PubKeyResponseAmino;
}
/** PubKeyResponse is a response message containing the public key. */
export interface PubKeyResponseSDKType {
  pub_key: PublicKeySDKType;
  error?: RemoteSignerErrorSDKType;
}
/** SignVoteRequest is a request to sign a vote */
export interface SignVoteRequest {
  vote?: Vote;
  chainId: string;
}
export interface SignVoteRequestProtoMsg {
  typeUrl: "/tendermint.privval.SignVoteRequest";
  value: Uint8Array;
}
/** SignVoteRequest is a request to sign a vote */
export interface SignVoteRequestAmino {
  vote?: VoteAmino;
  chain_id?: string;
}
export interface SignVoteRequestAminoMsg {
  type: "/tendermint.privval.SignVoteRequest";
  value: SignVoteRequestAmino;
}
/** SignVoteRequest is a request to sign a vote */
export interface SignVoteRequestSDKType {
  vote?: VoteSDKType;
  chain_id: string;
}
/** SignedVoteResponse is a response containing a signed vote or an error */
export interface SignedVoteResponse {
  vote: Vote;
  error?: RemoteSignerError;
}
export interface SignedVoteResponseProtoMsg {
  typeUrl: "/tendermint.privval.SignedVoteResponse";
  value: Uint8Array;
}
/** SignedVoteResponse is a response containing a signed vote or an error */
export interface SignedVoteResponseAmino {
  vote?: VoteAmino;
  error?: RemoteSignerErrorAmino;
}
export interface SignedVoteResponseAminoMsg {
  type: "/tendermint.privval.SignedVoteResponse";
  value: SignedVoteResponseAmino;
}
/** SignedVoteResponse is a response containing a signed vote or an error */
export interface SignedVoteResponseSDKType {
  vote: VoteSDKType;
  error?: RemoteSignerErrorSDKType;
}
/** SignProposalRequest is a request to sign a proposal */
export interface SignProposalRequest {
  proposal?: Proposal;
  chainId: string;
}
export interface SignProposalRequestProtoMsg {
  typeUrl: "/tendermint.privval.SignProposalRequest";
  value: Uint8Array;
}
/** SignProposalRequest is a request to sign a proposal */
export interface SignProposalRequestAmino {
  proposal?: ProposalAmino;
  chain_id?: string;
}
export interface SignProposalRequestAminoMsg {
  type: "/tendermint.privval.SignProposalRequest";
  value: SignProposalRequestAmino;
}
/** SignProposalRequest is a request to sign a proposal */
export interface SignProposalRequestSDKType {
  proposal?: ProposalSDKType;
  chain_id: string;
}
/** SignedProposalResponse is response containing a signed proposal or an error */
export interface SignedProposalResponse {
  proposal: Proposal;
  error?: RemoteSignerError;
}
export interface SignedProposalResponseProtoMsg {
  typeUrl: "/tendermint.privval.SignedProposalResponse";
  value: Uint8Array;
}
/** SignedProposalResponse is response containing a signed proposal or an error */
export interface SignedProposalResponseAmino {
  proposal?: ProposalAmino;
  error?: RemoteSignerErrorAmino;
}
export interface SignedProposalResponseAminoMsg {
  type: "/tendermint.privval.SignedProposalResponse";
  value: SignedProposalResponseAmino;
}
/** SignedProposalResponse is response containing a signed proposal or an error */
export interface SignedProposalResponseSDKType {
  proposal: ProposalSDKType;
  error?: RemoteSignerErrorSDKType;
}
/** PingRequest is a request to confirm that the connection is alive. */
export interface PingRequest {}
export interface PingRequestProtoMsg {
  typeUrl: "/tendermint.privval.PingRequest";
  value: Uint8Array;
}
/** PingRequest is a request to confirm that the connection is alive. */
export interface PingRequestAmino {}
export interface PingRequestAminoMsg {
  type: "/tendermint.privval.PingRequest";
  value: PingRequestAmino;
}
/** PingRequest is a request to confirm that the connection is alive. */
export interface PingRequestSDKType {}
/** PingResponse is a response to confirm that the connection is alive. */
export interface PingResponse {}
export interface PingResponseProtoMsg {
  typeUrl: "/tendermint.privval.PingResponse";
  value: Uint8Array;
}
/** PingResponse is a response to confirm that the connection is alive. */
export interface PingResponseAmino {}
export interface PingResponseAminoMsg {
  type: "/tendermint.privval.PingResponse";
  value: PingResponseAmino;
}
/** PingResponse is a response to confirm that the connection is alive. */
export interface PingResponseSDKType {}
export interface Message {
  pubKeyRequest?: PubKeyRequest;
  pubKeyResponse?: PubKeyResponse;
  signVoteRequest?: SignVoteRequest;
  signedVoteResponse?: SignedVoteResponse;
  signProposalRequest?: SignProposalRequest;
  signedProposalResponse?: SignedProposalResponse;
  pingRequest?: PingRequest;
  pingResponse?: PingResponse;
}
export interface MessageProtoMsg {
  typeUrl: "/tendermint.privval.Message";
  value: Uint8Array;
}
export interface MessageAmino {
  pub_key_request?: PubKeyRequestAmino;
  pub_key_response?: PubKeyResponseAmino;
  sign_vote_request?: SignVoteRequestAmino;
  signed_vote_response?: SignedVoteResponseAmino;
  sign_proposal_request?: SignProposalRequestAmino;
  signed_proposal_response?: SignedProposalResponseAmino;
  ping_request?: PingRequestAmino;
  ping_response?: PingResponseAmino;
}
export interface MessageAminoMsg {
  type: "/tendermint.privval.Message";
  value: MessageAmino;
}
export interface MessageSDKType {
  pub_key_request?: PubKeyRequestSDKType;
  pub_key_response?: PubKeyResponseSDKType;
  sign_vote_request?: SignVoteRequestSDKType;
  signed_vote_response?: SignedVoteResponseSDKType;
  sign_proposal_request?: SignProposalRequestSDKType;
  signed_proposal_response?: SignedProposalResponseSDKType;
  ping_request?: PingRequestSDKType;
  ping_response?: PingResponseSDKType;
}
function createBaseRemoteSignerError(): RemoteSignerError {
  return {
    code: 0,
    description: ""
  };
}
export const RemoteSignerError = {
  typeUrl: "/tendermint.privval.RemoteSignerError",
  encode(message: RemoteSignerError, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.code !== 0) {
      writer.uint32(8).int32(message.code);
    }
    if (message.description !== "") {
      writer.uint32(18).string(message.description);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): RemoteSignerError {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRemoteSignerError();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.code = reader.int32();
          break;
        case 2:
          message.description = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: DeepPartial<RemoteSignerError>): RemoteSignerError {
    const message = createBaseRemoteSignerError();
    message.code = object.code ?? 0;
    message.description = object.description ?? "";
    return message;
  },
  fromAmino(object: RemoteSignerErrorAmino): RemoteSignerError {
    const message = createBaseRemoteSignerError();
    if (object.code !== undefined && object.code !== null) {
      message.code = object.code;
    }
    if (object.description !== undefined && object.description !== null) {
      message.description = object.description;
    }
    return message;
  },
  toAmino(message: RemoteSignerError): RemoteSignerErrorAmino {
    const obj: any = {};
    obj.code = message.code === 0 ? undefined : message.code;
    obj.description = message.description === "" ? undefined : message.description;
    return obj;
  },
  fromAminoMsg(object: RemoteSignerErrorAminoMsg): RemoteSignerError {
    return RemoteSignerError.fromAmino(object.value);
  },
  fromProtoMsg(message: RemoteSignerErrorProtoMsg): RemoteSignerError {
    return RemoteSignerError.decode(message.value);
  },
  toProto(message: RemoteSignerError): Uint8Array {
    return RemoteSignerError.encode(message).finish();
  },
  toProtoMsg(message: RemoteSignerError): RemoteSignerErrorProtoMsg {
    return {
      typeUrl: "/tendermint.privval.RemoteSignerError",
      value: RemoteSignerError.encode(message).finish()
    };
  }
};
function createBasePubKeyRequest(): PubKeyRequest {
  return {
    chainId: ""
  };
}
export const PubKeyRequest = {
  typeUrl: "/tendermint.privval.PubKeyRequest",
  encode(message: PubKeyRequest, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.chainId !== "") {
      writer.uint32(10).string(message.chainId);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): PubKeyRequest {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePubKeyRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.chainId = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: DeepPartial<PubKeyRequest>): PubKeyRequest {
    const message = createBasePubKeyRequest();
    message.chainId = object.chainId ?? "";
    return message;
  },
  fromAmino(object: PubKeyRequestAmino): PubKeyRequest {
    const message = createBasePubKeyRequest();
    if (object.chain_id !== undefined && object.chain_id !== null) {
      message.chainId = object.chain_id;
    }
    return message;
  },
  toAmino(message: PubKeyRequest): PubKeyRequestAmino {
    const obj: any = {};
    obj.chain_id = message.chainId === "" ? undefined : message.chainId;
    return obj;
  },
  fromAminoMsg(object: PubKeyRequestAminoMsg): PubKeyRequest {
    return PubKeyRequest.fromAmino(object.value);
  },
  fromProtoMsg(message: PubKeyRequestProtoMsg): PubKeyRequest {
    return PubKeyRequest.decode(message.value);
  },
  toProto(message: PubKeyRequest): Uint8Array {
    return PubKeyRequest.encode(message).finish();
  },
  toProtoMsg(message: PubKeyRequest): PubKeyRequestProtoMsg {
    return {
      typeUrl: "/tendermint.privval.PubKeyRequest",
      value: PubKeyRequest.encode(message).finish()
    };
  }
};
function createBasePubKeyResponse(): PubKeyResponse {
  return {
    pubKey: PublicKey.fromPartial({}),
    error: undefined
  };
}
export const PubKeyResponse = {
  typeUrl: "/tendermint.privval.PubKeyResponse",
  encode(message: PubKeyResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.pubKey !== undefined) {
      PublicKey.encode(message.pubKey, writer.uint32(10).fork()).ldelim();
    }
    if (message.error !== undefined) {
      RemoteSignerError.encode(message.error, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): PubKeyResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePubKeyResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.pubKey = PublicKey.decode(reader, reader.uint32());
          break;
        case 2:
          message.error = RemoteSignerError.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: DeepPartial<PubKeyResponse>): PubKeyResponse {
    const message = createBasePubKeyResponse();
    message.pubKey = object.pubKey !== undefined && object.pubKey !== null ? PublicKey.fromPartial(object.pubKey) : undefined;
    message.error = object.error !== undefined && object.error !== null ? RemoteSignerError.fromPartial(object.error) : undefined;
    return message;
  },
  fromAmino(object: PubKeyResponseAmino): PubKeyResponse {
    const message = createBasePubKeyResponse();
    if (object.pub_key !== undefined && object.pub_key !== null) {
      message.pubKey = PublicKey.fromAmino(object.pub_key);
    }
    if (object.error !== undefined && object.error !== null) {
      message.error = RemoteSignerError.fromAmino(object.error);
    }
    return message;
  },
  toAmino(message: PubKeyResponse): PubKeyResponseAmino {
    const obj: any = {};
    obj.pub_key = message.pubKey ? PublicKey.toAmino(message.pubKey) : undefined;
    obj.error = message.error ? RemoteSignerError.toAmino(message.error) : undefined;
    return obj;
  },
  fromAminoMsg(object: PubKeyResponseAminoMsg): PubKeyResponse {
    return PubKeyResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: PubKeyResponseProtoMsg): PubKeyResponse {
    return PubKeyResponse.decode(message.value);
  },
  toProto(message: PubKeyResponse): Uint8Array {
    return PubKeyResponse.encode(message).finish();
  },
  toProtoMsg(message: PubKeyResponse): PubKeyResponseProtoMsg {
    return {
      typeUrl: "/tendermint.privval.PubKeyResponse",
      value: PubKeyResponse.encode(message).finish()
    };
  }
};
function createBaseSignVoteRequest(): SignVoteRequest {
  return {
    vote: undefined,
    chainId: ""
  };
}
export const SignVoteRequest = {
  typeUrl: "/tendermint.privval.SignVoteRequest",
  encode(message: SignVoteRequest, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.vote !== undefined) {
      Vote.encode(message.vote, writer.uint32(10).fork()).ldelim();
    }
    if (message.chainId !== "") {
      writer.uint32(18).string(message.chainId);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): SignVoteRequest {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSignVoteRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.vote = Vote.decode(reader, reader.uint32());
          break;
        case 2:
          message.chainId = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: DeepPartial<SignVoteRequest>): SignVoteRequest {
    const message = createBaseSignVoteRequest();
    message.vote = object.vote !== undefined && object.vote !== null ? Vote.fromPartial(object.vote) : undefined;
    message.chainId = object.chainId ?? "";
    return message;
  },
  fromAmino(object: SignVoteRequestAmino): SignVoteRequest {
    const message = createBaseSignVoteRequest();
    if (object.vote !== undefined && object.vote !== null) {
      message.vote = Vote.fromAmino(object.vote);
    }
    if (object.chain_id !== undefined && object.chain_id !== null) {
      message.chainId = object.chain_id;
    }
    return message;
  },
  toAmino(message: SignVoteRequest): SignVoteRequestAmino {
    const obj: any = {};
    obj.vote = message.vote ? Vote.toAmino(message.vote) : undefined;
    obj.chain_id = message.chainId === "" ? undefined : message.chainId;
    return obj;
  },
  fromAminoMsg(object: SignVoteRequestAminoMsg): SignVoteRequest {
    return SignVoteRequest.fromAmino(object.value);
  },
  fromProtoMsg(message: SignVoteRequestProtoMsg): SignVoteRequest {
    return SignVoteRequest.decode(message.value);
  },
  toProto(message: SignVoteRequest): Uint8Array {
    return SignVoteRequest.encode(message).finish();
  },
  toProtoMsg(message: SignVoteRequest): SignVoteRequestProtoMsg {
    return {
      typeUrl: "/tendermint.privval.SignVoteRequest",
      value: SignVoteRequest.encode(message).finish()
    };
  }
};
function createBaseSignedVoteResponse(): SignedVoteResponse {
  return {
    vote: Vote.fromPartial({}),
    error: undefined
  };
}
export const SignedVoteResponse = {
  typeUrl: "/tendermint.privval.SignedVoteResponse",
  encode(message: SignedVoteResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.vote !== undefined) {
      Vote.encode(message.vote, writer.uint32(10).fork()).ldelim();
    }
    if (message.error !== undefined) {
      RemoteSignerError.encode(message.error, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): SignedVoteResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSignedVoteResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.vote = Vote.decode(reader, reader.uint32());
          break;
        case 2:
          message.error = RemoteSignerError.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: DeepPartial<SignedVoteResponse>): SignedVoteResponse {
    const message = createBaseSignedVoteResponse();
    message.vote = object.vote !== undefined && object.vote !== null ? Vote.fromPartial(object.vote) : undefined;
    message.error = object.error !== undefined && object.error !== null ? RemoteSignerError.fromPartial(object.error) : undefined;
    return message;
  },
  fromAmino(object: SignedVoteResponseAmino): SignedVoteResponse {
    const message = createBaseSignedVoteResponse();
    if (object.vote !== undefined && object.vote !== null) {
      message.vote = Vote.fromAmino(object.vote);
    }
    if (object.error !== undefined && object.error !== null) {
      message.error = RemoteSignerError.fromAmino(object.error);
    }
    return message;
  },
  toAmino(message: SignedVoteResponse): SignedVoteResponseAmino {
    const obj: any = {};
    obj.vote = message.vote ? Vote.toAmino(message.vote) : undefined;
    obj.error = message.error ? RemoteSignerError.toAmino(message.error) : undefined;
    return obj;
  },
  fromAminoMsg(object: SignedVoteResponseAminoMsg): SignedVoteResponse {
    return SignedVoteResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: SignedVoteResponseProtoMsg): SignedVoteResponse {
    return SignedVoteResponse.decode(message.value);
  },
  toProto(message: SignedVoteResponse): Uint8Array {
    return SignedVoteResponse.encode(message).finish();
  },
  toProtoMsg(message: SignedVoteResponse): SignedVoteResponseProtoMsg {
    return {
      typeUrl: "/tendermint.privval.SignedVoteResponse",
      value: SignedVoteResponse.encode(message).finish()
    };
  }
};
function createBaseSignProposalRequest(): SignProposalRequest {
  return {
    proposal: undefined,
    chainId: ""
  };
}
export const SignProposalRequest = {
  typeUrl: "/tendermint.privval.SignProposalRequest",
  encode(message: SignProposalRequest, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.proposal !== undefined) {
      Proposal.encode(message.proposal, writer.uint32(10).fork()).ldelim();
    }
    if (message.chainId !== "") {
      writer.uint32(18).string(message.chainId);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): SignProposalRequest {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSignProposalRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.proposal = Proposal.decode(reader, reader.uint32());
          break;
        case 2:
          message.chainId = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: DeepPartial<SignProposalRequest>): SignProposalRequest {
    const message = createBaseSignProposalRequest();
    message.proposal = object.proposal !== undefined && object.proposal !== null ? Proposal.fromPartial(object.proposal) : undefined;
    message.chainId = object.chainId ?? "";
    return message;
  },
  fromAmino(object: SignProposalRequestAmino): SignProposalRequest {
    const message = createBaseSignProposalRequest();
    if (object.proposal !== undefined && object.proposal !== null) {
      message.proposal = Proposal.fromAmino(object.proposal);
    }
    if (object.chain_id !== undefined && object.chain_id !== null) {
      message.chainId = object.chain_id;
    }
    return message;
  },
  toAmino(message: SignProposalRequest): SignProposalRequestAmino {
    const obj: any = {};
    obj.proposal = message.proposal ? Proposal.toAmino(message.proposal) : undefined;
    obj.chain_id = message.chainId === "" ? undefined : message.chainId;
    return obj;
  },
  fromAminoMsg(object: SignProposalRequestAminoMsg): SignProposalRequest {
    return SignProposalRequest.fromAmino(object.value);
  },
  fromProtoMsg(message: SignProposalRequestProtoMsg): SignProposalRequest {
    return SignProposalRequest.decode(message.value);
  },
  toProto(message: SignProposalRequest): Uint8Array {
    return SignProposalRequest.encode(message).finish();
  },
  toProtoMsg(message: SignProposalRequest): SignProposalRequestProtoMsg {
    return {
      typeUrl: "/tendermint.privval.SignProposalRequest",
      value: SignProposalRequest.encode(message).finish()
    };
  }
};
function createBaseSignedProposalResponse(): SignedProposalResponse {
  return {
    proposal: Proposal.fromPartial({}),
    error: undefined
  };
}
export const SignedProposalResponse = {
  typeUrl: "/tendermint.privval.SignedProposalResponse",
  encode(message: SignedProposalResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.proposal !== undefined) {
      Proposal.encode(message.proposal, writer.uint32(10).fork()).ldelim();
    }
    if (message.error !== undefined) {
      RemoteSignerError.encode(message.error, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): SignedProposalResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSignedProposalResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.proposal = Proposal.decode(reader, reader.uint32());
          break;
        case 2:
          message.error = RemoteSignerError.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: DeepPartial<SignedProposalResponse>): SignedProposalResponse {
    const message = createBaseSignedProposalResponse();
    message.proposal = object.proposal !== undefined && object.proposal !== null ? Proposal.fromPartial(object.proposal) : undefined;
    message.error = object.error !== undefined && object.error !== null ? RemoteSignerError.fromPartial(object.error) : undefined;
    return message;
  },
  fromAmino(object: SignedProposalResponseAmino): SignedProposalResponse {
    const message = createBaseSignedProposalResponse();
    if (object.proposal !== undefined && object.proposal !== null) {
      message.proposal = Proposal.fromAmino(object.proposal);
    }
    if (object.error !== undefined && object.error !== null) {
      message.error = RemoteSignerError.fromAmino(object.error);
    }
    return message;
  },
  toAmino(message: SignedProposalResponse): SignedProposalResponseAmino {
    const obj: any = {};
    obj.proposal = message.proposal ? Proposal.toAmino(message.proposal) : undefined;
    obj.error = message.error ? RemoteSignerError.toAmino(message.error) : undefined;
    return obj;
  },
  fromAminoMsg(object: SignedProposalResponseAminoMsg): SignedProposalResponse {
    return SignedProposalResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: SignedProposalResponseProtoMsg): SignedProposalResponse {
    return SignedProposalResponse.decode(message.value);
  },
  toProto(message: SignedProposalResponse): Uint8Array {
    return SignedProposalResponse.encode(message).finish();
  },
  toProtoMsg(message: SignedProposalResponse): SignedProposalResponseProtoMsg {
    return {
      typeUrl: "/tendermint.privval.SignedProposalResponse",
      value: SignedProposalResponse.encode(message).finish()
    };
  }
};
function createBasePingRequest(): PingRequest {
  return {};
}
export const PingRequest = {
  typeUrl: "/tendermint.privval.PingRequest",
  encode(_: PingRequest, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): PingRequest {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePingRequest();
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
  fromPartial(_: DeepPartial<PingRequest>): PingRequest {
    const message = createBasePingRequest();
    return message;
  },
  fromAmino(_: PingRequestAmino): PingRequest {
    const message = createBasePingRequest();
    return message;
  },
  toAmino(_: PingRequest): PingRequestAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(object: PingRequestAminoMsg): PingRequest {
    return PingRequest.fromAmino(object.value);
  },
  fromProtoMsg(message: PingRequestProtoMsg): PingRequest {
    return PingRequest.decode(message.value);
  },
  toProto(message: PingRequest): Uint8Array {
    return PingRequest.encode(message).finish();
  },
  toProtoMsg(message: PingRequest): PingRequestProtoMsg {
    return {
      typeUrl: "/tendermint.privval.PingRequest",
      value: PingRequest.encode(message).finish()
    };
  }
};
function createBasePingResponse(): PingResponse {
  return {};
}
export const PingResponse = {
  typeUrl: "/tendermint.privval.PingResponse",
  encode(_: PingResponse, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): PingResponse {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePingResponse();
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
  fromPartial(_: DeepPartial<PingResponse>): PingResponse {
    const message = createBasePingResponse();
    return message;
  },
  fromAmino(_: PingResponseAmino): PingResponse {
    const message = createBasePingResponse();
    return message;
  },
  toAmino(_: PingResponse): PingResponseAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(object: PingResponseAminoMsg): PingResponse {
    return PingResponse.fromAmino(object.value);
  },
  fromProtoMsg(message: PingResponseProtoMsg): PingResponse {
    return PingResponse.decode(message.value);
  },
  toProto(message: PingResponse): Uint8Array {
    return PingResponse.encode(message).finish();
  },
  toProtoMsg(message: PingResponse): PingResponseProtoMsg {
    return {
      typeUrl: "/tendermint.privval.PingResponse",
      value: PingResponse.encode(message).finish()
    };
  }
};
function createBaseMessage(): Message {
  return {
    pubKeyRequest: undefined,
    pubKeyResponse: undefined,
    signVoteRequest: undefined,
    signedVoteResponse: undefined,
    signProposalRequest: undefined,
    signedProposalResponse: undefined,
    pingRequest: undefined,
    pingResponse: undefined
  };
}
export const Message = {
  typeUrl: "/tendermint.privval.Message",
  encode(message: Message, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.pubKeyRequest !== undefined) {
      PubKeyRequest.encode(message.pubKeyRequest, writer.uint32(10).fork()).ldelim();
    }
    if (message.pubKeyResponse !== undefined) {
      PubKeyResponse.encode(message.pubKeyResponse, writer.uint32(18).fork()).ldelim();
    }
    if (message.signVoteRequest !== undefined) {
      SignVoteRequest.encode(message.signVoteRequest, writer.uint32(26).fork()).ldelim();
    }
    if (message.signedVoteResponse !== undefined) {
      SignedVoteResponse.encode(message.signedVoteResponse, writer.uint32(34).fork()).ldelim();
    }
    if (message.signProposalRequest !== undefined) {
      SignProposalRequest.encode(message.signProposalRequest, writer.uint32(42).fork()).ldelim();
    }
    if (message.signedProposalResponse !== undefined) {
      SignedProposalResponse.encode(message.signedProposalResponse, writer.uint32(50).fork()).ldelim();
    }
    if (message.pingRequest !== undefined) {
      PingRequest.encode(message.pingRequest, writer.uint32(58).fork()).ldelim();
    }
    if (message.pingResponse !== undefined) {
      PingResponse.encode(message.pingResponse, writer.uint32(66).fork()).ldelim();
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
          message.pubKeyRequest = PubKeyRequest.decode(reader, reader.uint32());
          break;
        case 2:
          message.pubKeyResponse = PubKeyResponse.decode(reader, reader.uint32());
          break;
        case 3:
          message.signVoteRequest = SignVoteRequest.decode(reader, reader.uint32());
          break;
        case 4:
          message.signedVoteResponse = SignedVoteResponse.decode(reader, reader.uint32());
          break;
        case 5:
          message.signProposalRequest = SignProposalRequest.decode(reader, reader.uint32());
          break;
        case 6:
          message.signedProposalResponse = SignedProposalResponse.decode(reader, reader.uint32());
          break;
        case 7:
          message.pingRequest = PingRequest.decode(reader, reader.uint32());
          break;
        case 8:
          message.pingResponse = PingResponse.decode(reader, reader.uint32());
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
    message.pubKeyRequest = object.pubKeyRequest !== undefined && object.pubKeyRequest !== null ? PubKeyRequest.fromPartial(object.pubKeyRequest) : undefined;
    message.pubKeyResponse = object.pubKeyResponse !== undefined && object.pubKeyResponse !== null ? PubKeyResponse.fromPartial(object.pubKeyResponse) : undefined;
    message.signVoteRequest = object.signVoteRequest !== undefined && object.signVoteRequest !== null ? SignVoteRequest.fromPartial(object.signVoteRequest) : undefined;
    message.signedVoteResponse = object.signedVoteResponse !== undefined && object.signedVoteResponse !== null ? SignedVoteResponse.fromPartial(object.signedVoteResponse) : undefined;
    message.signProposalRequest = object.signProposalRequest !== undefined && object.signProposalRequest !== null ? SignProposalRequest.fromPartial(object.signProposalRequest) : undefined;
    message.signedProposalResponse = object.signedProposalResponse !== undefined && object.signedProposalResponse !== null ? SignedProposalResponse.fromPartial(object.signedProposalResponse) : undefined;
    message.pingRequest = object.pingRequest !== undefined && object.pingRequest !== null ? PingRequest.fromPartial(object.pingRequest) : undefined;
    message.pingResponse = object.pingResponse !== undefined && object.pingResponse !== null ? PingResponse.fromPartial(object.pingResponse) : undefined;
    return message;
  },
  fromAmino(object: MessageAmino): Message {
    const message = createBaseMessage();
    if (object.pub_key_request !== undefined && object.pub_key_request !== null) {
      message.pubKeyRequest = PubKeyRequest.fromAmino(object.pub_key_request);
    }
    if (object.pub_key_response !== undefined && object.pub_key_response !== null) {
      message.pubKeyResponse = PubKeyResponse.fromAmino(object.pub_key_response);
    }
    if (object.sign_vote_request !== undefined && object.sign_vote_request !== null) {
      message.signVoteRequest = SignVoteRequest.fromAmino(object.sign_vote_request);
    }
    if (object.signed_vote_response !== undefined && object.signed_vote_response !== null) {
      message.signedVoteResponse = SignedVoteResponse.fromAmino(object.signed_vote_response);
    }
    if (object.sign_proposal_request !== undefined && object.sign_proposal_request !== null) {
      message.signProposalRequest = SignProposalRequest.fromAmino(object.sign_proposal_request);
    }
    if (object.signed_proposal_response !== undefined && object.signed_proposal_response !== null) {
      message.signedProposalResponse = SignedProposalResponse.fromAmino(object.signed_proposal_response);
    }
    if (object.ping_request !== undefined && object.ping_request !== null) {
      message.pingRequest = PingRequest.fromAmino(object.ping_request);
    }
    if (object.ping_response !== undefined && object.ping_response !== null) {
      message.pingResponse = PingResponse.fromAmino(object.ping_response);
    }
    return message;
  },
  toAmino(message: Message): MessageAmino {
    const obj: any = {};
    obj.pub_key_request = message.pubKeyRequest ? PubKeyRequest.toAmino(message.pubKeyRequest) : undefined;
    obj.pub_key_response = message.pubKeyResponse ? PubKeyResponse.toAmino(message.pubKeyResponse) : undefined;
    obj.sign_vote_request = message.signVoteRequest ? SignVoteRequest.toAmino(message.signVoteRequest) : undefined;
    obj.signed_vote_response = message.signedVoteResponse ? SignedVoteResponse.toAmino(message.signedVoteResponse) : undefined;
    obj.sign_proposal_request = message.signProposalRequest ? SignProposalRequest.toAmino(message.signProposalRequest) : undefined;
    obj.signed_proposal_response = message.signedProposalResponse ? SignedProposalResponse.toAmino(message.signedProposalResponse) : undefined;
    obj.ping_request = message.pingRequest ? PingRequest.toAmino(message.pingRequest) : undefined;
    obj.ping_response = message.pingResponse ? PingResponse.toAmino(message.pingResponse) : undefined;
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
      typeUrl: "/tendermint.privval.Message",
      value: Message.encode(message).finish()
    };
  }
};