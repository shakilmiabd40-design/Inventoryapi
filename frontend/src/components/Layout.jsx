import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";

const navItems = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/products", label: "Products" },
  { to: "/categories", label: "Categories" },
  { to: "/history", label: "Stock history" },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="min-h-screen flex" style={{ background: "var(--paper)" }}>
      <aside
        className="w-56 shrink-0 flex flex-col justify-between border-r"
        style={{ borderColor: "var(--line)", background: "var(--surface)" }}
      >
        <div>
          <div className="px-5 py-5 border-b" style={{ borderColor: "var(--line)" }}>
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded flex items-center justify-center font-mono text-sm font-bold text-white"
                style={{ background: "var(--amber)" }}
              >
                #
              </div>
              <span className="font-display font-extrabold text-lg tracking-tight">
                Stockroom
              </span>
            </div>
          </div>

          <nav className="px-3 py-4 flex flex-col gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `px-3 py-2 rounded text-sm font-medium transition-colors ${
                    isActive ? "text-white" : "hover:bg-black/5"
                  }`
                }
                style={({ isActive }) => ({
                  background: isActive ? "var(--ink)" : "transparent",
                  color: isActive ? "white" : "var(--ink)",
                })}
              >
                {item.label}
              </NavLink>
            ))}
            {user?.role === "ADMIN" && (
              <NavLink
                to="/team"
                className={({ isActive }) =>
                  `px-3 py-2 rounded text-sm font-medium transition-colors ${
                    isActive ? "text-white" : "hover:bg-black/5"
                  }`
                }
                style={({ isActive }) => ({
                  background: isActive ? "var(--ink)" : "transparent",
                  color: isActive ? "white" : "var(--ink)",
                })}
              >
                Team
              </NavLink>
            )}
          </nav>
        </div>

        <div className="px-4 py-4 border-t" style={{ borderColor: "var(--line)" }}>
          <div className="text-sm font-medium truncate">{user?.name}</div>
          <div className="text-xs truncate mb-2" style={{ color: "var(--ink-soft)" }}>
            {user?.email}
          </div>
          <button
            onClick={handleLogout}
            className="text-xs font-medium underline"
            style={{ color: "var(--ink-soft)" }}
          >
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <div className="max-w-6xl mx-auto px-8 py-8">{children}</div>
      </main>
    </div>
  );
}
