export const BROKER_BLOCKTRADE_COLUMNS = [
  'tradeNumber',
  'client',
  'prodType',
  'product',
  'quantity',
  'price',
  'cash',
  'currency',
  'valueDate',
  'status',
  'action',
];

export const CLIENT_BLOCKTRADE_COLUMNS = [
  'tradeNumber',
  'broker',
  'prodType',
  'product',
  'quantity',
  'price',
  'cash',
  'currency',
  'valueDate',
  'status',
];

export const BROKER_ALLOCATION_TRADE_COLUMNS = [
  'blockNumber',
  'allocationNumber',
  'client',
  'prodType',
  'product',
  'quantity',
  'price',
  'cash',
  'valueDate',
  'status',
  'action',
];

export const CLIENT_ALLOCATION_TRADE_COLUMNS = [
  'blockNumber',
  'allocationNumber',
  'client',
  'prodType',
  'product',
  'quantity',
  'price',
  'cash',
  'valueDate',
  'status',
];

export const SETTLEMENT_AGENT_COLUMNS = [
  'tradeNumber',
  'broker',
  'client',
  'prodType',
  'quantity',
  'price',
  'cash',
  'valueDate',
  'status',
];
