
export interface Solana {
  isPhantom?: boolean;
  publicKey: PublicKey;
  connect: (a?: any) => Promise<any>;
  signTransaction: (a?: any) => Promise<any>;
  signAllTransactions: (a?: any) => Promise<any>;
}