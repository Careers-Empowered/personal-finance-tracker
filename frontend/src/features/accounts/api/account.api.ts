import { Account } from "../types/types"; 

const API_BASE_URL = `${import.meta.env.VITE_API_URL || "http://localhost:3000/api"}/accounts`;

const getHeaders = (extraHeaders: Record<string, string> = {}) => {
  const token = localStorage.getItem("token");
  return {
    ...extraHeaders,
    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
  };
};

export const accountApi = {
  async getAccounts(): Promise<Account[]> {
    const response = await fetch(API_BASE_URL, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch accounts");
    const data = await response.json();
    return data.data;
  },

  async createAccount(accountData: Omit<Account, "id" | "createdAt" | "updatedAt" | "userId">): Promise<Account> {
    const response = await fetch(API_BASE_URL, {
      method: "POST",
      headers: getHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(accountData),
    });
    if (!response.ok) throw new Error("Failed to create account");
    const data = await response.json();
    return data.data;
  },

  async updateAccount(id: string, accountData: Partial<Account>): Promise<Account> {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: "PUT",
      headers: getHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(accountData),
    });
    if (!response.ok) throw new Error("Failed to update account");
    const data = await response.json();
    return data.data;
  },

  async updateBalance(id: string, balance: number): Promise<Account> {
    const response = await fetch(`${API_BASE_URL}/${id}/balance`, {
      method: "PATCH",
      headers: getHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ balance }),
    });
    if (!response.ok) throw new Error("Failed to update balance");
    const data = await response.json();
    return data.data;
  },

  async deleteAccount(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error("Failed to delete account");
  },

  async transferBalance(
    sourceId: string,
    destId: string,
    sourceAmount: number,
    convertedAmount: number
  ): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/transfer`, {
      method: "POST",
      headers: getHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ sourceId, destId, sourceAmount, convertedAmount }),
    });
    if (!response.ok) throw new Error("Failed to transfer balance");
  },
};
