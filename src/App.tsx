import { AppProvider, useAppContext } from "./context/AppContext";
import Header from "./components/Header";
import Home from "./pages/Home";
import Catalog from "./pages/Catalog";
import Detail from "./pages/Detail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";
import "./App.css";

const AppContent = () => {
  const { page, authReady, selected } = useAppContext();
  const isAuthPage = page === "login" || page === "register";

  // Tunggu pemulihan sesi (cek token) agar header tidak berkedip
  if (!authReady) return <div className="app" />;

  return (
    <div className="app">
      {!isAuthPage && <Header />}
      
      {page === "home" && <Home />}
      {page === "produk" && <Catalog />}
      {page === "detail" && <Detail key={selected?.id} />}
      {page === "keranjang" && <Cart />}
      {page === "checkout" && <Checkout />}
      {page === "pesanan" && <Orders />}
      {page === "profil" && <Profile />}
      {page === "login" && <Auth isRegister={false} />}
      {page === "register" && <Auth isRegister={true} />}
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;