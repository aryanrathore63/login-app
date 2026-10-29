import { FormEvent, useEffect, useRef, useState } from "react";
import { login } from "../api";

interface Props {
  email: string;
  onSuccess: (token: string, user: { firstName: string; lastName: string }) => void;
  onSkip: () => void;
}

export default function OtpModal({ email, onSuccess, onSkip }: Props) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => inputRef.current?.focus(), []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!/^\d{6}$/.test(code)) return setError("Enter the 6-digit code.");
    setLoading(true);
    try {
      const res = await login({ email, code });
      onSuccess(res.token, res.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="backdrop">
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="otp-title">
        <h2 id="otp-title">Welcome back</h2>
        <p>{email} is registered. Enter your 6-digit code to sign in.</p>
        <form onSubmit={onSubmit}>
          <input
            ref={inputRef}
            className="otp"
            inputMode="numeric"
            maxLength={6}
            autoComplete="one-time-code"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            placeholder="000000"
          />
          {error && <p className="error" role="alert">{error}</p>}
          <button className="primary" disabled={loading}>{loading ? "Checking…" : "Sign in"}</button>
          <button type="button" className="link" onClick={onSkip}>Skip and continue as guest</button>
        </form>
      </div>
    </div>
  );
}
