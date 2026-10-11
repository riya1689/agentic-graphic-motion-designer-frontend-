import {
  LogOut,
  Menu,
} from "lucide-react";

interface TopBarProps {
  onToggleSidebar: () => void;
  onLogout: () => void;
}

export default function TopBar({
  onToggleSidebar,
  onLogout,
}: TopBarProps) {
  return (
    <header className="topbar">
      {/* ==================================
          PROJECT BRAND
         ================================== */}

      <div className="topbar-left">
        <button
          className="icon-button mobile-menu-button"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          <Menu size={19} />
        </button>

        <div className="brand">
          <div className="brand-logo">NGX</div>

          <span className="brand-name">
            Agentic Design AI
          </span>
        </div>
      </div>

      <button
        className="icon-button"
        onClick={onLogout}
        aria-label="Sign out"
        title="Sign out"
      >
        <LogOut size={17} />
      </button>

      {/* ==================================
          SEARCH
         ================================== */}

      {/* <button className="search-button">
        <Search size={17} />

        <span>Search</span>
      </button> */}
    </header>
  );
}
