import { FormEvent, useState } from "react";
import { isValidEmail, register } from "../api";

export default function Register() {
  const [email, setEmail] = useState("");
  const [firstName, setFirst] = useState("");
  const [lastName, setLast] = useState("");
  const [error, setError] = useState("");
  const [code, setCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!isValidEmail(email)) return setError("Enter a valid email address.");
    if (!firstName.trim() || !lastName.trim()) return setError("Enter your first and last name.");
    setLoading(true);
    try {
      const res = await register({ email, firstName, lastName });
      setCode(res.code);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (code) {
    return (
      <section className="card">
        <h1>You're registered</h1>
        <p>Your login code is shown once. Save it now, you'll need it at checkout.</p>
        <div className="code">{code}</div>
      </section>
    );
  }

  return (
    <section className="card">
      <h1>Create your account</h1>
      <form onSubmit={onSubmit} noValidate>
        <label>
          First name
          <input value={firstName} onChange={(e) => setFirst(e.target.value)} />
        </label>
        <label>
          Last name
          <input value={lastName} onChange={(e) => setLast(e.target.value)} />
        </label>
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        {error && <p className="error" role="alert">{error}</p>}
        <button className="primary" disabled={loading}>{loading ? "Registering…" : "Register"}</button>
      </form>
    </section>
  );
}
