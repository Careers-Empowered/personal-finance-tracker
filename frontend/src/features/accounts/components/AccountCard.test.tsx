import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import AccountCard from './AccountCard';
import { Account } from '../types/types';

describe('AccountCard', () => {
  const mockAccount: Account = {
    id: '1',
    userId: 'user-1',
    name: 'Test Account',
    currency: 'USD',
    balance: 1234.56,
    isPrimary: false,
    createdAt: '2026-08-01T00:00:00Z',
    updatedAt: '2026-08-01T00:00:00Z',
  };

  const defaultProps = {
    account: mockAccount,
    onEdit: vi.fn(),
    onAdjustBalance: vi.fn(),
    onTransfer: vi.fn(),
    onSetPrimary: vi.fn(),
    onDelete: vi.fn(),
  };

  it('renders account details correctly', () => {
    render(<AccountCard {...defaultProps} />);
    expect(screen.getByText('Test Account')).toBeInTheDocument();
    expect(screen.getByText('USD')).toBeInTheDocument();
    expect(screen.getByText('$1,234.56')).toBeInTheDocument();
  });

  it('shows PRIMARY badge when account is primary', () => {
    render(<AccountCard {...defaultProps} account={{...mockAccount, isPrimary: true}} />);
    expect(screen.getByText('PRIMARY')).toBeInTheDocument();
  });

  it('calls onTransfer when transfer button is clicked', async () => {
    const user = userEvent.setup();
    render(<AccountCard {...defaultProps} />);
    
    await user.click(screen.getByTitle('Transfer Funds'));
    expect(defaultProps.onTransfer).toHaveBeenCalledWith(mockAccount);
  });

  it('calls onEdit when edit button is clicked', async () => {
    const user = userEvent.setup();
    render(<AccountCard {...defaultProps} />);
    
    await user.click(screen.getByTitle('Edit Account'));
    expect(defaultProps.onEdit).toHaveBeenCalledWith(mockAccount);
  });

  it('calls onAdjustBalance when adjust balance button is clicked', async () => {
    const user = userEvent.setup();
    render(<AccountCard {...defaultProps} />);
    
    await user.click(screen.getByTitle('Adjust Balance'));
    expect(defaultProps.onAdjustBalance).toHaveBeenCalledWith(mockAccount);
  });

  it('calls onSetPrimary when set primary button is clicked', async () => {
    const user = userEvent.setup();
    render(<AccountCard {...defaultProps} />);
    
    await user.click(screen.getByTitle('Set as Primary'));
    expect(defaultProps.onSetPrimary).toHaveBeenCalledWith(mockAccount.id);
  });

  it('hides Set Primary button if account is already primary', () => {
    render(<AccountCard {...defaultProps} account={{...mockAccount, isPrimary: true}} />);
    expect(screen.queryByTitle('Set as Primary')).not.toBeInTheDocument();
  });

  it('calls onDelete when delete button is clicked', async () => {
    const user = userEvent.setup();
    render(<AccountCard {...defaultProps} />);
    
    await user.click(screen.getByTitle('Delete Account'));
    expect(defaultProps.onDelete).toHaveBeenCalledWith(mockAccount.id);
  });
});
