import { AddTransactionModal } from './addTransaction/AddTransactionModal';
import { AccountSelector } from './addTransaction/AccountSelector';
import { CategoryPicker } from './addTransaction/CategoryPicker';

// Re-export for full backwards compatibility
export { AddTransactionModal as default, AccountSelector, CategoryPicker };
export { AddTransactionModal as TransactionModal };

// Legacy Selector exports retained for backwards compatibility
export const CategorySelector: React.FC<any> = ({ value, onChange, categories = [] }) => (
  <select className="form-control-enhanced" value={value} onChange={(e) => onChange(e.target.value)}>
    <option value="" disabled>Select Category</option>
    {categories.map((cat: any) => (
      <option key={cat.id} value={cat.id}>{cat.icon ? `${cat.icon} ` : ''}{cat.name}</option>
    ))}
  </select>
);

export const SubcategorySelector: React.FC<any> = ({ value, onChange, subcategories = [] }) => (
  <select className="form-control-enhanced" value={value} onChange={(e) => onChange(e.target.value)}>
    <option value="" disabled>Select Subcategory</option>
    {subcategories.map((sub: any) => (
      <option key={sub.id} value={sub.id}>{sub.name}</option>
    ))}
  </select>
);
