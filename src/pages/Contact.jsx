import { useState } from "react";
import { Link } from "react-router-dom";
import SiteNav from "../components/SiteNav.jsx";
import useAuth from "../hooks/useAuth.js";
import { errorMessage } from "../services/api.js";
import { isMissingRoute } from "../services/orderService.js";
import * as contactService from "../services/contactService.js";
import { Reveal } from "../utils/motion.jsx";
import "./Welcome.css"; // shared .intro-* building blocks
import "./About.css"; // shared .ab-* page pieces (hero tag, cards, nav links, footer)
import "./Contact.css";

const TOPICS = [
  { id: "ORDER", label: "An order I placed", needsOrder: true },
  { id: "RETURN", label: "Returns and refunds", needsOrder: true },
  { id: "PAYMENT", label: "Payment", needsOrder: true },
  { id: "PRODUCT", label: "A product question" },
  { id: "OTHER", label: "Something else" },
];

const MAX_MESSAGE = 1000;

// Answers taken from how the store works today (checkout, pricing and order flow).
const QUICK = [
  { icon: "🚚", title: "Delivery", text: "Delivery is free on every order right now, with no minimum." },
  { icon: "↩️", title: "Returns", text: "Most items can be returned within 7 days of delivery." },
  { icon: "💳", title: "Payment", text: "Pay with cash or UPI on delivery. Online payment is coming soon." },
  { icon: "🧾", title: "Your order number", text: "It's shown on the confirmation screen after checkout. Add it below so we can find your order fast." },
];

function validate(f) {
  const e = {};
  if (f.name.trim().length < 2) e.name = "Enter your name";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) e.email = "Enter a valid email address";
  if (!f.topic) e.topic = "Choose what this is about";
  if (f.message.trim().length < 10) e.message = "Tell us a little more (at least 10 characters)";
  return e;
}

export default function Contact() {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: user?.name || "", email: user?.email || "", topic: "", orderNumber: "", message: "" });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | sending | sent
  const [error, setError] = useState("");

  const topic = TOPICS.find((t) => t.id === form.topic);

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    if (errors[k]) setErrors(({ [k]: _, ...rest }) => rest);
  };

  const submit = async (e) => {
    e.preventDefault();
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setError("");
    setStatus("sending");
    try {
      await contactService.sendMessage({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        topic: form.topic,
        orderNumber: topic?.needsOrder && form.orderNumber.trim() ? form.orderNumber.trim() : null,
        message: form.message.trim(),
      });
      setStatus("sent");
    } catch (err) {
      setStatus("idle");
      setError(
        isMissingRoute(err)
          ? "Sorry, we can't receive messages here yet. Please try again later."
          : errorMessage(err, "Couldn't send your message. Please try again.")
      );
    }
  };

  const reset = () => {
    setForm((f) => ({ ...f, topic: "", orderNumber: "", message: "" }));
    setStatus("idle");
  };

  return (
    <div className="intro ab">
      <SiteNav />

      {/* Hero */}
      <div className="ab-hero ct-hero">
        <div className="intro-blob b1" />
        <div className="intro-w">
          <span className="ab-tag intro-fade" style={{ "--d": "0ms" }}>Contact us</span>
          <h1 className="intro-fade" style={{ "--d": "100ms" }}>We're here to help.</h1>
          <p className="ab-lead intro-fade" style={{ "--d": "200ms" }}>
            Questions about an order, a return or a product? Send us a message and we'll get back to you by email.
          </p>
        </div>
      </div>

      <section className="intro-w ct-grid">
        {/* Form */}
        <Reveal className="ab-card ct-form-card">
          {status === "sent" ? (
            <div className="ct-done" role="status">
              <div className="ct-tick" aria-hidden="true">✓</div>
              <h2>Message sent</h2>
              <p>Thanks, {form.name.trim().split(" ")[0]}. We'll reply to <b>{form.email.trim()}</b>.</p>
              <div className="ct-done-cta">
                <Link to="/home" className="intro-btn sm ab-nav-btn">Back to shopping</Link>
                <button type="button" className="ct-link" onClick={reset}>Send another message</button>
              </div>
            </div>
          ) : (
            <form className="ct-form" onSubmit={submit} noValidate>
              <h2>Send us a message</h2>

              <Field label="Your name" error={errors.name}>
                <input value={form.name} onChange={set("name")} autoComplete="name" />
              </Field>
              <Field label="Email" error={errors.email}>
                <input type="email" value={form.email} onChange={set("email")} autoComplete="email" />
              </Field>
              <Field label="What's this about?" error={errors.topic} wide={!topic?.needsOrder}>
                <select value={form.topic} onChange={set("topic")}>
                  <option value="">Choose a topic</option>
                  {TOPICS.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
                </select>
              </Field>
              {topic?.needsOrder && (
                <Field label="Order number (optional)">
                  <input value={form.orderNumber} onChange={set("orderNumber")} placeholder="ORD-…" />
                </Field>
              )}
              <Field label="Message" error={errors.message} wide>
                <textarea rows={6} value={form.message} onChange={set("message")} maxLength={MAX_MESSAGE} />
                <span className="ct-count">{form.message.length}/{MAX_MESSAGE}</span>
              </Field>

              {error && <p className="auth-err ct-err">{error}</p>}

              <button className="intro-btn ab-nav-btn ct-send" disabled={status === "sending"}>
                {status === "sending" ? "Sending…" : "Send message"}
              </button>
            </form>
          )}
        </Reveal>

        {/* Quick answers */}
        <div className="ct-side">
          <h2>Quick answers</h2>
          {QUICK.map((q, i) => (
            <Reveal key={q.title} delay={i * 90} className="ab-card ct-quick">
              <i aria-hidden="true">{q.icon}</i>
              <div>
                <h3>{q.title}</h3>
                <p>{q.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <p className="ab-foot">© 2026 DealDuniya. All rights reserved.</p>
    </div>
  );
}

function Field({ label, error, wide, children }) {
  return (
    <label className={`ct-field ${wide ? "wide" : ""} ${error ? "bad" : ""}`}>
      <span>{label}</span>
      {children}
      {error && <small>{error}</small>}
    </label>
  );
}
