import { BasicAccount } from './blockchain';

export const ROLES = {
  BROKER: 'BROKER',
  CLIENT: 'CLIENT',
  SETTLEMENT_AGENT: 'SETTLEMENT_AGENT',
  OBSERVER: 'OBSERVER',
  COLLATERAL_AGENT: 'COLLATERAL_AGENT',
};

export const ACTIONS = {
  CONFIRM: 'Confirm',
  AFFIRM: 'Affirm',
  ALLOCATE: 'Allocate',
  SETTLE: 'Settle',
  TRANSFER: 'Transfer',
};

export const CONFIRMED_ALLOCATION_TRADES_STATUS = {
  EXECUTED: 'EXECUTED',
  CONFIRMED: 'CONFIRMED',
  SETTLED: 'SETTLED',
  TRANSFERRED: 'TRANSFERRED',
  INSTRUCTED: 'INSTRUCTED',
};

export const BLOCK_TRADE_STATUS = {
  EMPTY: '',
  EXECUTED: 'EXECUTED',
  ALLOCATED: 'ALLOCATED',
  INSTRUCTED: 'INSTRUCTED',
  SETTLED: 'SETTLED',
};

export const ALLOCATION_TRADE_STATUS = {
  INSTRUCTED: 'INSTRUCTED',
  UNAFFIRMED: 'UNAFFIRMED',
  AFFIRMED: 'AFFIRMED',
  CONFIRMED: 'CONFIRMED',
};

export const USERNAMES = {
  BROKER1: 'Broker1',
  BROKER2: 'Broker2',
  CLIENT1: 'Client1',
  CLIENT2: 'Client2',
  CLIENT3: 'Client3',
  OBSERVER1: 'Observer',
  SETTLEMENT_AGENT1: 'Settlement Agent',
  COLLATERAL_AGENT1: 'Collateral Agent',
};

export const generateAccountData: (
  clientName: string
) => BasicAccount = clientName => {
  switch (clientName) {
    case USERNAMES.CLIENT1:
      return {
        mainAccount: 'Client1_ACT#2',
        subAccount1: 'Client1_ACT#0',
        subAccount2: 'Client1_ACT#1',
      };
    case USERNAMES.CLIENT2:
      return {
        mainAccount: 'Client2_ACT#1',
        subAccount1: 'Client2_ACT#2',
        subAccount2: 'Client2_ACT#0',
      };
    case USERNAMES.CLIENT3:
      return {
        mainAccount: 'Client3_ACT#0',
        subAccount1: 'Client3_ACT#1',
        subAccount2: 'Client3_ACT#2',
      };
    case USERNAMES.BROKER1:
      return {
        mainAccount: 'Broker1_ACT#0',
        subAccount1: null,
        subAccount2: null,
      };
    case USERNAMES.BROKER2:
      return {
        mainAccount: 'Broker2_ACT#0',
        subAccount1: null,
        subAccount2: null,
      };
    default:
      return null;
  }
};
