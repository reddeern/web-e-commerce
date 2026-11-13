import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { Package } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { rupiah } from "../data/products";
import { errorMessage } from "../lib/api";
import { type OrderFilter, type OrderStatus, type PaymentStatus } from "../types";

const statusClass: Record<OrderStatus, string> = {
  Menunggu: "waiting",
  Diproses: "processing",
  Dikirim: "processing",
  Selesai: "done",
  Dibatalkan: "cancelled",
};

const paymentLabel: Record<PaymentStatus, string> = {
  belum_bayar: "Belum dibayar",
  menunggu_verifikasi: "Menunggu verifikasi",
  lunas: "Lunas",
  ditolak: "Bukti ditolak, silakan unggah ulang",
};

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 4 * 1024 * 1024;

const Orders = () => {
  const { orders, ordersLoading, ordersError, refreshOrders, uploadProof, cancelOrder, go } = useAppContext();
  const [orderFilter, setOrderFilter] = useState<OrderFilter>("Semua");
  const [openOrder, setOpenOrder] = useState<number | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const uploadTarget = useRef<number | null>(null);

  // Ambil data terbaru setiap halaman dibuka (status bisa diubah admin)
  useEffect(() => {
    void refreshOrders();
  }, [refreshOrders]);

  const filters: OrderFilter[] = ["Semua", "Menunggu", "Diproses", "Dikirim", "Selesai", "Dibatalkan"];
  const visibleOrders = orders.filter((order) => orderFilter === "Semua" || order.status === orderFilter);

  const pickProof = (orderId: number) => {
    uploadTarget.current = orderId;
    fileRef.current?.click();
  };

  const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    const orderId = uploadTarget.current;
    if (!file || orderId === null) return;

    if (!ALLOWED_TYPES.includes(file.type)) return setMessage("Bukti harus berupa gambar JPG, PNG, atau WEBP.");
    if (file.size > MAX_SIZE) return setMessage("Ukuran bukti maksimal 4 MB.");

    setBusyId(orderId);
    setMessage("");
    try {
      await uploadProof(orderId, file);
      setMessage("Bukti pembayaran berhasil diunggah. Menunggu verifikasi admin.");
    } catch (err) {
      setMessage(errorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const handleCancel = async (orderId: number) => {
    if (!window.confirm("Batalkan pesanan ini?")) return;
    setBusyId(orderId);
    setMessage("");
    try {
      await cancelOrder(orderId);
      setMessage("Pesanan berhasil dibatalkan.");
    } catch (err) {
      setMessage(errorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <main className="page">
      <div className="orders-card">
        <h2>Pesanan Saya</h2>
        <div className="order-tabs">
          {filters.map((item) => (
            <button
              key={item}
              className={orderFilter === item ? "order-tab active" : "order-tab"}
              onClick={() => setOrderFilter(item)}
            >
              {item}
            </button>
          ))}
        </div>

        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={handleFile} />

        {message && <p className="auth-error">{message}</p>}
        {ordersError && <p className="auth-error">{ordersError}</p>}

        {ordersLoading && orders.length === 0 ? (
          <p style={{ textAlign: "center" }}>Memuat pesanan...</p>
        ) : visibleOrders.length === 0 ? (
          <div className="empty-state compact-empty">
            <Package size={42} />
            <h3>Belum ada pesanan</h3>
            <button className="primary-button" onClick={() => go("produk")}>Belanja Sekarang</button>
          </div>
        ) : (
          <div className="orders-list">
            {visibleOrders.map((order, index) => {
              const canUpload = order.status !== "Dibatalkan" && order.paymentStatus !== "lunas";
              const canCancel = order.status === "Menunggu" && order.paymentStatus !== "lunas";
              const busy = busyId === order.id;

              return (
                <div className="order-block" key={order.id}>
                  <div className="order-row">
                    <span className="order-number">{index + 1}</span>
                    <div className="order-thumb"><img src={order.items[0]?.product.image} alt="" /></div>
                    <div className="order-info">
                      <small>#{order.id} • {order.date}</small>
                      <b>{rupiah(order.total)}</b>
                    </div>
                    <span className={`status ${statusClass[order.status]}`}>{order.status}</span>
                    <button
                      className="detail-button"
                      onClick={() => setOpenOrder(openOrder === order.id ? null : order.id)}
                    >
                      Lihat Detail
                    </button>
                  </div>

                  {openOrder === order.id && (
                    <div className="order-detail">
                      {order.items.map((item, i) => (
                        <div className="order-item" key={`${item.product.id}-${i}`}>
                          <span>{item.product.name} × {item.quantity}</span>
                          <b>{rupiah(item.price * item.quantity)}</b>
                        </div>
                      ))}
                      <small>Penerima: {order.recipient} ({order.phone})</small><br />
                      <small>Alamat: {order.address}</small><br />
                      <small>Pembayaran: {order.payment} • {paymentLabel[order.paymentStatus] ?? order.paymentStatus}</small>
                      {order.proofUrl && (
                        <>
                          <br />
                          <small><a href={order.proofUrl} target="_blank" rel="noreferrer">Lihat bukti pembayaran</a></small>
                        </>
                      )}

                      {(canUpload || canCancel) && (
                        <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                          {canUpload && (
                            <button className="detail-button" disabled={busy} onClick={() => pickProof(order.id)}>
                              {order.proofUrl ? "Ganti Bukti Pembayaran" : "Upload Bukti Pembayaran"}
                            </button>
                          )}
                          {canCancel && (
                            <button className="detail-button" disabled={busy} onClick={() => handleCancel(order.id)}>
                              Batalkan Pesanan
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
};

export default Orders;
