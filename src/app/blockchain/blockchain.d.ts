export type Parties = {
  name: string;
  roles: string[];
};

export type Transaction = {
  linearId: string;
  parties?: Parties[];
  amount: number;
  securities?: string;
  meta?: {
    globalKey: string;
  };
};

export type Party = {
  accountName: {
    value: string;
  };
  accountNumber: {
    value: string;
  };
  meta: {
    globalKey: string;
  };
};

export type BlockTrade = {
  action: string;
  eventDate: {
    day: number;
    month: number;
    year: number;
  };
  party: Party[];
};

export type Allocation = {
  action: string;
  eventDate: {
    day: number;
    month: number;
    year: number;
  };
  party: Party[];
};

export type ExecutionState = {
  id: string;
  type: string;
  status: string;
  underlying: string;
};
