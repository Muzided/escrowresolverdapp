// public/data/disputes.ts
export interface DisputeStats {
  totalResolved: number;
  dailyAdopted: number;
  maxDailyLimit: number;
}

export interface AdoptedDispute {
  id: string;
  escrowId: string;
  amount: string;
  adoptedAt: string;
  deadline: string;
  status: 'active' | 'resolved' | 'expired';
  description: string;
}

export interface Escrow {
  escrowId: string;
  receiver: string;
  amount: string;
  jurisdiction:string;
  paymentType: string;
  status: string;
  escrowAddress: string

}


export const disputeStats: DisputeStats = {
  totalResolved: 156,
  dailyAdopted: 1,
  maxDailyLimit: 2
};

export const adoptedDisputes: AdoptedDispute[] = [
  {
    id: "DISP-001",
    escrowId: "ESC-1003",
    amount: "3200 USDT",
    adoptedAt: "2024-03-15T10:00:00Z",
    deadline: "2024-03-22T10:00:00Z",
    status: "active",
    description: "Payment dispute regarding milestone completion"
  },
  {
    id: "DISP-002",
    escrowId: "ESC-1005",
    amount: "2900 USDT",
    adoptedAt: "2024-03-14T15:30:00Z",
    deadline: "2024-03-21T15:30:00Z",
    status: "active",
    description: "Quality of work dispute"
  }
];

// Sample data for the graph
export const disputeResolutionHistory = [
  { month: "Jan", resolved: 12 },
  { month: "Feb", resolved: 15 },
  { month: "Mar", resolved: 18 },
  { month: "Apr", resolved: 14 },
  { month: "May", resolved: 20 },
  { month: "Jun", resolved: 16 }
];


export const userEscrows: Escrow[] =
  [
    {
      "escrowId": "ESC-1001",
      "receiver": "0x9aF3...D4B2",
      "amount": "5000 USDT",
      "paymentType": "Milestone",
      "jurisdiction": "US",
      "status": "Active",
      "escrowAddress": "0xA1B2C3D4E5F60000000000000000000000000001"
    },
    {
      "escrowId": "ESC-1002",
      "receiver": "0x7cB2...9Af0",
      "amount": "1500 USDT",
      "paymentType": "Full",
      "jurisdiction": "EU",
      "status": "Completed",
      "escrowAddress": "0xA1B2C3D4E5F60000000000000000000000000002"
    },
    {
      "escrowId": "ESC-1003",
      "receiver": "0xB3A8...F71C",
      "amount": "3200 USDT",
      "paymentType": "Milestone",
      "jurisdiction": "UAE",
      "status": "In Dispute",
      "escrowAddress": "0xA1B2C3D4E5F60000000000000000000000000003"
    },
    {
      "escrowId": "ESC-1004",
      "receiver": "0x48C9...0A1E",
      "amount": "780 USDT",
      "paymentType": "Full",
      "jurisdiction": "US",
      "status": "Completed",
      "escrowAddress": "0xA1B2C3D4E5F60000000000000000000000000004"
    },
    {
      "escrowId": "ESC-1005",
      "receiver": "0x2fE4...A9C3",
      "amount": "2900 USDT",
      "paymentType": "Milestone",
      "jurisdiction": "EU",
      "status": "Active",
      "escrowAddress": "0xA1B2C3D4E5F60000000000000000000000000005"
    }
  ];



export const disputesDemoData = [
  {
    disputeAddress: "0xD1sPuT3AaddR3551234567890abcdefABCDEF1234",
    escrowAddress: "0xE5cR0WAaddR3550987654321fedcbaFEDCBA5678",
    disputerAddress: "0xD15PuT3RM3d1aT0R0000000000000000AaAaAaAa",
    status: "under_review",
    unreadMessages: 2,
  },
  {
    disputeAddress: "0xD1sPuT3AaddR3552233445566abcdefABCDEF9999",
    escrowAddress: "0xE5cR0WAaddR3551122334455fedcbaFEDCBA8888",
    disputerAddress: undefined, // maybe a DAO mod
    status: "pending",
    unreadMessages: 0,
  },
  {
    disputeAddress: "0xD1sPuT3AaddR3553344556677abcdefABCDEF7777",
    escrowAddress: "0xE5cR0WAaddR3556677889900fedcbaFEDCBA6666",
    disputerAddress: undefined, // not yet adopted
    status: "pending",
    unreadMessages: 3,
  },
  {
    disputeAddress: "0xD1sPuT3AaddR3557788990011abcdefABCDEF4444",
    escrowAddress: "0xE5cR0WAaddR3555566778899fedcbaFEDCBA2222",
    disputerAddress: "0xDisPutER99999999999999999999999999999999",
    status: "resolved",
    unreadMessages: 0,
  }
];

export const userTransactionHistory =
  [
    {
      "id": "ESC-1001",
      "date": "24/11/25",
      "type": "Milestone Approval",
      "tx_hash": "0x98384hs3bdjsf77y87vcxv8sdf",
    },
    {
      "id": "ESC-1001",
      "date": "24/11/25",
      "type": "Dispute",
      "tx_hash": "0x98384hs3bdjsf77y87vcxv8sdf",
    },
    {
      "id": "ESC-1001",
      "date": "24/11/25",
      "type": "Escrow Creation",
      "tx_hash": "0x98384hs3bdjsf77y87vcxv8sdf",
    },
    {
      "id": "ESC-1001",
      "date": "24/11/25",
      "type": "Dispute",
      "tx_hash": "0x98384hs3bdjsf77y87vcxv8sdf",
    },
    {
      "id": "ESC-1001",
      "date": "24/11/25",
      "type": "Milestone Approval",
      "tx_hash": "0x98384hs3bdjsf77y87vcxv8sdf",
    },
    {
      "id": "ESC-1001",
      "date": "24/11/25",
      "type": "Escrow Creation",
      "tx_hash": "0x98384hs3bdjsf77y87vcxv8sdf",
    },

  ];



export const disputesDemoList = [
  {
    disputeAddress: "0xD1sPuT3AaddR3551234567890abcdefABCDEF1234",
    escrowAddress: "0xE5cR0WAaddR3550987654321fedcbaFEDCBA5678",
    reason: "It is about the quality of the produt it is not up to the mark as promised",
    amount: "100",
    date: "24/11/25",
  },
  {
    disputeAddress: "0xD1sPuT3AaddR3551234567890abcdefABCDEF1234",
    escrowAddress: "0xE5cR0WAaddR3550987654321fedcbaFEDCBA5678",
    reason: "It is about the quality of the produt it is not up to the mark as promised",
    amount: "100",
    date: "24/11/25",
  },
  {
    disputeAddress: "0xD1sPuT3AaddR3551234567890abcdefABCDEF1234",
    escrowAddress: "0xE5cR0WAaddR3550987654321fedcbaFEDCBA5678",
    reason: "It is about the quality of the produt it is not up to the mark as promised",
    amount: "100",
    date: "24/11/25",
  },
  {
    disputeAddress: "0xD1sPuT3AaddR3551234567890abcdefABCDEF1234",
    escrowAddress: "0xE5cR0WAaddR3550987654321fedcbaFEDCBA5678",
    reason: "It is about the quality of the produt it is not up to the mark as promised",
    amount: "100",
    date: "24/11/25",
  }
];