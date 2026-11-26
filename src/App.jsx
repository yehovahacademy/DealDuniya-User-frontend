import { Routes, Route, Navigate } from "react-router-dom";
import UserLayout from "./layouts/UserLayout.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Products from "./pages/Products.jsx";
import ProductDetails from "./pages/ProductDetails.jsx";
import Welcome from "./pages/Welcome.jsx";
import Checkout from "./pages/Checkout.jsx";
import Offers from "./pages/Offers.jsx";
import Plus from "./pages/Plus.jsx";
import About from "./pages/About.jsx";
import Contact from "./pages/Contact.jsx";

// Flow: Welcome (/) -> DealDuniya home (/home) -> products, login, cart, etc.
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/welcome" element={<Navigate to="/" replace />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route element={<UserLayout />}>
        <Route path="/home" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/offers" element={<Offers />} />
        <Route path="/plus" element={<Plus />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Route>
    </Routes>
  );
}
