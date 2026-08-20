import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { accountApi } from './account.api';

describe('accountApi', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = vi.fn();
    Storage.prototype.getItem = vi.fn(() => 'test-token');
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('getAccounts fetches successfully', async () => {
    const mockAccounts = [{ id: '1', name: 'Test Account' }];
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockAccounts }),
    });

    const data = await accountApi.getAccounts();
    expect(data).toEqual(mockAccounts);
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:3000/api/accounts', {
      headers: { Authorization: 'Bearer test-token' },
    });
  });

  it('createAccount POSTs successfully', async () => {
    const mockAccount = { id: '1', name: 'New Account', currency: 'USD' };
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockAccount }),
    });

    const newAccountData = { name: 'New Account', currency: 'USD', balance: 0, isPrimary: false };
    const data = await accountApi.createAccount(newAccountData);
    
    expect(data).toEqual(mockAccount);
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:3000/api/accounts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer test-token',
      },
      body: JSON.stringify(newAccountData),
    });
  });

  it('updateAccount PUTs successfully', async () => {
    const mockAccount = { id: '1', name: 'Updated Account' };
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockAccount }),
    });

    const data = await accountApi.updateAccount('1', { name: 'Updated Account' });
    
    expect(data).toEqual(mockAccount);
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:3000/api/accounts/1', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer test-token',
      },
      body: JSON.stringify({ name: 'Updated Account' }),
    });
  });

  it('updateBalance PATCHes successfully', async () => {
    const mockAccount = { id: '1', balance: 500 };
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockAccount }),
    });

    const data = await accountApi.updateBalance('1', 500);
    
    expect(data).toEqual(mockAccount);
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:3000/api/accounts/1/balance', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer test-token',
      },
      body: JSON.stringify({ balance: 500 }),
    });
  });

  it('deleteAccount DELETEs successfully', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
    });

    await accountApi.deleteAccount('1');
    
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:3000/api/accounts/1', {
      method: 'DELETE',
      headers: { Authorization: 'Bearer test-token' },
    });
  });

  it('transferBalance POSTs successfully', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
    });

    await accountApi.transferBalance('src1', 'dest2', 100, 105);
    
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:3000/api/accounts/transfer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer test-token',
      },
      body: JSON.stringify({
        sourceId: 'src1',
        destId: 'dest2',
        sourceAmount: 100,
        convertedAmount: 105,
      }),
    });
  });

  it('throws an error when fetch fails', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
    });

    await expect(accountApi.getAccounts()).rejects.toThrow('Failed to fetch accounts');
  });
});
