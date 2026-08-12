import { createBrowserRouter, Navigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/dashboard/DashboardLayout';
import Dashboard from '../../features/dashboard/Dashboard';
import Transactions from '../../features/transactions/Transactions';
import Accounts from '../../features/accounts/Accounts';
import Categories from '../../features/categories/Categories';
import Import from '../../features/import/Import';
import Categorization from '../../features/categorization/Categorization';
import Auth from '../../features/auth/Auth';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <DashboardLayout />,
    children: [
      {
        path: '',
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'transactions',
        element: <Transactions />,
      },
      {
        path: 'accounts',
        element: <Accounts />,
      },
      {
        path: 'categories',
        element: <Categories />,
      },
      {
        path: 'import',
        element: <Import />,
      },
      {
        path: 'categorization',
        element: <Categorization />,
      },
      {
        path: 'auth',
        element: <Auth />,
      },
      {
        path: '*',
        element: <Navigate to="/dashboard" replace />,
      },
    ],
  },
]);