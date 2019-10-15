export const ROLES = {
  BROKER: 'BROKER',
  CLIENT: 'CLIENT',
  SETTLEMENT_AGENT: 'SETTLEMENT_AGENT',
};

export const ACTIONS = {
  CONFIRM: 'Confirm',
  ALLOCATE: 'Allocate',
};

export const CONFIRMED_ALLOCATION_TRADES_STATUS = {
  CONFIRMED: 'Confirmed',
  SETTLED: 'Settled',
  TRANSFERRED: 'Transferred',
};

export const BLOCK_TRADE_STATUS = {
  EMPTY: '',
  ALLOCATED: 'Allocated',
};

export const ALLOCATION_TRADE_STATUS = {
  UNAFFIRMED: 'Unaffirmed',
  AFFIRMED: 'Affirmed',
  CONFIRMED: 'COnfirmed',
};
