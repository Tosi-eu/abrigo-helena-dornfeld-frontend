import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Pill,
  FlaskConical,
  Boxes,
  Users,
  Archive,
  Grid,
  User,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth.hook";

const navigationTabs = [
  { name: "Painel", href: "/dashboard", icon: LayoutDashboard },
  { name: "Movimentações", href: "/movements", icon: ArrowLeftRight },
  { name: "Medicamentos", href: "/medicines", icon: Pill },
  { name: "Insumos", href: "/inputs", icon: FlaskConical },
  { name: "Estoque", href: "/stock", icon: Boxes },
  { name: "Residentes", href: "/residents", icon: Users },
  { name: "Armários", href: "/cabinets", icon: Archive },
  { name: "Gavetas", href: "/drawers", icon: Grid },
  { name: "Perfil", href: "/user/profile", icon: User },
];

interface SidebarProps {
  onLogout: () => void;
}

export function VerticalLayout({ onLogout }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <aside className="h-screen w-64 flex flex-col border-r border-sky-200 bg-sky-50">
      <div className="h-20 shrink-0 flex items-center px-4 border-b border-sky-200 bg-sky-100">
        <img
          src="/logo.png"
          className="h-20 cursor-pointer"
          onClick={() => navigate("/dashboard")}
        />
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
        {navigationTabs.map((item) => {
          const isActive =
            location.pathname === item.href ||
            (item.href !== "/dashboard" &&
              location.pathname.startsWith(item.href));

          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all
                ${
                  isActive
                    ? "bg-sky-200 text-sky-900 shadow-sm"
                    : "text-slate-700 hover:bg-sky-100 hover:text-sky-900"
                }`}
            >
              <Icon className="h-4 w-4" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {user && (
        <div className="p-3 border-t border-sky-200">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>
      )}
    </aside>
  );
}