import { accountRepository } from "../repositories/account.repository";
import { balanceValidator } from "../domain/accounts/balanceValidator";

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
      balance?: number;
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

  async transferBalance(
    sourceId: string,
    destId: string,
    sourceAmount: number,
    convertedAmount: number,
  ) {
    await balanceValidator.validateSufficientBalance(sourceId, sourceAmount);
    return accountRepository.transfer(
      sourceId,
      destId,
      sourceAmount,
      convertedAmount,
    );
  },
};
