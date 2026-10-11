import { KeyRound, LoaderCircle, Save, ShieldCheck, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  listProviderSecrets,
  revokeProviderSecret,
  saveProviderSecret,
  type ProviderSecretSummary,
} from "../services/providerSecretsApi";
import {
  connectGoogleDrive,
  disconnectGoogleDrive,
  getGoogleDriveStatus,
  type GoogleDriveStatus,
} from "../services/googleDriveApi";

const PROVIDERS = [
  { id: "openai", label: "OpenAI", description: "Planner, code image, vision and raster generation" },
  { id: "gemini", label: "Gemini", description: "Optional Gemini planning and verification provider" },
  { id: "higgsfield", label: "Higgsfield", description: "Optional external image and motion provider" },
] as const;

export default function ProviderSettingsPanel({
  onBack,
  showBack = true,
  showDriveSettings = false,
}: {
  onBack: () => void;
  showBack?: boolean;
  showDriveSettings?: boolean;
}) {
  const [secrets, setSecrets] = useState<ProviderSecretSummary[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [driveStatus, setDriveStatus] = useState<GoogleDriveStatus | null>(null);
  const [driveBusy, setDriveBusy] = useState(false);

  const summaries = useMemo(
    () => new Map(secrets.map((secret) => [secret.provider, secret])),
    [secrets],
  );

  async function loadSecrets() {
    setLoading(true);
    setError(null);
    try {
      setSecrets(await listProviderSecrets());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load provider settings.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadSecrets();
  }, []);

  useEffect(() => {
    if (!showDriveSettings) return;
    void getGoogleDriveStatus().then(setDriveStatus).catch((reason) => {
      setNotice("Google Drive is optional and currently unavailable. Icons will continue saving locally.");
    });
  }, [showDriveSettings]);

  async function pollDriveConnection() {
    for (let attempt = 0; attempt < 30; attempt += 1) {
      await new Promise((resolve) => window.setTimeout(resolve, 1000));
      try {
        const next = await getGoogleDriveStatus();
        setDriveStatus(next);
        if (next.connected) {
          setNotice("Google Drive connected.");
          return;
        }
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : "Could not refresh Google Drive status.");
        return;
      }
    }
    setNotice("Authorization window opened. Click Connect again after completing Google authorization if the status has not changed.");
  }

  async function handleDriveConnect() {
    setDriveBusy(true);
    setError(null);
    try {
      const { authorization_url } = await connectGoogleDrive();
      const authorizationWindow = window.open(authorization_url, "_blank", "noopener,noreferrer");
      setNotice(authorizationWindow
        ? "Complete Google authorization in the browser, then return here."
        : "Your browser blocked the authorization window. Allow pop-ups for this app, then click Connect again.");
      setDriveBusy(false);
      void pollDriveConnection();
      return;
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not connect Google Drive.");
    }
    setDriveBusy(false);
  }

  async function handleDriveDisconnect() {
    setDriveBusy(true);
    setError(null);
    try {
      await disconnectGoogleDrive();
      setDriveStatus((current) => current ? { ...current, connected: false, ready: false } : current);
      setNotice("Google Drive disconnected.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not disconnect Google Drive.");
    } finally {
      setDriveBusy(false);
    }
  }

  async function handleSave(provider: string) {
    const value = values[provider]?.trim() || "";
    if (!value) {
      setError("Enter a provider key before saving.");
      return;
    }
    setSaving(provider);
    setError(null);
    setNotice(null);
    try {
      const summary = await saveProviderSecret(provider, value);
      setSecrets((current) => [
        ...current.filter((item) => item.provider !== provider || item.secret_name !== summary.secret_name),
        summary,
      ]);
      setValues((current) => ({ ...current, [provider]: "" }));
      setNotice(`${labelFor(provider)} key saved. New provider calls will use it.`);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save provider key.");
    } finally {
      setSaving(null);
    }
  }

  async function handleRevoke(provider: string) {
    setSaving(provider);
    setError(null);
    setNotice(null);
    try {
      await revokeProviderSecret(provider);
      setSecrets((current) => current.map((item) => (
        item.provider === provider ? { ...item, is_active: false } : item
      )));
      setNotice(`${labelFor(provider)} key revoked.`);
    } catch (revokeError) {
      setError(revokeError instanceof Error ? revokeError.message : "Could not revoke provider key.");
    } finally {
      setSaving(null);
    }
  }

  const driveConnected = driveStatus?.connected === true;
  const driveChecking = driveStatus === null;
  const driveEnabled = driveStatus?.enabled === true || driveConnected;

  return (
    <section className="provider-settings-panel">
      <div className="provider-settings-header">
        {showBack ? (
          <button type="button" className="settings-back-button" onClick={onBack}>
            ← Provider Settings
          </button>
        ) : <h3>Provider Settings</h3>}
        <ShieldCheck size={19} aria-hidden="true" />
      </div>

      <div className="provider-settings-intro">
        <KeyRound size={20} />
        <div>
          <h3>Provider API keys</h3>
          <p>Keys are encrypted in the configured local or cloud database. They are never displayed or returned in plaintext.</p>
        </div>
      </div>

      {loading && <p className="provider-settings-muted">Loading secure settings…</p>}
      {error && <div className="provider-settings-error">{error}</div>}
      {notice && <div className="provider-settings-notice">{notice}</div>}

      {!loading && PROVIDERS.map((provider) => {
        const summary = summaries.get(provider.id);
        const busy = saving === provider.id;
        return (
          <div className="provider-secret-card" key={provider.id}>
            <div className="provider-secret-card-heading">
              <div>
                <h4>{provider.label}</h4>
                <p>{provider.description}</p>
              </div>
              <span className={summary?.is_active ? "provider-secret-status active" : "provider-secret-status"}>
                {summary?.is_active ? "Configured" : "Not configured"}
              </span>
            </div>
            {summary?.is_active && (
              <div className="provider-secret-masked">
                Stored key: <code>{summary.masked_value}</code> · version {summary.version}
              </div>
            )}
            <div className="provider-secret-form">
              <input
                type="password"
                value={values[provider.id] || ""}
                onChange={(event) => setValues((current) => ({ ...current, [provider.id]: event.target.value }))}
                placeholder={summary?.is_active ? "Enter a new key to rotate it" : "Paste provider API key"}
                autoComplete="new-password"
              />
              <button type="button" className="settings-add-button" onClick={() => void handleSave(provider.id)} disabled={busy}>
                {busy ? <LoaderCircle size={15} className="spin" /> : <Save size={15} />}
                Save
              </button>
              {summary?.is_active && (
                <button type="button" className="settings-delete-button" onClick={() => void handleRevoke(provider.id)} disabled={busy}>
                  <Trash2 size={15} /> Revoke
                </button>
              )}
            </div>
          </div>
        );
      })}

      {showDriveSettings && (
        <div className="provider-secret-card">
          <div className="provider-secret-card-heading">
            <div>
              <h4>Shared Google Drive icon library</h4>
              <p>Optional shared library. Icons are always saved locally in encrypted SQLite first.</p>
            </div>
            <span className={driveStatus?.connected ? "provider-secret-status active" : "provider-secret-status"}>
              {driveConnected ? "Connected" : driveChecking ? "Checking…" : "Not connected"}
            </span>
          </div>
          {driveStatus && !driveStatus.client_configured && (
            <div className="provider-settings-muted">Place the downloaded Desktop OAuth JSON at <code>{driveStatus?.client_path || "the app-data path"}</code> first.</div>
          )}
          {!driveChecking && !driveEnabled ? (
            <div className="provider-settings-muted">Google Drive sync is disabled for now. User-uploaded and AI-generated SVG icons will remain available from this computer&apos;s encrypted SQLite library. Enable <code>GOOGLE_DRIVE_ICON_SYNC_ENABLED=true</code> later when shared Drive sync is needed.</div>
          ) : (
            <>
              <div className="provider-secret-form">
                <button type="button" className="settings-add-button" onClick={() => void handleDriveConnect()} disabled={driveBusy || driveConnected}>
                  {driveBusy ? <LoaderCircle size={15} className="spin" /> : <ShieldCheck size={15} />}
                  {driveConnected ? "Google Drive connected" : "Connect Google Drive"}
                </button>
                {driveConnected && (
                  <button type="button" className="settings-delete-button" onClick={() => void handleDriveDisconnect()} disabled={driveBusy}>
                    <Trash2 size={15} /> Disconnect
                  </button>
                )}
              </div>
              {driveStatus?.folder_configured && <div className="provider-secret-masked">Shared folder configured · Drive sync {driveStatus.ready ? "ready" : "waiting"}</div>}
            </>
          )}
        </div>
      )}
    </section>
  );
}

function labelFor(provider: string): string {
  return PROVIDERS.find((item) => item.id === provider)?.label || provider;
}
