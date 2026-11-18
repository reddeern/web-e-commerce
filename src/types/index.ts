export type Page =
  | "home"
  | "produk"
  | "detail"
  | "keranjang"
  | "checkout"
  | "pesanan"
  | "profil"
  | "login"
  | "register";

export type Product = {
  id: number;
  name: string;
  price: number;
  image: string;
  summary: string;
  description: string;
  stock: number;
  size: string;
  material: string;
};

export type User = {
  id: number;
  name: string;
  username: string;
  email: string;
};

export type CartItem = {
  id: number; // detail_keranjang_id di server
  product: Product;
  quantity: number;
};

export type OrderStatus = "Menunggu" | "Diproses" | "Dikirim" | "Selesai" | "Dibatalkan";
export type OrderFilter = "Semua" | OrderStatus;
export type PaymentStatus = "belum_bayar" | "menunggu_verifikasi" | "lunas" | "ditolak";

export type OrderItem = {
  product: Product;
  quantity: number;
  price: number; // harga saat pesanan dibuat
};

export type Order = {
  id: number;
  date: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  payment: string;
  paymentStatus: PaymentStatus;
  proofUrl: string | null;
  recipient: string;
  phone: string;
  address: string;
};
