'use client';

import Link from 'next/link';
import { AlertTriangle, Boxes, PackageCheck, PackageX, Pill } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';
import Card, { CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import ProgressBar from '@/components/ui/ProgressBar';
import EmptyState from '@/components/ui/EmptyState';
import { ListSkeleton, StatCardSkeleton } from '@/components/ui/Skeleton';
import { useLowStock } from '@/hooks/useMedicines';
import { usePharmacistStats } from '@/hooks/useStats';
import { useCurrentUser } from '@/hooks/useAuth';

export default function PharmacistDashboardPage() {
  const user = useCurrentUser();
  // counts come from /stats; the low-stock list is the one thing worth showing in full
  const { data: stats, isLoading: statsLoading } = usePharmacistStats();
  const { data: lowStock, isLoading } = useLowStock();

  const pending = stats?.dispensing.pending ?? 0;
  const outOfStock = stats?.medicines.outOfStock ?? 0;

  return (
    <>
      <PageHeader
        title={`Welcome, ${user?.fullName?.split(' ')[0] ?? 'there'}`}
        subtitle="The dispensing queue, the catalogue, and what needs restocking."
        action={
          <Link href="/pharmacist/dispensing">
            <Button>
              <PackageCheck className="h-4 w-4" aria-hidden />
              Dispensing queue
            </Button>
          </Link>
        }
      />

      {!statsLoading && outOfStock > 0 && (
        <Alert tone="danger" className="mb-4" title="Medicines at zero">
          {outOfStock === 1
            ? 'One medicine has nothing on the shelf.'
            : `${outOfStock} medicines have nothing on the shelf.`}{' '}
          Anything prescribed against them cannot be handed over until stock is recorded.
        </Alert>
      )}

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard
              icon={PackageCheck}
              value={pending}
              label="Waiting to dispense"
              hint={`${stats?.dispensing.completedInPeriod ?? 0} completed in the last ${stats?.periodDays ?? 30} days`}
              tone="blue"
              index={0}
              action={
                <Link href="/pharmacist/dispensing" className="text-xs font-medium text-blue-600">
                  Open queue
                </Link>
              }
            />
            <StatCard
              icon={Pill}
              value={stats?.medicines.total ?? 0}
              label="Medicines in catalogue"
              tone="purple"
              index={1}
            />
            <StatCard
              icon={AlertTriangle}
              value={stats?.medicines.lowStock ?? 0}
              label="Below threshold"
              tone="orange"
              index={2}
            />
            <StatCard
              icon={PackageX}
              value={outOfStock}
              label="Out of stock"
              tone="red"
              index={3}
            />
          </>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Low stock medicines"
            action={
              <Link href="/pharmacist/inventory" className="text-xs font-medium text-blue-600">
                Manage inventory
              </Link>
            }
          />
          {isLoading ? (
            <ListSkeleton rows={5} />
          ) : !lowStock?.length ? (
            <EmptyState
              icon={PackageCheck}
              title="All stock levels healthy"
              description="Nothing is below its threshold right now."
            />
          ) : (
            <div className="space-y-3">
              {lowStock.slice(0, 8).map((inv) => (
                <div key={inv.id} className="rounded-lg border border-slate-200 p-3">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">
                        {inv.medicine?.brandName}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {inv.medicine?.genericName}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={
                          inv.stockQty === 0
                            ? 'text-xs font-semibold text-red-600'
                            : 'text-xs font-semibold text-orange-600'
                        }
                      >
                        {inv.stockQty}/{inv.threshold}
                      </span>
                      <Link href="/pharmacist/inventory">
                        <Button size="sm" variant="outline">
                          Restock
                        </Button>
                      </Link>
                    </div>
                  </div>
                  <ProgressBar value={inv.stockQty} max={inv.threshold} />
                </div>
              ))}
              {lowStock.length > 8 && (
                <p className="text-xs text-slate-500">
                  {lowStock.length - 8} more below threshold. The inventory screen lists all of
                  them.
                </p>
              )}
            </div>
          )}
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader title="On the shelf" />
            <div className="flex items-baseline gap-2">
              <Boxes className="h-5 w-5 text-slate-400" aria-hidden />
              <span className="text-2xl font-semibold text-slate-900">
                {statsLoading ? '—' : (stats?.unitsInStock ?? 0).toLocaleString()}
              </span>
              <span className="text-sm text-slate-500">units</span>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Total units across every medicine with an inventory record. Medicines carry no
              price, so there is no currency figure to report.
            </p>
          </Card>

          <Card>
            <CardHeader title="How dispensing works" />
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex gap-2">
                <span className="text-slate-300">—</span>
                Only a pharmacist can record a hand-over. Doctors and admins can read the
                history but not add to it.
              </li>
              <li className="flex gap-2">
                <span className="text-slate-300">—</span>
                Recording a dispense decrements stock in the same transaction. There is no
                undo.
              </li>
              <li className="flex gap-2">
                <span className="text-slate-300">—</span>
                Every dispense is written to the audit log with your name against it.
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </>
  );
}
