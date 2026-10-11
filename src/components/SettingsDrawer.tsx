import {
  ChevronRight,
  KeyRound,
  Library,
  ShieldCheck,
  Monitor,
  Moon,
  Sun,
  X,
} from "lucide-react";
import { useState } from "react";
import type { AuthUser } from "../services/authApi";
import ProviderSettingsPanel from "./ProviderSettingsPanel";

export type ThemeMode =
  | "light"
  | "dark"
  | "system";

interface SettingsDrawerProps {
  open: boolean;
  theme: ThemeMode;

  onClose: () => void;

  onThemeChange: (
    theme: ThemeMode,
  ) => void;

  onOpenIconLibrary: () => void;
  onOpenAdminDashboard: () => void;
  authUser: AuthUser;
}

// ========================================
// SETTINGS DRAWER
// ========================================

export default function SettingsDrawer({
  open,
  theme,
  onClose,
  onThemeChange,
  onOpenIconLibrary,
  onOpenAdminDashboard,
  authUser,
}: SettingsDrawerProps) {
  const [providerSettingsOpen, setProviderSettingsOpen] = useState(false);

  if (!open) {
    return null;
  }

  if (providerSettingsOpen) {
    return (
      <>
        <div className="drawer-overlay" onClick={onClose} />
        <aside className="settings-drawer">
          <ProviderSettingsPanel onBack={() => setProviderSettingsOpen(false)} />
        </aside>
      </>
    );
  }

  return (
    <>
      {/* Dark overlay behind drawer */}

      <div
        className="drawer-overlay"
        onClick={onClose}
      />

      <aside className="settings-drawer">
        {/* Header */}

        <div className="settings-header">
          <h2>Settings</h2>

          <button
            className="icon-button"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        <div className="settings-content">
          <button
            className="settings-navigation-item"
            onClick={onOpenIconLibrary}
            type="button"
          >
            <Library size={18} />
            <span>Icon Library</span>
            <ChevronRight size={16} />
          </button>

          {authUser.roles.includes("admin") && (
            <>
              <button className="settings-navigation-item" onClick={onOpenAdminDashboard} type="button">
                <ShieldCheck size={18} />
                <span>Admin Dashboard</span>
                <ChevronRight size={16} />
              </button>
              <button
                className="settings-navigation-item"
                onClick={() => setProviderSettingsOpen(true)}
                type="button"
              >
                <KeyRound size={18} />
                <span>Provider Settings</span>
                <ChevronRight size={16} />
              </button>
            </>
          )}

          <div className="settings-section">
            <h3>Appearance</h3>

            <p className="settings-label">
              Theme
            </p>

            {/* Light */}

            <label className="theme-option">
              <input
                type="radio"
                name="theme"
                checked={
                  theme === "light"
                }
                onChange={() =>
                  onThemeChange("light")
                }
              />

              <Sun size={18} />

              <span>Light</span>
            </label>

            {/* Dark */}

            <label className="theme-option">
              <input
                type="radio"
                name="theme"
                checked={
                  theme === "dark"
                }
                onChange={() =>
                  onThemeChange("dark")
                }
              />

              <Moon size={18} />

              <span>Dark</span>
            </label>

            {/* System */}

            <label className="theme-option">
              <input
                type="radio"
                name="theme"
                checked={
                  theme === "system"
                }
                onChange={() =>
                  onThemeChange("system")
                }
              />

              <Monitor size={18} />

              <span>System</span>
            </label>
          </div>
        </div>
      </aside>
    </>
  );
}
