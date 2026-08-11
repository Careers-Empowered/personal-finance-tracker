import { createBrowserRouter, Navigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/dashboard/DashboardLayout';
import Home from '../../features/home/Home';
import Transaction from '../../features/transaction/Transaction';
import Accounts from '../../features/accounts/Accounts';
import Budgets from '../../features/budgets/Budgets';
import Goals from '../../features/goals/Goals';
import Loans from '../../features/loans/Loans';
import Subscriptions from '../../features/subscriptions/Subscriptions';
import Scheduled from '../../features/scheduled/Scheduled';
import Calendar from '../../features/calendar/Calendar';
import ActivityLog from '../../features/activity-log/ActivityLog';
import Summary from '../../features/summary/Summary';
import EditData from '../../features/edit-data/EditData';
import Settings from '../../features/settings/Settings';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <DashboardLayout />,
    children: [
      {
        path: '',
        element: <Navigate to="/home" replace />,
      },
      {
        path: 'home',
        element: <Home />,
      },
      {
        path: 'transaction',
        element: <Transaction />,
      },
      {
        path: 'accounts',
        element: <Accounts />,
      },
      {
        path: 'budgets',
        element: <Budgets />,
      },
      {
        path: 'goals',
        element: <Goals />,
      },
      {
        path: 'loans',
        element: <Loans />,
      },
      {
        path: 'subscriptions',
        element: <Subscriptions />,
      },
      {
        path: 'scheduled',
        element: <Scheduled />,
      },
      {
        path: 'calendar',
        element: <Calendar />,
      },
      {
        path: 'activity-log',
        element: <ActivityLog />,
      },
      {
        path: 'summary',
        element: <Summary />,
      },
      {
        path: 'edit-data',
        element: <EditData />,
      },
      {
        path: 'settings',
        element: <Settings />,
      },
      {
        path: '*',
        element: <Navigate to="/home" replace />,
      },
    ],
  },
]);