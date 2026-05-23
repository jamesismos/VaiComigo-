export interface DriverWalletState {
  walletBalance: number;
  creditLimit: number;
}

export function canDriverReceiveRide(wallet: DriverWalletState): boolean {
  return wallet.walletBalance >= wallet.creditLimit;
}

export function balanceAfterPlatformFee(
  wallet: DriverWalletState,
  platformFee: number,
): DriverWalletState {
  return {
    ...wallet,
    walletBalance: Number((wallet.walletBalance - platformFee).toFixed(2)),
  };
}

export function shouldWarnDriver(wallet: DriverWalletState): boolean {
  return wallet.walletBalance <= Math.abs(wallet.creditLimit) * 0.5;
}
