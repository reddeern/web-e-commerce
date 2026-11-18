import { ShieldCheck, Truck, Award } from "lucide-react";
import { useAppContext } from "../context/AppContext";

const Home = () => {
  const { go, openDetail, products, isLoading, loadError, search } = useAppContext();

  // Filter produk berdasarkan input search
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase())
  );

  // Jika sedang mencari (search tidak kosong), tampilkan hasil pencarian.
  // Jika tidak mencari, tampilkan maksimal 4 produk pertama untuk beranda.
  const displayProducts = search.trim() !== "" ? filteredProducts : products.slice(0, 4);

  return (
    <>
      <section className="hero">
        <div className="hero-content">
          <h1>
            Koleksi Topeng
            <br />
            Malangan
          </h1>
          <p>Kenali karakternya. Rasakan ceritanya. Miliki karyanya.</p>
          <button className="primary-button hero-button" onClick={() => go("produk")}>
            Belanja Sekarang
          </button>
        </div>
        <div className="hero-art">
          <img src="/images/beranda.topeng.png" alt="Koleksi Topeng Malangan" className="hero-mask-image" />
        </div>
      </section>

      <section className="benefits">
        <div className="benefit-item">
          <div className="benefit-icon"><ShieldCheck size={26} /></div>
          <span>
            <b>Topeng asli malangan</b>
            <small>Karya budaya khas malang</small>
          </span>
        </div>
        <div className="benefit-item">
          <div className="benefit-icon"><Truck size={26} /></div>
          <span>
            <b>Pengiriman Aman Dan Terkendali</b>
            <small>Dikemas dengan hati-hati</small>
          </span>
        </div>
        <div className="benefit-item">
          <div className="benefit-icon"><Award size={26} /></div>
          <span>
            <b>Kualitas Terjaga</b>
            <small>Dibuat oleh pengrajin lokal</small>
          </span>
        </div>
      </section>

      <section className="home-collection">
        <h2 className="page-title" style={{ marginBottom: "20px", fontSize: "22px" }}>
          {search.trim() !== "" ? `Hasil Pencarian "${search}"` : "Koleksi Unggulan"}
        </h2>

        {isLoading ? (
          <p style={{ textAlign: "center", width: "100%" }}>Memuat koleksi unggulan...</p>
        ) : loadError ? (
          <p className="auth-error" style={{ textAlign: "center", width: "100%" }}>{loadError}</p>
        ) : displayProducts.length === 0 ? (
          <p style={{ textAlign: "center", width: "100%", color: "#6f5846" }}>Produk tidak ditemukan.</p>
        ) : (
          <div className="home-product-grid">
            {displayProducts.map((product) => (
              <button className="home-product-card" key={product.id} onClick={() => openDetail(product)}>
                <div className="home-product-image">
                  <img src={product.image} alt={product.name} />
                </div>
                <span>{product.name}</span>
              </button>
            ))}
          </div>
        )}
      </section>
    </>
  );
};

export default Home;