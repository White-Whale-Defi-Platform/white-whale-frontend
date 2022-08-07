import { MsgExecuteContract } from "@terra-money/terra.js";

export const toBase64 = (obj: object) => {
  return Buffer.from(JSON.stringify(obj)).toString('base64')
}


type CreateWithdrawMsgsOptions = {
  pairContract: string;
  lpTokenContract: string;
  amount: string;
};

export const createWithdrawMsgs = (
  options: CreateWithdrawMsgsOptions,
  sender: string
) => {
  const { pairContract, lpTokenContract, amount } = options;

  const executeMsg = {
    send: {
      contract: pairContract,
      amount,
      msg: toBase64({
        withdraw_liquidity: {},
      }),
    },
  };

  const withdrawMsg = new MsgExecuteContract(
    sender,
    lpTokenContract,
    executeMsg
  );

  return [withdrawMsg];
};
