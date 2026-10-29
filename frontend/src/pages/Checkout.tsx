import { FormEvent, useEffect, useState } from "react";
import { checkEmail, isValidEmail, submitCheckout } from "../api";
import OtpModal from "../components/OtpModal";

export default function Checkout() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);

  const [token, setToken] = useState<string>();
  const [user, setUser] = useState<{ firstName: string; lastName: string } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [skippedEmail, setSkippedEmail] = useState<string | null>(null);

  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const emailValid = isValidEmail(email);
  const normalized = email.trim().toLowerCase();

  // Background recognition check: debounced, cancelled if the email changes.
  useEffect(() => {
    if (!emailValid || token || skippedEmail === normalized) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const { exists } = await checkEmail(normalized);
        if (!cancelled && exists) setShowModal(true);
      } catch {
        /* recognition is best-effort; ignore failures */
      }
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [emailValid, normalized, token, skippedEmail]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!emailValid) return setError("Enter a valid email address.");
    if (!phone.trim()) return setError("Enter your phone number.");
    if (!address.trim()) return setError("Enter your shipping address.");
    setLoading(true);
    try {
      await submitCheckout({ email, phone, shippingAddress: address }, token);
      setDone(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <section className="card">
        <h1>Order received</h1>
        <p>Thanks{user ? `, ${user.firstName}` : ""}. We saved your shipping details.</p>
      </section>
    );
  }

  return (
    <section className="card">
      {user && <p className="greeting">Signed in as {user.firstName} {user.lastName}</p>}
      <h1>Shipping details</h1>
      <form onSubmit={onSubmit} noValidate>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setEmailTouched(true)}
            aria-invalid={emailTouched && !emailValid}
          />
          {email && (
            <small className={emailValid ? "ok" : "hint"}>
              {emailValid ? "Looks good" : "Keep typing: name@example.com"}
            </small>
          )}
        </label>
        <label>
          Phone number
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </label>
        <label>
          Shipping address
          <textarea rows={3} value={address} onChange={(e) => setAddress(e.target.value)} />
        </label>
        {error && <p className="error" role="alert">{error}</p>}
        <button className="primary" disabled={loading}>{loading ? "Saving…" : "Place order"}</button>
      </form>

      {showModal && (
        <OtpModal
          email={normalized}
          onSuccess={(t, u) => {
            setToken(t);
            setUser(u);
            setShowModal(false);
          }}
          onSkip={() => {
            setSkippedEmail(normalized);
            setShowModal(false);
          }}
        />
      )}
    </section>
  );
}
