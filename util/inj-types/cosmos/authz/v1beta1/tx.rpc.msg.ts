import { Rpc } from "../../../helpers";
import { BinaryReader } from "../../../binary";
import { MsgGrant, MsgGrantResponse, MsgExec, MsgExecResponse, MsgRevoke, MsgRevokeResponse, MsgExecCompat, MsgExecCompatResponse } from "./tx";
/** Msg defines the authz Msg service. */
export interface Msg {
  /**
   * Grant grants the provided authorization to the grantee on the granter's
   * account with the provided expiration time. If there is already a grant
   * for the given (granter, grantee, Authorization) triple, then the grant
   * will be overwritten.
   */
  grant(request: MsgGrant): Promise<MsgGrantResponse>;
  /**
   * Exec attempts to execute the provided messages using
   * authorizations granted to the grantee. Each message should have only
   * one signer corresponding to the granter of the authorization.
   */
  exec(request: MsgExec): Promise<MsgExecResponse>;
  /**
   * Revoke revokes any authorization corresponding to the provided method name on the
   * granter's account that has been granted to the grantee.
   */
  revoke(request: MsgRevoke): Promise<MsgRevokeResponse>;
  /** ExecCompat has same functionality as Exec but accepts array of json-encoded message string instead of []*Any */
  execCompat(request: MsgExecCompat): Promise<MsgExecCompatResponse>;
}
export class MsgClientImpl implements Msg {
  private readonly rpc: Rpc;
  constructor(rpc: Rpc) {
    this.rpc = rpc;
  }
  /* Grant grants the provided authorization to the grantee on the granter's
   account with the provided expiration time. If there is already a grant
   for the given (granter, grantee, Authorization) triple, then the grant
   will be overwritten. */
  grant = async (request: MsgGrant): Promise<MsgGrantResponse> => {
    const data = MsgGrant.encode(request).finish();
    const promise = this.rpc.request("cosmos.authz.v1beta1.Msg", "Grant", data);
    return promise.then(data => MsgGrantResponse.decode(new BinaryReader(data)));
  };
  /* Exec attempts to execute the provided messages using
   authorizations granted to the grantee. Each message should have only
   one signer corresponding to the granter of the authorization. */
  exec = async (request: MsgExec): Promise<MsgExecResponse> => {
    const data = MsgExec.encode(request).finish();
    const promise = this.rpc.request("cosmos.authz.v1beta1.Msg", "Exec", data);
    return promise.then(data => MsgExecResponse.decode(new BinaryReader(data)));
  };
  /* Revoke revokes any authorization corresponding to the provided method name on the
   granter's account that has been granted to the grantee. */
  revoke = async (request: MsgRevoke): Promise<MsgRevokeResponse> => {
    const data = MsgRevoke.encode(request).finish();
    const promise = this.rpc.request("cosmos.authz.v1beta1.Msg", "Revoke", data);
    return promise.then(data => MsgRevokeResponse.decode(new BinaryReader(data)));
  };
  /* ExecCompat has same functionality as Exec but accepts array of json-encoded message string instead of []*Any */
  execCompat = async (request: MsgExecCompat): Promise<MsgExecCompatResponse> => {
    const data = MsgExecCompat.encode(request).finish();
    const promise = this.rpc.request("cosmos.authz.v1beta1.Msg", "ExecCompat", data);
    return promise.then(data => MsgExecCompatResponse.decode(new BinaryReader(data)));
  };
}