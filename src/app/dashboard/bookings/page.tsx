import { getServerSession } from "next-auth";
import { CreditCard, Pencil, Plus, Trash2 } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ActionButton } from "@/components/action-button";
import { BookingForm } from "@/components/bookings/booking-form";
import { PaymentForm } from "@/components/bookings/payment-form";
import { deleteBooking } from "@/actions/bookings";
import { formatDate, formatRupiah } from "@/lib/utils";
import { BOOKING_PAYMENT_STATUS_LABEL } from "@/lib/labels";

const PAYMENT_STATUS_COLOR: Record<string, string> = {
  PENDING: "bg-gray-100 text-gray-600",
  PARTIAL: "bg-amber-100 text-amber-700",
  PAID: "bg-emerald-100 text-emerald-700",
};

export default async function BookingsPage() {
  const session = await getServerSession(authOptions);
  const role = session?.user.role;
  const isSales = role === "SALES";
  const canDelete = role && ["SUPER_ADMIN", "OWNER", "SALES_MANAGER", "ADMIN"].includes(role);

  const [bookings, leads, availableUnits, salesUsers] = await Promise.all([
    prisma.booking.findMany({
      where: isSales ? { salesId: session?.user.id } : {},
      include: { lead: true, unit: { include: { block: true } }, sales: true, payments: true },
      orderBy: { bookingDate: "desc" },
      take: 100,
    }),
    prisma.lead.findMany({
      where: isSales ? { salesId: session?.user.id } : {},
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.unit.findMany({
      where: { status: { in: ["AVAILABLE", "HOLD"] } },
      include: { block: true },
      orderBy: [{ block: { name: "asc" } }, { unitNumber: "asc" }],
    }),
    prisma.user.findMany({ where: { role: "SALES", active: true }, orderBy: { name: "asc" } }),
  ]);

  const unitOptions = availableUnits.map((u) => ({
    id: u.id,
    label: `Blok ${u.block.name} No. ${u.unitNumber} — ${u.type} (${formatRupiah(u.price)})`,
    price: u.price,
    dp: u.dp,
  }));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900">Manajemen Booking</h1>
          <p className="text-sm text-gray-500">{bookings.length} booking tercatat.</p>
        </div>
        <Modal
          title="Buat Booking Baru"
          size="lg"
          trigger={
            <Button size="sm">
              <Plus className="h-4 w-4" /> Buat Booking
            </Button>
          }
        >
          <BookingForm
            leads={leads}
            units={unitOptions}
            salesUsers={salesUsers.map((s) => ({ id: s.id, name: s.name }))}
            showSalesPicker={!isSales}
          />
        </Modal>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-surface-border bg-white shadow-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-surface-border text-[11px] uppercase tracking-wide text-gray-400">
            <tr>
              <th className="px-4 py-3">Lead</th>
              <th className="px-4 py-3">Unit</th>
              <th className="px-4 py-3">Sales</th>
              <th className="px-4 py-3">Harga</th>
              <th className="px-4 py-3">DP Terbayar</th>
              <th className="px-4 py-3">Status Bayar</th>
              <th className="px-4 py-3">Tanggal</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {bookings.map((b) => {
              const totalPaid = b.payments.reduce((sum, p) => sum + p.amount, 0);
              const remaining = Math.max(b.dp - totalPaid, 0);
              return (
                <tr key={b.id} className="transition-colors hover:bg-surface-subtle">
                  <td className="px-4 py-3 font-medium text-gray-800">{b.lead.name}</td>
                  <td className="px-4 py-3 text-gray-500">
                    Blok {b.unit.block.name} No. {b.unit.unitNumber}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{b.sales.name}</td>
                  <td className="px-4 py-3 text-gray-500">{formatRupiah(b.price)}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {formatRupiah(totalPaid)} <span className="text-gray-400">/ {formatRupiah(b.dp)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={PAYMENT_STATUS_COLOR[b.paymentStatus]}>
                      {BOOKING_PAYMENT_STATUS_LABEL[b.paymentStatus]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(b.bookingDate)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Modal
                        title="Edit Booking"
                        size="lg"
                        description={`${b.lead.name} — Blok ${b.unit.block.name} No. ${b.unit.unitNumber}`}
                        trigger={
                          <span className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-gray-500 hover:bg-surface-muted">
                            <Pencil className="h-3.5 w-3.5" />
                          </span>
                        }
                      >
                        <BookingForm
                          leads={leads}
                          units={unitOptions}
                          salesUsers={salesUsers.map((s) => ({ id: s.id, name: s.name }))}
                          showSalesPicker={!isSales}
                          defaults={{
                            id: b.id,
                            bookingFee: b.bookingFee,
                            price: b.price,
                            dp: b.dp,
                            notes: b.notes,
                          }}
                        />
                      </Modal>
                      {b.paymentStatus !== "PAID" && (
                        <Modal
                          title="Catat Pembayaran DP"
                          description={`${b.lead.name} — Blok ${b.unit.block.name} No. ${b.unit.unitNumber}`}
                          trigger={
                            <span className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-gray-500 hover:bg-surface-muted">
                              <CreditCard className="h-3.5 w-3.5" /> Bayar
                            </span>
                          }
                        >
                          <PaymentForm bookingId={b.id} remaining={remaining} />
                        </Modal>
                      )}
                      {canDelete && (
                        <ActionButton
                          action={deleteBooking.bind(null, b.id)}
                          confirmMessage="Hapus booking ini? Unit akan kembali berstatus tersedia."
                          icon={Trash2}
                          variant="danger"
                        />
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {bookings.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-400">
                  Belum ada booking.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
