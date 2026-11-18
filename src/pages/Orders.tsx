import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { Package, RefreshCw, X, MapPin, User, CreditCard } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { rupiah } from "../data/products";
import { errorMessage } from "../data/lib/api";
import { type OrderFilter, type OrderStatus, type PaymentStatus, type Order } from "../types";

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
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null); // State untuk Modal Detail
  const [busyId, setBusyId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const uploadTarget = useRef<number | null>(null);

  // Ambil data terbaru setiap halaman dibuka
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
      // refresh orders from server
      await refreshOrders();
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
      setSelectedOrder(null); // Tutup modal setelah batal
    } catch (err) {
      setMessage(errorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <main className="page">
      <div className="orders-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <h2 style={{ margin: 0 }}>Pesanan Saya</h2>
          
          <button
            className="primary-button"
            style={{ height: "36px", padding: "0 16px", fontSize: "13px", display: "inline-flex", alignItems: "center", gap: "6px" }}
            onClick={() => void refreshOrders()}
            disabled={ordersLoading}
          >
            <RefreshCw size={14} style={{ animation: ordersLoading ? "spin 1s linear infinite" : "none" }} />
            {ordersLoading ? "Memperbarui..." : "Muat Ulang"}
          </button>
        </div>

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
            {visibleOrders.map((order, index) => (
              <div className="order-block" key={order.id}>
                <div className="order-row">
                  <span className="order-number">{index + 1}</span>
                  <div className="order-thumb"><img src={order.items[0]?.product.image} alt="" /></div>
                  <div className="order-info">
                    <small>#{order.id} - {order.date}</small>
                    <b>{rupiah(order.total)}</b>
                  </div>
                  <span className={`status ${statusClass[order.status]}`}>{order.status}</span>
                  <button
                    className="detail-button"
                    onClick={() => setSelectedOrder(order)}
                  >
                    Lihat Detail
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* --- MODAL POPUP DETAIL PESANAN --- */}
        {selectedOrder && (() => {
          const canUpload = selectedOrder.status !== "Dibatalkan" && selectedOrder.paymentStatus !== "lunas";
          const canCancel = selectedOrder.status === "Menunggu" && selectedOrder.paymentStatus !== "lunas";
          const busy = busyId === selectedOrder.id;

          return (
            <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
              <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h3>Detail Pesanan #{selectedOrder.id}</h3>
                  <button className="modal-close-button" onClick={() => setSelectedOrder(null)}>
                    <X size={20} />
                  </button>
                </div>

                <div className="modal-body">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "var(--muted)" }}>Tanggal Pesanan</span>
                    <b>{selectedOrder.date}</b>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "var(--muted)" }}>Status Pesanan</span>
                    <span className={`status ${statusClass[selectedOrder.status]}`}>{selectedOrder.status}</span>
                  </div>

                  <hr style={{ border: "0", borderTop: "1px solid #ece3d7", margin: "4px 0" }} />

                  <div className="modal-section-title">Daftar Produk</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {selectedOrder.items.map((item, i) => (
                      <div key={`${item.product.id}-${i}`} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#faf6f0", padding: "10px 12px", borderRadius: "8px", border: "1px solid #ece3d7" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <img src={item.product.image} alt="" style={{ width: "40px", height: "40px", objectFit: "contain", background: "#fff", borderRadius: "6px", padding: "2px" }} />
                          <div>
                            <b style={{ display: "block", color: "var(--text)" }}>{item.product.name}</b>
                            <small style={{ color: "var(--muted)" }}>{item.quantity}x @ {rupiah(item.price)}</small>
                          </div>
                        </div>
                        <b style={{ color: "var(--brown)" }}>{rupiah(item.price * item.quantity)}</b>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "4px", padding: "10px 4px", fontSize: "15px" }}>
                    <b>Total Pembayaran</b>
                    <strong style={{ color: "var(--brown)", fontSize: "18px" }}>{rupiah(selectedOrder.total)}</strong>
                  </div>

                  <hr style={{ border: "0", borderTop: "1px solid #ece3d7", margin: "4px 0" }} />

                  <div className="modal-section-title">Informasi Pengiriman</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", background: "#faf6f0", padding: "12px", borderRadius: "8px", border: "1px solid #ece3d7" }}>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <User size={15} color="var(--brown)" />
                      <span>{selectedOrder.recipient} ({selectedOrder.phone})</span>
                    </div>
                    <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                      <MapPin size={15} color="var(--brown)" style={{ marginTop: "2px" }} />
                      <span>{selectedOrder.address}</span>
                    </div>
                  </div>

                  <div className="modal-section-title" style={{ marginTop: "8px" }}>Informasi Pembayaran</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", background: "#faf6f0", padding: "12px", borderRadius: "8px", border: "1px solid #ece3d7" }}>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <CreditCard size={15} color="var(--brown)" />
                      <span>{selectedOrder.payment}</span>
                    </div>
                    <div>
                      <span style={{ color: "var(--muted)" }}>Status Pembayaran: </span>
                      <b>{paymentLabel[selectedOrder.paymentStatus] ?? selectedOrder.paymentStatus}</b>
                    </div>
                    {selectedOrder.proofUrl && (
                      <div style={{ marginTop: "4px" }}>
                        <a href={selectedOrder.proofUrl} target="_blank" rel="noreferrer" style={{ color: "var(--brown)", fontWeight: "600", textDecoration: "underline" }}>
                          Lihat Bukti Pembayaran yang Diunggah
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Tombol Aksi di dalam Modal */}
                  {(canUpload || canCancel) && (
                    <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
                      {canUpload && (
                        <button className="primary-button" style={{ flex: 1, height: "40px", fontSize: "13px" }} disabled={busy} onClick={() => pickProof(selectedOrder.id)}>
                          {selectedOrder.proofUrl ? "Ganti Bukti Pembayaran" : "Upload Bukti Pembayaran"}
                        </button>
                      )}
                      {canCancel && (
                        <button className="detail-button" style={{ flex: 1, height: "40px", fontSize: "13px", borderColor: "#dc2626", color: "#dc2626" }} disabled={busy} onClick={() => handleCancel(selectedOrder.id)}>
                          Batalkan Pesanan
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </main>
  );
};

export default Orders;