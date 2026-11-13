// Data produk sekarang berasal dari API Laravel (GET /api/produk).
// Data dummy sengaja dihapus: ID dummy (1-6) tidak ada di database, sehingga
// checkout akan gagal ("exists:produk") dan masalah koneksi API jadi tersembunyi.

export const rupiah = (number: number) => "Rp " + number.toLocaleString("id-ID");
