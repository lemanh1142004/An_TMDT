export interface BankConfig {
  bankId: string;
  bankName: string;
  shortName: string;
  accountNumber: string;
  accountHolder: string;
  template: 'compact2' | 'compact' | 'qr_only' | 'print';
}

export const STORE_BANK_CONFIG: BankConfig = {
  bankId: 'BIDV',
  bankName: 'BIDV - Ngân hàng TMCP Đầu tư và Phát triển Việt Nam',
  shortName: 'BIDV',
  accountNumber: '8893884656',
  accountHolder: 'LE VAN MANH',
  template: 'compact2',
};

export const getVietQrUrl = (
  amount: number,
  memo: string,
  config: BankConfig = STORE_BANK_CONFIG
): string => {
  const cleanAmount = Math.max(0, Math.round(amount));
  const encodedMemo = encodeURIComponent(memo);
  const encodedHolder = encodeURIComponent(config.accountHolder);
  return `https://img.vietqr.io/image/${config.bankId}-${config.accountNumber}-${config.template}.png?amount=${cleanAmount}&addInfo=${encodedMemo}&accountName=${encodedHolder}`;
};
