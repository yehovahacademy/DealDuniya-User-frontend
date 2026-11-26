import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth.js";
import { useStore } from "../context/CartContext.jsx";
import { errorMessage } from "../services/api.js";

export default function Login() {
  const { user, login, register } = useAuth();
  const { toast } = useStore();
  const navigate = useNavigate();
  const from = useLocation().state?.from || "/home"; // e.g. back to /checkout
  const [mode, setMode] = useState("login"); // login | register
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={from} replace />;

  const isRegister = mode === "register";
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (isRegister) await register(form.name.trim(), form.email.trim().toLowerCase(), form.password);
      else await login(form.email.trim(), form.password);
      toast(isRegister ? "Account created" : "Welcome back");
      navigate(from, { replace: true });
    } catch (err) {
      setError(errorMessage(err, isRegister ? "Registration failed" : "Login failed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="auth">
      <form className="auth-card" onSubmit={submit}>
        <h2>{isRegister ? "Create your account" : "Log in"}</h2>
        <p className="empty">{isRegister ? "Sign up to save your bag and check out faster." : "Log in to add items to your bag."}</p>

        {isRegister && (
          <label>Name<input value={form.name} onChange={set("name")} required autoComplete="name" /></label>
        )}
        <label>Email<input type="email" value={form.email} onChange={set("email")} required autoComplete="email" /></label>
        <label>
          Password
          <input
            type="password"
            value={form.password}
            onChange={set("password")}
            required
            minLength={isRegister ? 8 : undefined}
            autoComplete={isRegister ? "new-password" : "current-password"}
          />
        </label>

        {error && <p className="auth-err">{error}</p>}

        <button className="btn" disabled={busy}>{busy ? "Please wait…" : isRegister ? "Create account" : "Log in"}</button>
        <button type="button" className="auth-sw" onClick={() => { setMode(isRegister ? "login" : "register"); setError(""); }}>
          {isRegister ? "Already have an account? Log in" : "New here? Create an account"}
        </button>
      </form>
    </section>
  );
}
