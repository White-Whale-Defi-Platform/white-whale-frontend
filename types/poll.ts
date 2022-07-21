export enum PollStatus {
  InProgress = "in_progress",
  Passed = "passed",
  Rejected = "rejected",
  Executed = "executed",
}

export enum VoteType {
  Yes = "yes",
  No = "no",
}

export enum PollType {
  "Community-pool Spend" = 0,
}

export type Poll = {
  id: number;
  deposit_amount: string;
  creator: string;
  description: string;
  end_height: number;
  execute_data?: any;
  link: string;
  no_votes: string;
  staked_amount: string;
  status: PollStatus;
  title: string;
  total_balance_at_end_poll: string;
  yes_votes: string;
};
