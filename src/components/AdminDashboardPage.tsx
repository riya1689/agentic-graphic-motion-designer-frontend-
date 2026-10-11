import { LoaderCircle, Plus, RefreshCw, ShieldCheck, UserCog } from "lucide-react";
import { useEffect, useState } from "react";

import type { AuthUser } from "../services/authApi";
import {
  createManagedUser,
  listManagedUsers,
  resetManagedUserPassword,
  setManagedUserStatus,
  type ManagedUser,
} from "../services/adminApi";
import ProviderSettingsPanel from "./ProviderSettingsPanel";

interface AdminDashboardPageProps {
  authUser: AuthUser;
  onBack: () => void;
}

export default function AdminDashboardPage({ authUser, onBack }: AdminDashboardPageProps) {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("viewer");
  const [resetFor, setResetFor] = useState<string | null>(null);
  const [resetPassword, setResetPassword] = useState("");

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      setUsers(await listManagedUsers());
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const created = await createManagedUser({
        email: email.trim(),
        display_name: displayName.trim(),
        temporary_password: password,
        roles: [role],
      });
      setUsers((current) => [...current, created]);
      setEmail("");
      setDisplayName("");
      setPassword("");
      setRole("viewer");
      setNotice(`Created ${created.email}.`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not create user.");
    } finally {
      setBusy(false);
    }
  };

  const handleStatus = async (user: ManagedUser) => {
    setBusy(true);
    setError(null);
    try {
      const updated = await setManagedUserStatus(
        user.id,
        user.status === "active" ? "disabled" : "active",
      );
      setUsers((current) => current.map((item) => item.id === updated.id ? { ...item, ...updated, roles: user.roles } : item));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not update user status.");
    } finally {
      setBusy(false);
    }
  };

  const handleReset = async (user: ManagedUser) => {
    if (!resetPassword) {
      setError("Enter a temporary password with at least 10 characters.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const updated = await resetManagedUserPassword(user.id, resetPassword);
      setUsers((current) => current.map((item) => item.id === updated.id ? { ...item, ...updated, roles: user.roles } : item));
      setResetFor(null);
      setResetPassword("");
      setNotice(`Password reset for ${user.email}.`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not reset password.");
    } finally {
      setBusy(false);
    }
  };

  if (!authUser.roles.includes("admin")) {
    return <div className="admin-dashboard-error">Administrator role required.</div>;
  }

  return (
    <main className="admin-dashboard-page">
      <div className="admin-dashboard-header">
        <button type="button" className="settings-back-button" onClick={onBack}>← Admin Dashboard</button>
        <button type="button" className="settings-icon-button" onClick={() => void loadUsers()} aria-label="Refresh users">
          <RefreshCw size={17} />
        </button>
      </div>

      {error && <div className="provider-settings-error">{error}</div>}
      {notice && <div className="provider-settings-notice">{notice}</div>}

      <section className="admin-dashboard-section">
        <div className="admin-dashboard-section-title">
          <ShieldCheck size={20} />
          <div><h2>Provider access</h2><p>Configure the OpenAI key used by client workspaces.</p></div>
        </div>
        <ProviderSettingsPanel onBack={() => undefined} showBack={false} showDriveSettings />
      </section>

      <section className="admin-dashboard-section">
        <div className="admin-dashboard-section-title">
          <UserCog size={20} />
          <div><h2>Client users</h2><p>Create and manage login accounts.</p></div>
        </div>
        <form className="admin-user-form" onSubmit={handleCreate}>
          <input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Client email" />
          <input required value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="Display name" />
          <input type="password" required minLength={10} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Temporary password (10+ characters)" />
          <select value={role} onChange={(event) => setRole(event.target.value)} aria-label="User role">
            <option value="viewer">Viewer</option>
            <option value="designer">Designer</option>
            <option value="admin">Admin</option>
          </select>
          <button className="settings-add-button" type="submit" disabled={busy}>
            {busy ? <LoaderCircle size={16} className="spin" /> : <Plus size={16} />} Create user
          </button>
        </form>

        {loading ? <p className="provider-settings-muted">Loading users…</p> : (
          <div className="admin-user-list">
            {users.map((user) => (
              <article className="admin-user-row" key={user.id}>
                <div>
                  <strong>{user.display_name}</strong>
                  <span>{user.email}</span>
                  <small>{user.roles.join(", ") || "no role"} · {user.status}</small>
                </div>
                <div className="admin-user-actions">
                  <button type="button" className="settings-edit-button" onClick={() => void handleStatus(user)} disabled={busy || user.id === authUser.id}>
                    {user.status === "active" ? "Disable" : "Activate"}
                  </button>
                  <button type="button" className="settings-edit-button" onClick={() => setResetFor(resetFor === user.id ? null : user.id)} disabled={busy}>Reset password</button>
                </div>
                {resetFor === user.id && (
                  <div className="admin-reset-row">
                    <input type="password" minLength={10} value={resetPassword} onChange={(event) => setResetPassword(event.target.value)} placeholder="New temporary password" />
                    <button type="button" className="settings-add-button" onClick={() => void handleReset(user)} disabled={busy}>Save</button>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
