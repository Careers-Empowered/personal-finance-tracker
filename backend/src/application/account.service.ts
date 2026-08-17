import { accountRepository } from "../repositories/account.repository";

export const accountService = {
  getAccounts(userId: string) {
    return accountRepository.findAllByUserId(userId);
  },

  getAccountById(id: string) {
    return accountRepository.findById(id);
  },

  async createAccount(data: {
    userId: string;
    name: string;
    currency: string;
    balance: number;
    isPrimary: boolean;
  }) {
    if (data.isPrimary) {
      await accountRepository.clearPrimaryFlag(data.userId);
    }
    return accountRepository.create(data);
  },

  async updateAccount(
    id: string,
    userId: string,
    data: {
      name?: string;
      currency?: string;
      isPrimary?: boolean;
    },
  ) {
    if (data.isPrimary) {
      await accountRepository.clearPrimaryFlag(userId);
    }
    return accountRepository.update(id, data);
  },

  updateBalance(id: string, balance: number) {
    return accountRepository.updateBalance(id, balance);
  },

  deleteAccount(id: string) {
    return accountRepository.delete(id);
  },

  transferBalance(
    sourceId: string,
    destId: string,
    sourceAmount: number,
    convertedAmount: number,
  ) {
    return accountRepository.transfer(
      sourceId,
      destId,
      sourceAmount,
      convertedAmount,
    );
  },
};
