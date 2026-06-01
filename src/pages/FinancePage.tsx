import { FinanceCards } from '../components/dashboard/FinanceCards';
import { RevenueChart } from '../components/dashboard/RevenueChart';
import { TransactionList } from '../components/admin/TransactionList';

export default function FinancePage() {
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Finance</h1>
        <p className="text-text-secondary text-sm mt-1">
          Vue d'ensemble des transactions et commissions
        </p>
      </div>
      <FinanceCards />
      <RevenueChart />
      <TransactionList />
    </div>
  );
}
