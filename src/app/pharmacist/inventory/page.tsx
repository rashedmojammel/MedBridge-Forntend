"use client";

import { useState } from "react";
import { Package, PackageCheck } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import ProgressBar from "@/components/ui/ProgressBar";
import EmptyState from "@/components/ui/EmptyState";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { useLowStock, useUpdateStock } from "@/hooks/useMedicines";
import { apiError } from "@/lib/api";
import type { MedicineInventory, StockAction } from "@/types";

export default function InventoryPage() {
  const { toast } = useToast();
  const { data: inventory, isLoading } = useLowStock();
  const updateStock = useUpdateStock();

  const [editing, setEditing] = useState<MedicineInventory | null>(null);
  const [action, setAction] = useState<StockAction>("ADD");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("Restock delivery");

  const preview = (() => {
    if (!editing || !quantity) return editing?.stockQty ?? 0;
    const q = Number(quantity);
    if (action === "ADD") return editing.stockQty + q;
    if (action === "REDUCE") return Math.max(0, editing.stockQty - q);
    return q;
  })();

  const submit = () => {
    if (!editing || !quantity) return toast("Enter a quantity", "error");
    updateStock.mutate(
      { id: editing.medicine!.id, action, quantity: Number(quantity), reason },
      {
        onSuccess: () => {
          toast("Stock updated");
          setEditing(null);
          setQuantity("");
        },
        onError: (e) => toast(apiError(e, "Could not update stock"), "error"),
      },
    );
  };

  return (
    <>
      <PageHeader
        title="Inventory"
        subtitle="Medicines at or below their stock threshold."
      />

      <Card padded={false} className="overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={6} cols={5} />
        ) : !inventory?.length ? (
          <EmptyState
            icon={PackageCheck}
            title="All stock levels healthy"
            description="Nothing is below its threshold right now."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 text-left">
                  {["Medicine", "Generic", "Stock", "Level", "Actions"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {inventory.map((inv) => (
                  <tr
                    key={inv.id}
                    className="border-b border-slate-100 hover:bg-slate-50"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">
                      {inv.medicine?.brandName}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">
                      {inv.medicine?.genericName}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          inv.stockQty === 0
                            ? "text-sm font-semibold text-red-600"
                            : "text-sm font-semibold text-orange-600"
                        }
                      >
                        {inv.stockQty}
                      </span>
                      <span className="text-xs text-slate-400">
                        {" "}
                        / {inv.threshold}
                      </span>
                    </td>
                    <td className="w-32 px-4 py-3">
                      <ProgressBar value={inv.stockQty} max={inv.threshold} />
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditing(inv)}
                      >
                        Update stock
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={`Update stock: ${editing?.medicine?.brandName ?? ""}`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button onClick={submit} loading={updateStock.isPending}>
              Update stock
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="rounded-lg bg-slate-50 px-3 py-2.5">
            <p className="text-xs text-slate-500">Current stock</p>
            <p className="text-lg font-semibold text-slate-900">
              {editing?.stockQty} units
            </p>
          </div>

          <div>
            <p className="mb-1.5 text-xs font-medium text-slate-700">Action</p>
            <div className="grid grid-cols-3 gap-2">
              {(["ADD", "REDUCE", "SET"] as StockAction[]).map((a) => (
                <button
                  key={a}
                  onClick={() => setAction(a)}
                  className={
                    action === a
                      ? "rounded-lg border-2 border-blue-500 bg-blue-50 py-2 text-xs font-medium text-blue-700"
                      : "rounded-lg border border-slate-200 py-2 text-xs font-medium text-slate-600 hover:border-slate-300"
                  }
                >
                  {a === "ADD"
                    ? "Add"
                    : a === "REDUCE"
                      ? "Reduce"
                      : "Set exact"}
                </button>
              ))}
            </div>
          </div>

          <Input
            label="Quantity"
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="0"
          />

          <Select
            label="Reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          >
            <option>Restock delivery</option>
            <option>Dispensed</option>
            <option>Expired</option>
            <option>Damaged</option>
            <option>Stock correction</option>
          </Select>

          <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2.5 text-sm text-blue-800">
            New stock level:{" "}
            <span className="font-semibold">{preview} units</span>
          </div>
        </div>
      </Modal>
    </>
  );
}
