import { useState } from "react";
import { Star, Minus, Plus } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { rupiah } from "../data/products";

const Detail = () => {
  const { selected, products, addToCart, go } = useAppContext();
  const [activeImage, setActiveImage] = useState(selected?.image ?? "");
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  if (!selected) return <p>Produk tidak ditemukan.</p>;

  const handleAdd = async () => {
    if (adding) return;
    setAdding(true);
    setError("");
    const result = await addToCart(selected, quantity);
    setAdding(false);
    if (result.ok) go("keranjang");
    else if (!result.needLogin) setError(result.message);
  };

  const gallery = [
    selected.image,
    ...products.filter((p) => p.id !== selected.id).slice(0, 2).map((p) => p.image),
  ];

  return (
    <main className="page">
      <div className="detail-card">
        <div className="detail-layout">
          <div className="detail-gallery">
            <img className="detail-main-image" src={activeImage} alt={selected.name} />
            <div className="detail-thumbs">
              {gallery.map((image) => (
                <button
                  key={image}
                  className={activeImage === image ? "thumb active" : "thumb"}
                  onClick={() => setActiveImage(image)}
                >
                  <img src={image} alt="" />
                </button>
              ))}
            </div>
          </div>

          <div className="detail-content">
            <h1>{selected.name}</h1>
            <div className="rating">
              {[0, 1, 2, 3, 4].map((i) => <Star key={i} size={15} fill="currentColor" />)}
              <span>(4.9 / 45 ulasan)</span>
            </div>
            <div className="detail-price">{rupiah(selected.price)}</div>
            <p className="detail-summary">{selected.summary}</p>

            <div className="detail-spec">
              <div className="spec-row"><i className="spec-dot" /><span>Kategori</span><b>: {selected.name}</b></div>
              <div className="spec-row"><i className="spec-dot" /><span>Stok</span><b>: {selected.stock}</b></div>
              <div className="spec-row"><i className="spec-dot" /><span>Ukuran</span><b>: {selected.size}</b></div>
              <div className="spec-row"><i className="spec-dot" /><span>Bahan</span><b>: {selected.material}</b></div>
            </div>

            <div className="buy-row">
              <div className="quantity-control">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus size={14} /></button>
                <b>{quantity}</b>
                <button onClick={() => setQuantity(Math.min(selected.stock, quantity + 1))}><Plus size={14} /></button>
              </div>
              <button className="add-cart" disabled={adding || selected.stock < 1} onClick={handleAdd}>
                {selected.stock < 1 ? "Stok Habis" : adding ? "Menambahkan..." : "Tambah ke Keranjang"}
              </button>
            </div>
            {error && <p className="auth-error">{error}</p>}
          </div>
        </div>

        <div className="description-box">
          <h3>Deskripsi</h3>
          <p>{selected.description}</p>
        </div>
      </div>
    </main>
  );
};

export default Detail;