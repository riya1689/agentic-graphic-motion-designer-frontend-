import { LogIn, LoaderCircle } from "lucide-react";
import { useState } from "react";

import { login, type AuthUser } from "../services/authApi";

interface LoginPageProps {
  onLogin: (user: AuthUser) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const user = await login(email, password);
      onLogin(user);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <div className="auth-brand">NG<span>X</span></div>
        <h1>Welcome back</h1>
        <p>Sign in to Agentic Design AI.</p>
        {error && <div className="auth-error">{error}</div>}
        <label>
          Company email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="username"
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />
        </label>
        <button className="auth-submit" type="submit" disabled={loading}>
          {loading ? <LoaderCircle className="spin" size={17} /> : <LogIn size={17} />}
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </main>
  );
}
