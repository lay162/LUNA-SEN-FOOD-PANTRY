export const TRANSACTIONS_SEED = [
  {
    id: 'tx-1',
    date: '26 Mar',
    desc: 'Local Supermarket Restock',
    amt: -450.0,
    type: 'spend',
    cat: 'Inventory',
  },
  {
    id: 'tx-2',
    date: '25 Mar',
    desc: 'Anonymous Community Donation',
    amt: 1200.0,
    type: 'donation',
    cat: 'Gift',
  },
];

/** Opening balance applied once when computing liquidity from transactions */
export const OPENING_BALANCE = 4100;
