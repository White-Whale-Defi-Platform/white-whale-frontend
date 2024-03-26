import { PartSetHeader, PartSetHeaderAmino, PartSetHeaderSDKType, Part, PartAmino, PartSDKType, SignedMsgType, BlockID, BlockIDAmino, BlockIDSDKType } from "../types/types";
import { Proposal as Proposal1 } from "../types/types";
import { ProposalAmino as Proposal1Amino } from "../types/types";
import { ProposalSDKType as Proposal1SDKType } from "../types/types";
import { Vote as Vote1 } from "../types/types";
import { VoteAmino as Vote1Amino } from "../types/types";
import { VoteSDKType as Vote1SDKType } from "../types/types";
import { BitArray, BitArrayAmino, BitArraySDKType } from "../libs/bits/types";
import { BinaryReader, BinaryWriter } from "../../binary";
import { DeepPartial } from "../../helpers";
/**
 * NewRoundStep is sent for every step taken in the ConsensusState.
 * For every height/round/step transition
 */
export interface NewRoundStep {
  height: bigint;
  round: number;
  step: number;
  secondsSinceStartTime: bigint;
  lastCommitRound: number;
}
export interface NewRoundStepProtoMsg {
  typeUrl: "/tendermint.consensus.NewRoundStep";
  value: Uint8Array;
}
/**
 * NewRoundStep is sent for every step taken in the ConsensusState.
 * For every height/round/step transition
 */
export interface NewRoundStepAmino {
  height?: string;
  round?: number;
  step?: number;
  seconds_since_start_time?: string;
  last_commit_round?: number;
}
export interface NewRoundStepAminoMsg {
  type: "/tendermint.consensus.NewRoundStep";
  value: NewRoundStepAmino;
}
/**
 * NewRoundStep is sent for every step taken in the ConsensusState.
 * For every height/round/step transition
 */
export interface NewRoundStepSDKType {
  height: bigint;
  round: number;
  step: number;
  seconds_since_start_time: bigint;
  last_commit_round: number;
}
/**
 * NewValidBlock is sent when a validator observes a valid block B in some round r,
 * i.e., there is a Proposal for block B and 2/3+ prevotes for the block B in the round r.
 * In case the block is also committed, then IsCommit flag is set to true.
 */
export interface NewValidBlock {
  height: bigint;
  round: number;
  blockPartSetHeader: PartSetHeader;
  blockParts?: BitArray;
  isCommit: boolean;
}
export interface NewValidBlockProtoMsg {
  typeUrl: "/tendermint.consensus.NewValidBlock";
  value: Uint8Array;
}
/**
 * NewValidBlock is sent when a validator observes a valid block B in some round r,
 * i.e., there is a Proposal for block B and 2/3+ prevotes for the block B in the round r.
 * In case the block is also committed, then IsCommit flag is set to true.
 */
export interface NewValidBlockAmino {
  height?: string;
  round?: number;
  block_part_set_header?: PartSetHeaderAmino;
  block_parts?: BitArrayAmino;
  is_commit?: boolean;
}
export interface NewValidBlockAminoMsg {
  type: "/tendermint.consensus.NewValidBlock";
  value: NewValidBlockAmino;
}
/**
 * NewValidBlock is sent when a validator observes a valid block B in some round r,
 * i.e., there is a Proposal for block B and 2/3+ prevotes for the block B in the round r.
 * In case the block is also committed, then IsCommit flag is set to true.
 */
export interface NewValidBlockSDKType {
  height: bigint;
  round: number;
  block_part_set_header: PartSetHeaderSDKType;
  block_parts?: BitArraySDKType;
  is_commit: boolean;
}
/** Proposal is sent when a new block is proposed. */
export interface Proposal {
  proposal: Proposal1;
}
export interface ProposalProtoMsg {
  typeUrl: "/tendermint.consensus.Proposal";
  value: Uint8Array;
}
/** Proposal is sent when a new block is proposed. */
export interface ProposalAmino {
  proposal?: Proposal1Amino;
}
export interface ProposalAminoMsg {
  type: "/tendermint.consensus.Proposal";
  value: ProposalAmino;
}
/** Proposal is sent when a new block is proposed. */
export interface ProposalSDKType {
  proposal: Proposal1SDKType;
}
/** ProposalPOL is sent when a previous proposal is re-proposed. */
export interface ProposalPOL {
  height: bigint;
  proposalPolRound: number;
  proposalPol: BitArray;
}
export interface ProposalPOLProtoMsg {
  typeUrl: "/tendermint.consensus.ProposalPOL";
  value: Uint8Array;
}
/** ProposalPOL is sent when a previous proposal is re-proposed. */
export interface ProposalPOLAmino {
  height?: string;
  proposal_pol_round?: number;
  proposal_pol?: BitArrayAmino;
}
export interface ProposalPOLAminoMsg {
  type: "/tendermint.consensus.ProposalPOL";
  value: ProposalPOLAmino;
}
/** ProposalPOL is sent when a previous proposal is re-proposed. */
export interface ProposalPOLSDKType {
  height: bigint;
  proposal_pol_round: number;
  proposal_pol: BitArraySDKType;
}
/** BlockPart is sent when gossipping a piece of the proposed block. */
export interface BlockPart {
  height: bigint;
  round: number;
  part: Part;
}
export interface BlockPartProtoMsg {
  typeUrl: "/tendermint.consensus.BlockPart";
  value: Uint8Array;
}
/** BlockPart is sent when gossipping a piece of the proposed block. */
export interface BlockPartAmino {
  height?: string;
  round?: number;
  part?: PartAmino;
}
export interface BlockPartAminoMsg {
  type: "/tendermint.consensus.BlockPart";
  value: BlockPartAmino;
}
/** BlockPart is sent when gossipping a piece of the proposed block. */
export interface BlockPartSDKType {
  height: bigint;
  round: number;
  part: PartSDKType;
}
/** Vote is sent when voting for a proposal (or lack thereof). */
export interface Vote {
  vote?: Vote1;
}
export interface VoteProtoMsg {
  typeUrl: "/tendermint.consensus.Vote";
  value: Uint8Array;
}
/** Vote is sent when voting for a proposal (or lack thereof). */
export interface VoteAmino {
  vote?: Vote1Amino;
}
export interface VoteAminoMsg {
  type: "/tendermint.consensus.Vote";
  value: VoteAmino;
}
/** Vote is sent when voting for a proposal (or lack thereof). */
export interface VoteSDKType {
  vote?: Vote1SDKType;
}
/** HasVote is sent to indicate that a particular vote has been received. */
export interface HasVote {
  height: bigint;
  round: number;
  type: SignedMsgType;
  index: number;
}
export interface HasVoteProtoMsg {
  typeUrl: "/tendermint.consensus.HasVote";
  value: Uint8Array;
}
/** HasVote is sent to indicate that a particular vote has been received. */
export interface HasVoteAmino {
  height?: string;
  round?: number;
  type?: SignedMsgType;
  index?: number;
}
export interface HasVoteAminoMsg {
  type: "/tendermint.consensus.HasVote";
  value: HasVoteAmino;
}
/** HasVote is sent to indicate that a particular vote has been received. */
export interface HasVoteSDKType {
  height: bigint;
  round: number;
  type: SignedMsgType;
  index: number;
}
/** VoteSetMaj23 is sent to indicate that a given BlockID has seen +2/3 votes. */
export interface VoteSetMaj23 {
  height: bigint;
  round: number;
  type: SignedMsgType;
  blockId: BlockID;
}
export interface VoteSetMaj23ProtoMsg {
  typeUrl: "/tendermint.consensus.VoteSetMaj23";
  value: Uint8Array;
}
/** VoteSetMaj23 is sent to indicate that a given BlockID has seen +2/3 votes. */
export interface VoteSetMaj23Amino {
  height?: string;
  round?: number;
  type?: SignedMsgType;
  block_id?: BlockIDAmino;
}
export interface VoteSetMaj23AminoMsg {
  type: "/tendermint.consensus.VoteSetMaj23";
  value: VoteSetMaj23Amino;
}
/** VoteSetMaj23 is sent to indicate that a given BlockID has seen +2/3 votes. */
export interface VoteSetMaj23SDKType {
  height: bigint;
  round: number;
  type: SignedMsgType;
  block_id: BlockIDSDKType;
}
/** VoteSetBits is sent to communicate the bit-array of votes seen for the BlockID. */
export interface VoteSetBits {
  height: bigint;
  round: number;
  type: SignedMsgType;
  blockId: BlockID;
  votes: BitArray;
}
export interface VoteSetBitsProtoMsg {
  typeUrl: "/tendermint.consensus.VoteSetBits";
  value: Uint8Array;
}
/** VoteSetBits is sent to communicate the bit-array of votes seen for the BlockID. */
export interface VoteSetBitsAmino {
  height?: string;
  round?: number;
  type?: SignedMsgType;
  block_id?: BlockIDAmino;
  votes?: BitArrayAmino;
}
export interface VoteSetBitsAminoMsg {
  type: "/tendermint.consensus.VoteSetBits";
  value: VoteSetBitsAmino;
}
/** VoteSetBits is sent to communicate the bit-array of votes seen for the BlockID. */
export interface VoteSetBitsSDKType {
  height: bigint;
  round: number;
  type: SignedMsgType;
  block_id: BlockIDSDKType;
  votes: BitArraySDKType;
}
export interface Message {
  newRoundStep?: NewRoundStep;
  newValidBlock?: NewValidBlock;
  proposal?: Proposal;
  proposalPol?: ProposalPOL;
  blockPart?: BlockPart;
  vote?: Vote;
  hasVote?: HasVote;
  voteSetMaj23?: VoteSetMaj23;
  voteSetBits?: VoteSetBits;
}
export interface MessageProtoMsg {
  typeUrl: "/tendermint.consensus.Message";
  value: Uint8Array;
}
export interface MessageAmino {
  new_round_step?: NewRoundStepAmino;
  new_valid_block?: NewValidBlockAmino;
  proposal?: ProposalAmino;
  proposal_pol?: ProposalPOLAmino;
  block_part?: BlockPartAmino;
  vote?: VoteAmino;
  has_vote?: HasVoteAmino;
  vote_set_maj23?: VoteSetMaj23Amino;
  vote_set_bits?: VoteSetBitsAmino;
}
export interface MessageAminoMsg {
  type: "/tendermint.consensus.Message";
  value: MessageAmino;
}
export interface MessageSDKType {
  new_round_step?: NewRoundStepSDKType;
  new_valid_block?: NewValidBlockSDKType;
  proposal?: ProposalSDKType;
  proposal_pol?: ProposalPOLSDKType;
  block_part?: BlockPartSDKType;
  vote?: VoteSDKType;
  has_vote?: HasVoteSDKType;
  vote_set_maj23?: VoteSetMaj23SDKType;
  vote_set_bits?: VoteSetBitsSDKType;
}
function createBaseNewRoundStep(): NewRoundStep {
  return {
    height: BigInt(0),
    round: 0,
    step: 0,
    secondsSinceStartTime: BigInt(0),
    lastCommitRound: 0
  };
}
export const NewRoundStep = {
  typeUrl: "/tendermint.consensus.NewRoundStep",
  encode(message: NewRoundStep, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.height !== BigInt(0)) {
      writer.uint32(8).int64(message.height);
    }
    if (message.round !== 0) {
      writer.uint32(16).int32(message.round);
    }
    if (message.step !== 0) {
      writer.uint32(24).uint32(message.step);
    }
    if (message.secondsSinceStartTime !== BigInt(0)) {
      writer.uint32(32).int64(message.secondsSinceStartTime);
    }
    if (message.lastCommitRound !== 0) {
      writer.uint32(40).int32(message.lastCommitRound);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): NewRoundStep {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseNewRoundStep();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.height = reader.int64();
          break;
        case 2:
          message.round = reader.int32();
          break;
        case 3:
          message.step = reader.uint32();
          break;
        case 4:
          message.secondsSinceStartTime = reader.int64();
          break;
        case 5:
          message.lastCommitRound = reader.int32();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: DeepPartial<NewRoundStep>): NewRoundStep {
    const message = createBaseNewRoundStep();
    message.height = object.height !== undefined && object.height !== null ? BigInt(object.height.toString()) : BigInt(0);
    message.round = object.round ?? 0;
    message.step = object.step ?? 0;
    message.secondsSinceStartTime = object.secondsSinceStartTime !== undefined && object.secondsSinceStartTime !== null ? BigInt(object.secondsSinceStartTime.toString()) : BigInt(0);
    message.lastCommitRound = object.lastCommitRound ?? 0;
    return message;
  },
  fromAmino(object: NewRoundStepAmino): NewRoundStep {
    const message = createBaseNewRoundStep();
    if (object.height !== undefined && object.height !== null) {
      message.height = BigInt(object.height);
    }
    if (object.round !== undefined && object.round !== null) {
      message.round = object.round;
    }
    if (object.step !== undefined && object.step !== null) {
      message.step = object.step;
    }
    if (object.seconds_since_start_time !== undefined && object.seconds_since_start_time !== null) {
      message.secondsSinceStartTime = BigInt(object.seconds_since_start_time);
    }
    if (object.last_commit_round !== undefined && object.last_commit_round !== null) {
      message.lastCommitRound = object.last_commit_round;
    }
    return message;
  },
  toAmino(message: NewRoundStep): NewRoundStepAmino {
    const obj: any = {};
    obj.height = message.height !== BigInt(0) ? message.height.toString() : undefined;
    obj.round = message.round === 0 ? undefined : message.round;
    obj.step = message.step === 0 ? undefined : message.step;
    obj.seconds_since_start_time = message.secondsSinceStartTime !== BigInt(0) ? message.secondsSinceStartTime.toString() : undefined;
    obj.last_commit_round = message.lastCommitRound === 0 ? undefined : message.lastCommitRound;
    return obj;
  },
  fromAminoMsg(object: NewRoundStepAminoMsg): NewRoundStep {
    return NewRoundStep.fromAmino(object.value);
  },
  fromProtoMsg(message: NewRoundStepProtoMsg): NewRoundStep {
    return NewRoundStep.decode(message.value);
  },
  toProto(message: NewRoundStep): Uint8Array {
    return NewRoundStep.encode(message).finish();
  },
  toProtoMsg(message: NewRoundStep): NewRoundStepProtoMsg {
    return {
      typeUrl: "/tendermint.consensus.NewRoundStep",
      value: NewRoundStep.encode(message).finish()
    };
  }
};
function createBaseNewValidBlock(): NewValidBlock {
  return {
    height: BigInt(0),
    round: 0,
    blockPartSetHeader: PartSetHeader.fromPartial({}),
    blockParts: undefined,
    isCommit: false
  };
}
export const NewValidBlock = {
  typeUrl: "/tendermint.consensus.NewValidBlock",
  encode(message: NewValidBlock, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.height !== BigInt(0)) {
      writer.uint32(8).int64(message.height);
    }
    if (message.round !== 0) {
      writer.uint32(16).int32(message.round);
    }
    if (message.blockPartSetHeader !== undefined) {
      PartSetHeader.encode(message.blockPartSetHeader, writer.uint32(26).fork()).ldelim();
    }
    if (message.blockParts !== undefined) {
      BitArray.encode(message.blockParts, writer.uint32(34).fork()).ldelim();
    }
    if (message.isCommit === true) {
      writer.uint32(40).bool(message.isCommit);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): NewValidBlock {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseNewValidBlock();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.height = reader.int64();
          break;
        case 2:
          message.round = reader.int32();
          break;
        case 3:
          message.blockPartSetHeader = PartSetHeader.decode(reader, reader.uint32());
          break;
        case 4:
          message.blockParts = BitArray.decode(reader, reader.uint32());
          break;
        case 5:
          message.isCommit = reader.bool();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: DeepPartial<NewValidBlock>): NewValidBlock {
    const message = createBaseNewValidBlock();
    message.height = object.height !== undefined && object.height !== null ? BigInt(object.height.toString()) : BigInt(0);
    message.round = object.round ?? 0;
    message.blockPartSetHeader = object.blockPartSetHeader !== undefined && object.blockPartSetHeader !== null ? PartSetHeader.fromPartial(object.blockPartSetHeader) : undefined;
    message.blockParts = object.blockParts !== undefined && object.blockParts !== null ? BitArray.fromPartial(object.blockParts) : undefined;
    message.isCommit = object.isCommit ?? false;
    return message;
  },
  fromAmino(object: NewValidBlockAmino): NewValidBlock {
    const message = createBaseNewValidBlock();
    if (object.height !== undefined && object.height !== null) {
      message.height = BigInt(object.height);
    }
    if (object.round !== undefined && object.round !== null) {
      message.round = object.round;
    }
    if (object.block_part_set_header !== undefined && object.block_part_set_header !== null) {
      message.blockPartSetHeader = PartSetHeader.fromAmino(object.block_part_set_header);
    }
    if (object.block_parts !== undefined && object.block_parts !== null) {
      message.blockParts = BitArray.fromAmino(object.block_parts);
    }
    if (object.is_commit !== undefined && object.is_commit !== null) {
      message.isCommit = object.is_commit;
    }
    return message;
  },
  toAmino(message: NewValidBlock): NewValidBlockAmino {
    const obj: any = {};
    obj.height = message.height !== BigInt(0) ? message.height.toString() : undefined;
    obj.round = message.round === 0 ? undefined : message.round;
    obj.block_part_set_header = message.blockPartSetHeader ? PartSetHeader.toAmino(message.blockPartSetHeader) : undefined;
    obj.block_parts = message.blockParts ? BitArray.toAmino(message.blockParts) : undefined;
    obj.is_commit = message.isCommit === false ? undefined : message.isCommit;
    return obj;
  },
  fromAminoMsg(object: NewValidBlockAminoMsg): NewValidBlock {
    return NewValidBlock.fromAmino(object.value);
  },
  fromProtoMsg(message: NewValidBlockProtoMsg): NewValidBlock {
    return NewValidBlock.decode(message.value);
  },
  toProto(message: NewValidBlock): Uint8Array {
    return NewValidBlock.encode(message).finish();
  },
  toProtoMsg(message: NewValidBlock): NewValidBlockProtoMsg {
    return {
      typeUrl: "/tendermint.consensus.NewValidBlock",
      value: NewValidBlock.encode(message).finish()
    };
  }
};
function createBaseProposal(): Proposal {
  return {
    proposal: Proposal1.fromPartial({})
  };
}
export const Proposal = {
  typeUrl: "/tendermint.consensus.Proposal",
  encode(message: Proposal, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.proposal !== undefined) {
      Proposal1.encode(message.proposal, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): Proposal {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseProposal();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.proposal = Proposal1.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: DeepPartial<Proposal>): Proposal {
    const message = createBaseProposal();
    message.proposal = object.proposal !== undefined && object.proposal !== null ? Proposal1.fromPartial(object.proposal) : undefined;
    return message;
  },
  fromAmino(object: ProposalAmino): Proposal {
    const message = createBaseProposal();
    if (object.proposal !== undefined && object.proposal !== null) {
      message.proposal = Proposal1.fromAmino(object.proposal);
    }
    return message;
  },
  toAmino(message: Proposal): ProposalAmino {
    const obj: any = {};
    obj.proposal = message.proposal ? Proposal1.toAmino(message.proposal) : undefined;
    return obj;
  },
  fromAminoMsg(object: ProposalAminoMsg): Proposal {
    return Proposal.fromAmino(object.value);
  },
  fromProtoMsg(message: ProposalProtoMsg): Proposal {
    return Proposal.decode(message.value);
  },
  toProto(message: Proposal): Uint8Array {
    return Proposal.encode(message).finish();
  },
  toProtoMsg(message: Proposal): ProposalProtoMsg {
    return {
      typeUrl: "/tendermint.consensus.Proposal",
      value: Proposal.encode(message).finish()
    };
  }
};
function createBaseProposalPOL(): ProposalPOL {
  return {
    height: BigInt(0),
    proposalPolRound: 0,
    proposalPol: BitArray.fromPartial({})
  };
}
export const ProposalPOL = {
  typeUrl: "/tendermint.consensus.ProposalPOL",
  encode(message: ProposalPOL, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.height !== BigInt(0)) {
      writer.uint32(8).int64(message.height);
    }
    if (message.proposalPolRound !== 0) {
      writer.uint32(16).int32(message.proposalPolRound);
    }
    if (message.proposalPol !== undefined) {
      BitArray.encode(message.proposalPol, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): ProposalPOL {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseProposalPOL();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.height = reader.int64();
          break;
        case 2:
          message.proposalPolRound = reader.int32();
          break;
        case 3:
          message.proposalPol = BitArray.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: DeepPartial<ProposalPOL>): ProposalPOL {
    const message = createBaseProposalPOL();
    message.height = object.height !== undefined && object.height !== null ? BigInt(object.height.toString()) : BigInt(0);
    message.proposalPolRound = object.proposalPolRound ?? 0;
    message.proposalPol = object.proposalPol !== undefined && object.proposalPol !== null ? BitArray.fromPartial(object.proposalPol) : undefined;
    return message;
  },
  fromAmino(object: ProposalPOLAmino): ProposalPOL {
    const message = createBaseProposalPOL();
    if (object.height !== undefined && object.height !== null) {
      message.height = BigInt(object.height);
    }
    if (object.proposal_pol_round !== undefined && object.proposal_pol_round !== null) {
      message.proposalPolRound = object.proposal_pol_round;
    }
    if (object.proposal_pol !== undefined && object.proposal_pol !== null) {
      message.proposalPol = BitArray.fromAmino(object.proposal_pol);
    }
    return message;
  },
  toAmino(message: ProposalPOL): ProposalPOLAmino {
    const obj: any = {};
    obj.height = message.height !== BigInt(0) ? message.height.toString() : undefined;
    obj.proposal_pol_round = message.proposalPolRound === 0 ? undefined : message.proposalPolRound;
    obj.proposal_pol = message.proposalPol ? BitArray.toAmino(message.proposalPol) : undefined;
    return obj;
  },
  fromAminoMsg(object: ProposalPOLAminoMsg): ProposalPOL {
    return ProposalPOL.fromAmino(object.value);
  },
  fromProtoMsg(message: ProposalPOLProtoMsg): ProposalPOL {
    return ProposalPOL.decode(message.value);
  },
  toProto(message: ProposalPOL): Uint8Array {
    return ProposalPOL.encode(message).finish();
  },
  toProtoMsg(message: ProposalPOL): ProposalPOLProtoMsg {
    return {
      typeUrl: "/tendermint.consensus.ProposalPOL",
      value: ProposalPOL.encode(message).finish()
    };
  }
};
function createBaseBlockPart(): BlockPart {
  return {
    height: BigInt(0),
    round: 0,
    part: Part.fromPartial({})
  };
}
export const BlockPart = {
  typeUrl: "/tendermint.consensus.BlockPart",
  encode(message: BlockPart, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.height !== BigInt(0)) {
      writer.uint32(8).int64(message.height);
    }
    if (message.round !== 0) {
      writer.uint32(16).int32(message.round);
    }
    if (message.part !== undefined) {
      Part.encode(message.part, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): BlockPart {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseBlockPart();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.height = reader.int64();
          break;
        case 2:
          message.round = reader.int32();
          break;
        case 3:
          message.part = Part.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: DeepPartial<BlockPart>): BlockPart {
    const message = createBaseBlockPart();
    message.height = object.height !== undefined && object.height !== null ? BigInt(object.height.toString()) : BigInt(0);
    message.round = object.round ?? 0;
    message.part = object.part !== undefined && object.part !== null ? Part.fromPartial(object.part) : undefined;
    return message;
  },
  fromAmino(object: BlockPartAmino): BlockPart {
    const message = createBaseBlockPart();
    if (object.height !== undefined && object.height !== null) {
      message.height = BigInt(object.height);
    }
    if (object.round !== undefined && object.round !== null) {
      message.round = object.round;
    }
    if (object.part !== undefined && object.part !== null) {
      message.part = Part.fromAmino(object.part);
    }
    return message;
  },
  toAmino(message: BlockPart): BlockPartAmino {
    const obj: any = {};
    obj.height = message.height !== BigInt(0) ? message.height.toString() : undefined;
    obj.round = message.round === 0 ? undefined : message.round;
    obj.part = message.part ? Part.toAmino(message.part) : undefined;
    return obj;
  },
  fromAminoMsg(object: BlockPartAminoMsg): BlockPart {
    return BlockPart.fromAmino(object.value);
  },
  fromProtoMsg(message: BlockPartProtoMsg): BlockPart {
    return BlockPart.decode(message.value);
  },
  toProto(message: BlockPart): Uint8Array {
    return BlockPart.encode(message).finish();
  },
  toProtoMsg(message: BlockPart): BlockPartProtoMsg {
    return {
      typeUrl: "/tendermint.consensus.BlockPart",
      value: BlockPart.encode(message).finish()
    };
  }
};
function createBaseVote(): Vote {
  return {
    vote: undefined
  };
}
export const Vote = {
  typeUrl: "/tendermint.consensus.Vote",
  encode(message: Vote, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.vote !== undefined) {
      Vote1.encode(message.vote, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): Vote {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseVote();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.vote = Vote1.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: DeepPartial<Vote>): Vote {
    const message = createBaseVote();
    message.vote = object.vote !== undefined && object.vote !== null ? Vote1.fromPartial(object.vote) : undefined;
    return message;
  },
  fromAmino(object: VoteAmino): Vote {
    const message = createBaseVote();
    if (object.vote !== undefined && object.vote !== null) {
      message.vote = Vote1.fromAmino(object.vote);
    }
    return message;
  },
  toAmino(message: Vote): VoteAmino {
    const obj: any = {};
    obj.vote = message.vote ? Vote1.toAmino(message.vote) : undefined;
    return obj;
  },
  fromAminoMsg(object: VoteAminoMsg): Vote {
    return Vote.fromAmino(object.value);
  },
  fromProtoMsg(message: VoteProtoMsg): Vote {
    return Vote.decode(message.value);
  },
  toProto(message: Vote): Uint8Array {
    return Vote.encode(message).finish();
  },
  toProtoMsg(message: Vote): VoteProtoMsg {
    return {
      typeUrl: "/tendermint.consensus.Vote",
      value: Vote.encode(message).finish()
    };
  }
};
function createBaseHasVote(): HasVote {
  return {
    height: BigInt(0),
    round: 0,
    type: 0,
    index: 0
  };
}
export const HasVote = {
  typeUrl: "/tendermint.consensus.HasVote",
  encode(message: HasVote, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.height !== BigInt(0)) {
      writer.uint32(8).int64(message.height);
    }
    if (message.round !== 0) {
      writer.uint32(16).int32(message.round);
    }
    if (message.type !== 0) {
      writer.uint32(24).int32(message.type);
    }
    if (message.index !== 0) {
      writer.uint32(32).int32(message.index);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): HasVote {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseHasVote();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.height = reader.int64();
          break;
        case 2:
          message.round = reader.int32();
          break;
        case 3:
          message.type = (reader.int32() as any);
          break;
        case 4:
          message.index = reader.int32();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: DeepPartial<HasVote>): HasVote {
    const message = createBaseHasVote();
    message.height = object.height !== undefined && object.height !== null ? BigInt(object.height.toString()) : BigInt(0);
    message.round = object.round ?? 0;
    message.type = object.type ?? 0;
    message.index = object.index ?? 0;
    return message;
  },
  fromAmino(object: HasVoteAmino): HasVote {
    const message = createBaseHasVote();
    if (object.height !== undefined && object.height !== null) {
      message.height = BigInt(object.height);
    }
    if (object.round !== undefined && object.round !== null) {
      message.round = object.round;
    }
    if (object.type !== undefined && object.type !== null) {
      message.type = object.type;
    }
    if (object.index !== undefined && object.index !== null) {
      message.index = object.index;
    }
    return message;
  },
  toAmino(message: HasVote): HasVoteAmino {
    const obj: any = {};
    obj.height = message.height !== BigInt(0) ? message.height.toString() : undefined;
    obj.round = message.round === 0 ? undefined : message.round;
    obj.type = message.type === 0 ? undefined : message.type;
    obj.index = message.index === 0 ? undefined : message.index;
    return obj;
  },
  fromAminoMsg(object: HasVoteAminoMsg): HasVote {
    return HasVote.fromAmino(object.value);
  },
  fromProtoMsg(message: HasVoteProtoMsg): HasVote {
    return HasVote.decode(message.value);
  },
  toProto(message: HasVote): Uint8Array {
    return HasVote.encode(message).finish();
  },
  toProtoMsg(message: HasVote): HasVoteProtoMsg {
    return {
      typeUrl: "/tendermint.consensus.HasVote",
      value: HasVote.encode(message).finish()
    };
  }
};
function createBaseVoteSetMaj23(): VoteSetMaj23 {
  return {
    height: BigInt(0),
    round: 0,
    type: 0,
    blockId: BlockID.fromPartial({})
  };
}
export const VoteSetMaj23 = {
  typeUrl: "/tendermint.consensus.VoteSetMaj23",
  encode(message: VoteSetMaj23, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.height !== BigInt(0)) {
      writer.uint32(8).int64(message.height);
    }
    if (message.round !== 0) {
      writer.uint32(16).int32(message.round);
    }
    if (message.type !== 0) {
      writer.uint32(24).int32(message.type);
    }
    if (message.blockId !== undefined) {
      BlockID.encode(message.blockId, writer.uint32(34).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): VoteSetMaj23 {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseVoteSetMaj23();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.height = reader.int64();
          break;
        case 2:
          message.round = reader.int32();
          break;
        case 3:
          message.type = (reader.int32() as any);
          break;
        case 4:
          message.blockId = BlockID.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: DeepPartial<VoteSetMaj23>): VoteSetMaj23 {
    const message = createBaseVoteSetMaj23();
    message.height = object.height !== undefined && object.height !== null ? BigInt(object.height.toString()) : BigInt(0);
    message.round = object.round ?? 0;
    message.type = object.type ?? 0;
    message.blockId = object.blockId !== undefined && object.blockId !== null ? BlockID.fromPartial(object.blockId) : undefined;
    return message;
  },
  fromAmino(object: VoteSetMaj23Amino): VoteSetMaj23 {
    const message = createBaseVoteSetMaj23();
    if (object.height !== undefined && object.height !== null) {
      message.height = BigInt(object.height);
    }
    if (object.round !== undefined && object.round !== null) {
      message.round = object.round;
    }
    if (object.type !== undefined && object.type !== null) {
      message.type = object.type;
    }
    if (object.block_id !== undefined && object.block_id !== null) {
      message.blockId = BlockID.fromAmino(object.block_id);
    }
    return message;
  },
  toAmino(message: VoteSetMaj23): VoteSetMaj23Amino {
    const obj: any = {};
    obj.height = message.height !== BigInt(0) ? message.height.toString() : undefined;
    obj.round = message.round === 0 ? undefined : message.round;
    obj.type = message.type === 0 ? undefined : message.type;
    obj.block_id = message.blockId ? BlockID.toAmino(message.blockId) : undefined;
    return obj;
  },
  fromAminoMsg(object: VoteSetMaj23AminoMsg): VoteSetMaj23 {
    return VoteSetMaj23.fromAmino(object.value);
  },
  fromProtoMsg(message: VoteSetMaj23ProtoMsg): VoteSetMaj23 {
    return VoteSetMaj23.decode(message.value);
  },
  toProto(message: VoteSetMaj23): Uint8Array {
    return VoteSetMaj23.encode(message).finish();
  },
  toProtoMsg(message: VoteSetMaj23): VoteSetMaj23ProtoMsg {
    return {
      typeUrl: "/tendermint.consensus.VoteSetMaj23",
      value: VoteSetMaj23.encode(message).finish()
    };
  }
};
function createBaseVoteSetBits(): VoteSetBits {
  return {
    height: BigInt(0),
    round: 0,
    type: 0,
    blockId: BlockID.fromPartial({}),
    votes: BitArray.fromPartial({})
  };
}
export const VoteSetBits = {
  typeUrl: "/tendermint.consensus.VoteSetBits",
  encode(message: VoteSetBits, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.height !== BigInt(0)) {
      writer.uint32(8).int64(message.height);
    }
    if (message.round !== 0) {
      writer.uint32(16).int32(message.round);
    }
    if (message.type !== 0) {
      writer.uint32(24).int32(message.type);
    }
    if (message.blockId !== undefined) {
      BlockID.encode(message.blockId, writer.uint32(34).fork()).ldelim();
    }
    if (message.votes !== undefined) {
      BitArray.encode(message.votes, writer.uint32(42).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): VoteSetBits {
    const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseVoteSetBits();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.height = reader.int64();
          break;
        case 2:
          message.round = reader.int32();
          break;
        case 3:
          message.type = (reader.int32() as any);
          break;
        case 4:
          message.blockId = BlockID.decode(reader, reader.uint32());
          break;
        case 5:
          message.votes = BitArray.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: DeepPartial<VoteSetBits>): VoteSetBits {
    const message = createBaseVoteSetBits();
    message.height = object.height !== undefined && object.height !== null ? BigInt(object.height.toString()) : BigInt(0);
    message.round = object.round ?? 0;
    message.type = object.type ?? 0;
    message.blockId = object.blockId !== undefined && object.blockId !== null ? BlockID.fromPartial(object.blockId) : undefined;
    message.votes = object.votes !== undefined && object.votes !== null ? BitArray.fromPartial(object.votes) : undefined;
    return message;
  },
  fromAmino(object: VoteSetBitsAmino): VoteSetBits {
    const message = createBaseVoteSetBits();
    if (object.height !== undefined && object.height !== null) {
      message.height = BigInt(object.height);
    }
    if (object.round !== undefined && object.round !== null) {
      message.round = object.round;
    }
    if (object.type !== undefined && object.type !== null) {
      message.type = object.type;
    }
    if (object.block_id !== undefined && object.block_id !== null) {
      message.blockId = BlockID.fromAmino(object.block_id);
    }
    if (object.votes !== undefined && object.votes !== null) {
      message.votes = BitArray.fromAmino(object.votes);
    }
    return message;
  },
  toAmino(message: VoteSetBits): VoteSetBitsAmino {
    const obj: any = {};
    obj.height = message.height !== BigInt(0) ? message.height.toString() : undefined;
    obj.round = message.round === 0 ? undefined : message.round;
    obj.type = message.type === 0 ? undefined : message.type;
    obj.block_id = message.blockId ? BlockID.toAmino(message.blockId) : undefined;
    obj.votes = message.votes ? BitArray.toAmino(message.votes) : undefined;
    return obj;
  },
  fromAminoMsg(object: VoteSetBitsAminoMsg): VoteSetBits {
    return VoteSetBits.fromAmino(object.value);
  },
  fromProtoMsg(message: VoteSetBitsProtoMsg): VoteSetBits {
    return VoteSetBits.decode(message.value);
  },
  toProto(message: VoteSetBits): Uint8Array {
    return VoteSetBits.encode(message).finish();
  },
  toProtoMsg(message: VoteSetBits): VoteSetBitsProtoMsg {
    return {
      typeUrl: "/tendermint.consensus.VoteSetBits",
      value: VoteSetBits.encode(message).finish()
    };
  }
};
function createBaseMessage(): Message {
  return {
    newRoundStep: undefined,
    newValidBlock: undefined,
    proposal: undefined,
    proposalPol: undefined,
    blockPart: undefined,
    vote: undefined,
    hasVote: undefined,
    voteSetMaj23: undefined,
    voteSetBits: undefined
  };
}
export const Message = {
  typeUrl: "/tendermint.consensus.Message",
  encode(message: Message, writer: BinaryWriter = BinaryWriter.create()): BinaryWriter {
    if (message.newRoundStep !== undefined) {
      NewRoundStep.encode(message.newRoundStep, writer.uint32(10).fork()).ldelim();
    }
    if (message.newValidBlock !== undefined) {
      NewValidBlock.encode(message.newValidBlock, writer.uint32(18).fork()).ldelim();
    }
    if (message.proposal !== undefined) {
      Proposal.encode(message.proposal, writer.uint32(26).fork()).ldelim();
    }
    if (message.proposalPol !== undefined) {
      ProposalPOL.encode(message.proposalPol, writer.uint32(34).fork()).ldelim();
    }
    if (message.blockPart !== undefined) {
      BlockPart.encode(message.blockPart, writer.uint32(42).fork()).ldelim();
    }
    if (message.vote !== undefined) {
      Vote.encode(message.vote, writer.uint32(50).fork()).ldelim();
    }
    if (message.hasVote !== undefined) {
      HasVote.encode(message.hasVote, writer.uint32(58).fork()).ldelim();
    }
    if (message.voteSetMaj23 !== undefined) {
      VoteSetMaj23.encode(message.voteSetMaj23, writer.uint32(66).fork()).ldelim();
    }
    if (message.voteSetBits !== undefined) {
      VoteSetBits.encode(message.voteSetBits, writer.uint32(74).fork()).ldelim();
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
          message.newRoundStep = NewRoundStep.decode(reader, reader.uint32());
          break;
        case 2:
          message.newValidBlock = NewValidBlock.decode(reader, reader.uint32());
          break;
        case 3:
          message.proposal = Proposal.decode(reader, reader.uint32());
          break;
        case 4:
          message.proposalPol = ProposalPOL.decode(reader, reader.uint32());
          break;
        case 5:
          message.blockPart = BlockPart.decode(reader, reader.uint32());
          break;
        case 6:
          message.vote = Vote.decode(reader, reader.uint32());
          break;
        case 7:
          message.hasVote = HasVote.decode(reader, reader.uint32());
          break;
        case 8:
          message.voteSetMaj23 = VoteSetMaj23.decode(reader, reader.uint32());
          break;
        case 9:
          message.voteSetBits = VoteSetBits.decode(reader, reader.uint32());
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
    message.newRoundStep = object.newRoundStep !== undefined && object.newRoundStep !== null ? NewRoundStep.fromPartial(object.newRoundStep) : undefined;
    message.newValidBlock = object.newValidBlock !== undefined && object.newValidBlock !== null ? NewValidBlock.fromPartial(object.newValidBlock) : undefined;
    message.proposal = object.proposal !== undefined && object.proposal !== null ? Proposal.fromPartial(object.proposal) : undefined;
    message.proposalPol = object.proposalPol !== undefined && object.proposalPol !== null ? ProposalPOL.fromPartial(object.proposalPol) : undefined;
    message.blockPart = object.blockPart !== undefined && object.blockPart !== null ? BlockPart.fromPartial(object.blockPart) : undefined;
    message.vote = object.vote !== undefined && object.vote !== null ? Vote.fromPartial(object.vote) : undefined;
    message.hasVote = object.hasVote !== undefined && object.hasVote !== null ? HasVote.fromPartial(object.hasVote) : undefined;
    message.voteSetMaj23 = object.voteSetMaj23 !== undefined && object.voteSetMaj23 !== null ? VoteSetMaj23.fromPartial(object.voteSetMaj23) : undefined;
    message.voteSetBits = object.voteSetBits !== undefined && object.voteSetBits !== null ? VoteSetBits.fromPartial(object.voteSetBits) : undefined;
    return message;
  },
  fromAmino(object: MessageAmino): Message {
    const message = createBaseMessage();
    if (object.new_round_step !== undefined && object.new_round_step !== null) {
      message.newRoundStep = NewRoundStep.fromAmino(object.new_round_step);
    }
    if (object.new_valid_block !== undefined && object.new_valid_block !== null) {
      message.newValidBlock = NewValidBlock.fromAmino(object.new_valid_block);
    }
    if (object.proposal !== undefined && object.proposal !== null) {
      message.proposal = Proposal.fromAmino(object.proposal);
    }
    if (object.proposal_pol !== undefined && object.proposal_pol !== null) {
      message.proposalPol = ProposalPOL.fromAmino(object.proposal_pol);
    }
    if (object.block_part !== undefined && object.block_part !== null) {
      message.blockPart = BlockPart.fromAmino(object.block_part);
    }
    if (object.vote !== undefined && object.vote !== null) {
      message.vote = Vote.fromAmino(object.vote);
    }
    if (object.has_vote !== undefined && object.has_vote !== null) {
      message.hasVote = HasVote.fromAmino(object.has_vote);
    }
    if (object.vote_set_maj23 !== undefined && object.vote_set_maj23 !== null) {
      message.voteSetMaj23 = VoteSetMaj23.fromAmino(object.vote_set_maj23);
    }
    if (object.vote_set_bits !== undefined && object.vote_set_bits !== null) {
      message.voteSetBits = VoteSetBits.fromAmino(object.vote_set_bits);
    }
    return message;
  },
  toAmino(message: Message): MessageAmino {
    const obj: any = {};
    obj.new_round_step = message.newRoundStep ? NewRoundStep.toAmino(message.newRoundStep) : undefined;
    obj.new_valid_block = message.newValidBlock ? NewValidBlock.toAmino(message.newValidBlock) : undefined;
    obj.proposal = message.proposal ? Proposal.toAmino(message.proposal) : undefined;
    obj.proposal_pol = message.proposalPol ? ProposalPOL.toAmino(message.proposalPol) : undefined;
    obj.block_part = message.blockPart ? BlockPart.toAmino(message.blockPart) : undefined;
    obj.vote = message.vote ? Vote.toAmino(message.vote) : undefined;
    obj.has_vote = message.hasVote ? HasVote.toAmino(message.hasVote) : undefined;
    obj.vote_set_maj23 = message.voteSetMaj23 ? VoteSetMaj23.toAmino(message.voteSetMaj23) : undefined;
    obj.vote_set_bits = message.voteSetBits ? VoteSetBits.toAmino(message.voteSetBits) : undefined;
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
      typeUrl: "/tendermint.consensus.Message",
      value: Message.encode(message).finish()
    };
  }
};