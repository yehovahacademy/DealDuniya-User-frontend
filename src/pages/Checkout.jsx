import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth.js";
import { useStore } from "../context/CartContext.jsx";
import { errorMessage } from "../services/api.js";
import * as orderService from "../services/orderService.js";
import * as addressService from "../services/addressService.js";
import { inr, tint } from "../data/products.js";
import { bagTotals } from "../utils/pricing.js";
import "./Checkout.css";

const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Delhi", "Goa", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Madhya Pradesh",
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan",
  "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
];

const EMPTY_ADDRESS = {
  fullName: "", phone: "", addressLine1: "", addressLine2: "", city: "", state: "", postalCode: "", country: "India",
};

const PAYMENT = [
  { id: "COD", title: "Cash on delivery", text: "Pay in cash or UPI when your order arrives." },
  { id: "ONLINE", title: "Pay online", text: "UPI, cards and net banking. Coming soon.", disabled: true },
];

function validate(a) {
  const e = {};
  if (a.fullName.trim().length < 2) e.fullName = "Enter the recipient's full name";
  const digits = a.phone.replace(/\D/g, "").replace(/^(91|0)(?=\d{10}$)/, "");
  if (!/^[6-9]\d{9}$/.test(digits)) e.phone = "Enter a valid 10-digit mobile number";
  if (a.addressLine1.trim().length < 5) e.addressLine1 = "Enter house number and street";
  if (!a.city.trim()) e.city = "Enter your city";
  if (!a.state) e.state = "Choose a state";
  if (!/^[1-9]\d{5}$/.test(a.postalCode.trim())) e.postalCode = "Enter a valid 6-digit PIN code";
  return e;
}

export default function Checkout() {
  const { user } = useAuth();
  const { cartItems, cartStatus, reloadCart, orderPlaced, openDrawer, toast } = useStore();
  const navigate = useNavigate();

  // Saved addresses come from the backend; the order is placed against one of their ids.
  const [addresses, setAddresses] = useState([]);
  const [addrStatus, setAddrStatus] = useState("loading"); // loading | ready | missing | error
  const [selectedId, setSelectedId] = useState(null);
  const [address, setAddress] = useState({ ...EMPTY_ADDRESS, fullName: user?.name || "" }); // new-address form
  const [editing, setEditing] = useState(false); // address form open
  const [editingId, setEditingId] = useState(null); // null = new address, else the address being edited
  const [busyId, setBusyId] = useState(null); // address with a remove / set-default request in flight
  const [savingAddr, setSavingAddr] = useState(false);
  const [addrError, setAddrError] = useState("");
  const [errors, setErrors] = useState({});
  const [payment, setPayment] = useState("COD");
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    addressService
      .getAddresses()
      .then((list) => {
        if (cancelled) return;
        setAddresses(sortAddresses(list));
        setSelectedId((list.find((a) => a.isDefault) || list[0])?.id ?? null);
        setEditing(list.length === 0);
        setAddrStatus("ready");
      })
      .catch((err) => {
        if (cancelled) return;
        setAddrStatus(orderService.isMissingRoute(err) ? "missing" : "error");
        setEditing(true);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!user) return <Navigate to="/login" replace state={{ from: "/checkout" }} />;

  if (order) return <OrderPlaced order={order} />;

  const totals = bagTotals(cartItems);
  const itemCount = cartItems.reduce((n, x) => n + x.qty, 0);
  const outOfStock = cartItems.filter(({ p, qty }) => qty > p.stock);

  const set = (k) => (e) => {
    setAddress((a) => ({ ...a, [k]: e.target.value }));
    if (errors[k]) setErrors(({ [k]: _, ...rest }) => rest);
  };

  const selected = addresses.find((a) => a.id === selectedId);

  const closeForm = () => {
    setErrors({});
    setAddrError("");
    setEditing(false);
    setEditingId(null);
  };

  const startNew = () => {
    setAddress({ ...EMPTY_ADDRESS, fullName: user.name || "" });
    setEditingId(null);
    setErrors({});
    setAddrError("");
    setEditing(true);
  };

  const startEdit = (a) => {
    setAddress(Object.fromEntries(Object.keys(EMPTY_ADDRESS).map((k) => [k, a[k] ?? ""])));
    setEditingId(a.id);
    setErrors({});
    setAddrError("");
    setEditing(true);
  };

  const saveAddress = async (e) => {
    e.preventDefault();
    const errs = validate(address);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    const clean = Object.fromEntries(Object.entries(address).map(([k, v]) => [k, v.trim()]));
    const body = { ...clean, addressLine2: clean.addressLine2 || null };
    setAddrError("");
    setSavingAddr(true);
    try {
      const saved = editingId
        ? await addressService.updateAddress(editingId, body)
        : await addressService.createAddress({ ...body, isDefault: addresses.length === 0 });
      setAddresses((list) => sortAddresses(editingId ? list.map((a) => (a.id === saved.id ? saved : a)) : [...list, saved]));
      setSelectedId(saved.id);
      setAddrStatus("ready");
      closeForm();
    } catch (err) {
      setAddrError(errorMessage(err, "Couldn't save this address. Please try again."));
    } finally {
      setSavingAddr(false);
    }
  };

  const makeDefault = async (a) => {
    setBusyId(a.id);
    try {
      await addressService.updateAddress(a.id, { isDefault: true });
      setAddresses((list) => sortAddresses(list.map((x) => ({ ...x, isDefault: x.id === a.id }))));
      setSelectedId(a.id);
      toast("Default address updated");
    } catch (err) {
      toast(errorMessage(err, "Couldn't update the default address"));
    } finally {
      setBusyId(null);
    }
  };

  const removeAddress = async (a) => {
    if (!window.confirm(`Remove the address at ${a.addressLine1}, ${a.city}?`)) return;
    setBusyId(a.id);
    try {
      await addressService.deleteAddress(a.id);
      const rest = addresses.filter((x) => x.id !== a.id);
      setAddresses(rest);
      if (selectedId === a.id) setSelectedId((rest.find((x) => x.isDefault) || rest[0])?.id ?? null);
      if (!rest.length) startNew();
      toast("Address removed");
    } catch (err) {
      toast(errorMessage(err, "Couldn't remove this address"));
    } finally {
      setBusyId(null);
    }
  };

  const place = async () => {
    if (!selected) return;
    setError("");
    setPlacing(true);
    try {
      const created = await orderService.placeOrder({ addressId: selected.id, paymentMethod: payment });
      // Keep each product as it looked in the bag, for the confirmation screen
      // (order items only carry name, price and productId).
      const products = Object.fromEntries(cartItems.map(({ p }) => [p.id, p]));
      setOrder({ ...created, products });
      orderPlaced(); // empties the bag at once and refreshes stock
    } catch (err) {
      if (err?.response?.status === 400) reloadCart(); // stock/price may have changed — show the latest bag
      setError(errorMessage(err, "Couldn't place your order. Please try again."));
    } finally {
      setPlacing(false);
    }
  };

  if (cartStatus === "loading" && !cartItems.length) {
    return <section className="co-empty"><p className="empty">Loading your bag…</p></section>;
  }

  if (!cartItems.length) {
    return (
      <section className="co-empty">
        <div className="co-empty-icon">👜</div>
        <h2>Your bag is empty</h2>
        <p className="empty">Add a few things to your bag, then come back here to check out.</p>
        <Link to="/products" className="btn">Browse products</Link>
      </section>
    );
  }

  const canPlace = !!selected && !editing && !placing && !outOfStock.length;

  return (
    <section className="co">
      <div className="co-top">
        <button className="co-back" onClick={() => navigate(-1)}>← Back</button>
        <h1>Checkout</h1>
        <ol className="co-steps" aria-label="Checkout progress">
          <li className="done">Bag</li>
          <li className={editing ? "on" : "done"}>Address</li>
          <li className={editing ? "" : "on"}>Payment</li>
        </ol>
      </div>

      <div className="co-grid">
        <div className="co-main">
          {/* 1. Address */}
          <div className="co-card">
            <div className="co-card-h">
              <span className="co-n">1</span>
              <h2>Delivery address</h2>
              {!editing && addrStatus === "ready" && <button className="co-link" onClick={startNew}>+ Add new</button>}
            </div>

            {addrStatus === "loading" ? (
              <p className="empty">Loading your addresses…</p>
            ) : editing ? (
              <form className="co-form" onSubmit={saveAddress} noValidate>
                {editingId && <p className="co-form-title">Edit address</p>}
                <Field label="Full name" error={errors.fullName}>
                  <input value={address.fullName} onChange={set("fullName")} autoComplete="name" />
                </Field>
                <Field label="Mobile number" error={errors.phone}>
                  <input value={address.phone} onChange={set("phone")} inputMode="tel" autoComplete="tel" placeholder="10-digit number" maxLength={14} />
                </Field>
                <Field label="Flat, house no., street" error={errors.addressLine1} wide>
                  <input value={address.addressLine1} onChange={set("addressLine1")} autoComplete="address-line1" />
                </Field>
                <Field label="Area, landmark (optional)" wide>
                  <input value={address.addressLine2} onChange={set("addressLine2")} autoComplete="address-line2" />
                </Field>
                <Field label="City" error={errors.city}>
                  <input value={address.city} onChange={set("city")} autoComplete="address-level2" />
                </Field>
                <Field label="PIN code" error={errors.postalCode}>
                  <input value={address.postalCode} onChange={set("postalCode")} inputMode="numeric" autoComplete="postal-code" maxLength={6} />
                </Field>
                <Field label="State" error={errors.state}>
                  <select value={address.state} onChange={set("state")} autoComplete="address-level1">
                    <option value="">Select state</option>
                    {STATES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </Field>
                <Field label="Country">
                  <input value={address.country} disabled />
                </Field>
                {addrError && <p className="auth-err co-form-err">{addrError}</p>}
                <div className="co-form-f">
                  <button className="btn" type="submit" disabled={savingAddr}>{savingAddr ? "Saving…" : editingId ? "Save changes" : "Save and deliver here"}</button>
                  {addresses.length > 0 && <button type="button" className="co-link" onClick={closeForm}>Cancel</button>}
                </div>
              </form>
            ) : (
              <div className="co-pay" role="radiogroup" aria-label="Delivery address">
                {addresses.map((a) => (
                  <label key={a.id} className={`co-opt ${selectedId === a.id ? "on" : ""} ${busyId === a.id ? "busy" : ""}`}>
                    <input type="radio" name="address" checked={selectedId === a.id} onChange={() => setSelectedId(a.id)} />
                    <span className="co-addr-txt">
                      <b>
                        {a.fullName} <span className="co-phone">{a.phone}</span>
                        {a.isDefault && <em className="co-default">Default</em>}
                      </b>
                      <small>
                        {a.addressLine1}
                        {a.addressLine2 && <>, {a.addressLine2}</>}, {a.city}, {a.state} {a.postalCode}
                      </small>
                      <span className="co-addr-actions">
                        <AddrAction onClick={() => startEdit(a)} disabled={!!busyId}>Edit</AddrAction>
                        {!a.isDefault && <AddrAction onClick={() => makeDefault(a)} disabled={!!busyId}>Set as default</AddrAction>}
                        <AddrAction onClick={() => removeAddress(a)} disabled={!!busyId} danger>Remove</AddrAction>
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            )}
            {addrStatus === "error" && !addrError && (
              <p className="auth-err co-form-err">Couldn't load your saved addresses. You can still add one.</p>
            )}
          </div>

          {/* 2. Payment */}
          <div className={`co-card ${editing ? "dim" : ""}`}>
            <div className="co-card-h">
              <span className="co-n">2</span>
              <h2>Payment method</h2>
            </div>
            <div className="co-pay" role="radiogroup" aria-label="Payment method">
              {PAYMENT.map((m) => (
                <label key={m.id} className={`co-opt ${payment === m.id ? "on" : ""} ${m.disabled ? "off" : ""}`}>
                  <input type="radio" name="payment" value={m.id} checked={payment === m.id} disabled={m.disabled || editing} onChange={() => setPayment(m.id)} />
                  <span>
                    <b>{m.title}</b>
                    <small>{m.text}</small>
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* 3. Items */}
          <div className="co-card">
            <div className="co-card-h">
              <span className="co-n">3</span>
              <h2>Review items</h2>
              <button className="co-link" onClick={() => openDrawer("cart")}>Edit bag</button>
            </div>
            <ul className="co-items">
              {cartItems.map(({ p, qty }) => (
                <li key={p.id}>
                  <div className={`co-thumb ${tint(p)}`}>{p.image && <img src={p.image} alt="" />}</div>
                  <div className="co-item-info">
                    <b>{p.name}</b>
                    <small>Qty {qty} · {inr(p.price)} each</small>
                    {qty > p.stock && <small className="co-warn">Only {p.stock} left. Lower the quantity in your bag.</small>}
                  </div>
                  <span className="co-line">{inr(p.price * qty)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Summary */}
        <aside className="co-sum">
          <h2>Order summary</h2>
          <div className="co-row"><span>Price ({itemCount} {itemCount === 1 ? "item" : "items"})</span><span>{inr(totals.mrp)}</span></div>
          {totals.discount > 0 && <div className="co-row"><span>Discount</span><span className="co-ok">−{inr(totals.discount)}</span></div>}
          <div className="co-row"><span>Delivery</span><span>{totals.shippingFee ? inr(totals.shippingFee) : <span className="co-ok">Free</span>}</span></div>
          <div className="co-row co-total"><span>Total</span><span>{inr(totals.total)}</span></div>
          {totals.discount > 0 && <p className="co-save">You save {inr(totals.discount)} on this order</p>}

          {error && <p className="auth-err co-err">{error}</p>}

          <button className="btn co-place" disabled={!canPlace} onClick={place}>
            {placing ? "Placing order…" : !selected || editing ? "Add an address to continue" : `Place order · ${inr(totals.total)}`}
          </button>
          <p className="co-fine">🔒 Safe and secure checkout. 7-day easy returns.</p>
        </aside>
      </div>
    </section>
  );
}

// Default address first, then newest first (the order the backend returns).
const sortAddresses = (list) => [...list].sort((a, b) => b.isDefault - a.isDefault);

// A button inside the address <label>: preventDefault stops the click from also selecting the radio.
function AddrAction({ onClick, disabled, danger, children }) {
  return (
    <button
      type="button"
      className={`co-link ${danger ? "co-danger" : ""}`}
      disabled={disabled}
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
    >
      {children}
    </button>
  );
}

function Field({ label, error, wide, children }) {
  return (
    <label className={`co-field ${wide ? "wide" : ""} ${error ? "bad" : ""}`}>
      <span>{label}</span>
      {children}
      {error && <small>{error}</small>}
    </label>
  );
}

function OrderPlaced({ order }) {
  const items = order.items || [];
  const count = items.reduce((n, i) => n + i.quantity, 0);
  return (
    <section className="co-done">
      <div className="co-tick" aria-hidden="true">✓</div>
      <h1>Order placed!</h1>
      <p className="empty">
        Thanks for shopping with DealDuniya. Your order number is <b>{order.orderNumber}</b>.
      </p>

      <div className="co-done-card">
        <h2 className="co-done-h">Items in this order ({count})</h2>
        <ul className="co-items">
          {items.map((i) => {
            const p = order.products?.[i.productId];
            return (
              <li key={i.id}>
                <div className={`co-thumb ${p ? tint(p) : ""}`}>{p?.image && <img src={p.image} alt="" />}</div>
                <div className="co-item-info">
                  <b>{i.productName}</b>
                  <small>Qty {i.quantity} · {inr(i.unitPrice)} each</small>
                </div>
                <span className="co-line">{inr(i.lineTotal)}</span>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="co-done-card">
        {Number(order.shippingFee) > 0 && (
          <>
            <div className="co-row"><span>Subtotal</span><span>{inr(order.subtotal)}</span></div>
            <div className="co-row"><span>Delivery</span><span>{inr(order.shippingFee)}</span></div>
          </>
        )}
        <div className="co-row co-total co-total-top"><span>Total ({count} {count === 1 ? "item" : "items"})</span><span>{inr(order.totalAmount)}</span></div>
        <div className="co-row"><span>Payment</span><span>{order.paymentMethod === "ONLINE" ? "Paid online" : "Cash on delivery"}</span></div>
        <div className="co-row">
          <span>Delivering to</span>
          <span>{order.shippingName}, {order.shippingCity} {order.shippingPostalCode}</span>
        </div>
      </div>
      <div className="co-done-cta">
        <Link to="/products" className="btn">Continue shopping</Link>
        <Link to="/home" className="pill">Back to home</Link>
      </div>
    </section>
  );
}
