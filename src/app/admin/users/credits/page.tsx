// @ts-nocheck
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';

interface UserCreditInfo {
  email: string;
  userId: string;
  name: string | null;
  createdAt: string;
  plan: string;
  status: string;
  availableBalance: number;
  totalEarned: number;
  totalSpent: number;
  hasTransactions: boolean;
  hasSubscription: boolean;
}

interface Summary {
  totalUsers: number;
  totalBalance: number;
  totalEarned: number;
  totalSpent: number;
  usersWithTransactions: number;
  usersWithSubscription: number;
  usersWithZeroEarned: number;
  percentageWithTransactions: string;
  percentageWithSubscription: string;
}

export default function AdminUsersCreditsPage() {
  const [users, setUsers] = useState<UserCreditInfo[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCredits();
  }, []);

  const fetchCredits = async () => {
    setIsLoading(true);
    try {
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/admin/users/credits-export?_t=${timestamp}`, {
        cache: 'no-store',
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
        setSummary(data.summary);
      } else if (response.status === 401) {
        window.location.href = '/admin/login';
      }
    } catch (error) {
      console.error('Failed to fetch credits:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadCSV = () => {
    if (!users || !users.length) return;
    const header = 'Email,Name,Plan,Status,Available Balance,Total Earned,Total Spent,Has Transactions,Has Subscription,Created At';
    const csv = [header]
      .concat(
        users.map((u) =>
          [
            `"${u.email}"`,
            `"${u.name || ''}"`,
            `"${u.plan}"`,
            `"${u.status}"`,
            u.availableBalance,
            u.totalEarned,
            u.totalSpent,
            u.hasTransactions,
            u.hasSubscription,
            `"${u.createdAt}"`,
          ].join(',')
        )
      )
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `users-credits-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">Loading...</div>
      </div>
    );
  }

  const usersWithZeroEarned = users.filter((u) => u.totalEarned === 0 && u.totalSpent === 0);
  const usersWithCredits = users.filter((u) => u.totalEarned > 0 || u.totalSpent > 0);

  return (
    <div className="p-6 space-y-6 bg-white text-gray-900">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">All Users - Credits Report</h1>
        <button
          onClick={downloadCSV}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Download CSV
        </button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{summary.totalUsers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {summary.totalBalance.toLocaleString()}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Earned</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {summary.totalEarned.toLocaleString()}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Spent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {summary.totalSpent.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Statistics */}
      {summary && (
        <Card>
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Users with Transactions: </span>
                <span className="font-semibold text-gray-900">
                  {summary.usersWithTransactions} ({summary.percentageWithTransactions}%)
                </span>
              </div>
              <div>
                <span className="text-gray-600">Users with Subscription: </span>
                <span className="font-semibold text-gray-900">
                  {summary.usersWithSubscription} ({summary.percentageWithSubscription}%)
                </span>
              </div>
              <div>
                <span className="text-gray-600">Users with Zero Credits: </span>
                <span className="font-semibold text-red-600">{summary.usersWithZeroEarned}</span>
              </div>
              <div>
                <span className="text-gray-600">Users with Credits: </span>
                <span className="font-semibold text-green-600">{usersWithCredits.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Users with Credits */}
      {usersWithCredits.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Users with Credits ({usersWithCredits.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Plan</th>
                    <th className="py-3 px-4">Balance</th>
                    <th className="py-3 px-4">Earned</th>
                    <th className="py-3 px-4">Spent</th>
                    <th className="py-3 px-4">Has TX</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {usersWithCredits.map((user) => (
                    <tr key={user.userId} className="hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-900">{user.email}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.plan === 'pro_plus'
                              ? 'bg-teal-100 text-teal-800'
                              : user.plan === 'pro'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {user.plan || 'free'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">
                        {user.availableBalance.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-sm text-green-600">
                        {user.totalEarned.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-sm text-red-600">
                        {user.totalSpent.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {user.hasTransactions ? '✓' : '✗'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Users with Zero Credits */}
      {usersWithZeroEarned.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">
              Users with Zero Credits ({usersWithZeroEarned.length}) ⚠️
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 text-sm text-gray-600">
              These users may not have received their signup bonus. Check if signup bonus was
              granted correctly.
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Plan</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Registered</th>
                    <th className="py-3 px-4">Has Sub</th>
                    <th className="py-3 px-4">Has TX</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {usersWithZeroEarned.map((user) => {
                    const userAge = Date.now() - new Date(user.createdAt).getTime();
                    const hoursSinceSignup = userAge / (1000 * 60 * 60);
                    return (
                      <tr key={user.userId} className="hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm text-gray-900">{user.email}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              user.plan === 'pro_plus'
                                ? 'bg-teal-100 text-teal-800'
                                : user.plan === 'pro'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {user.plan || 'free'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              user.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {user.status || 'inactive'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-900">
                          {hoursSinceSignup < 24
                            ? `${hoursSinceSignup.toFixed(1)}h ago`
                            : `${Math.floor(hoursSinceSignup / 24)}d ago`}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-900">
                          {user.hasSubscription ? '✓' : '✗'}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-900">
                          {user.hasTransactions ? '✓' : '✗'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

