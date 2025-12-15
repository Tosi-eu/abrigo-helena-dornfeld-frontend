import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "/logo.png";
import { LayoutProps } from "@/interfaces/interfaces";
import { useAuth } from "@/hooks/use-auth.hook";
import { useEffect, useState } from "react";
import LogoutConfirmDialog from "./LogoutConfirmDialog";
import { NotificationButton } from "@/components/NotificationButton";
import { NotificationDrawer } from "./NotificationDrawer";
import { getTodayNotifications } from "@/api/requests";

export default function Layout({ children, title }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [reminderEvents, setReminderEvents] = useState<any[]>([]);
  const [notificationCount, setNotificationCount] = useState(0);

  const navigation = [
    { name: "Painel", href: "/dashboard" },
    { name: "Movimentações", href: "/Movements" },
    { name: "Medicamentos", href: "/medicines" },
    { name: "Insumos", href: "/inputs" },
    { name: "Estoque", href: "/stock" },
    { name: "Residentes", href: "/residents" },
    { name: "Armários", href: "/cabinets" },
    { name: "Perfil", href: "/user/profile" },
  ];

  const handleLogout = () => setShowLogoutModal(true);
  const confirmLogout = () => {
    logout();
    navigate("/user/login");
  };
  const cancelLogout = () => setShowLogoutModal(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const resp = await getTodayNotifications();
        if (resp.count > 0) {
          setReminderEvents(resp.data);
          setNotificationCount(resp.count);
        }
      } catch (err) {
        console.error("Erro ao buscar notificações", err);
      }
    };
    if (user) fetchNotifications();
  }, [user]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="backdrop-blur bg-white/70 border-b border-slate-200/70 sticky top-0 z-30">
        <div className="max-w-[1651px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2">
            <img src={logo} alt="Logo" className="h-12 w-auto" />
          </Link>

          <nav className="hidden md:flex items-center gap-2">
            {navigation.map((item) => {
              const isActive =
                location.pathname === item.href ||
                (item.href !== "/dashboard" &&
                  location.pathname.startsWith(item.href));

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all 
                    ${
                      isActive
                        ? "bg-sky-100 text-sky-700 shadow-sm"
                        : "text-slate-600 hover:bg-sky-50 hover:text-sky-700"
                    }`}
                >
                  {item.name}
                </Link>
              );
            })}

            {user && (
              <button
                onClick={handleLogout}
                className="ml-4 text-sm px-3 py-2 rounded-xl border border-red-300 text-red-600 hover:bg-red-50 transition"
              >
                Sair
              </button>
            )}
          </nav>
        </div>
      </header>

      {title && (
        <div className="max-w-[1651px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            {title}
          </h1>
        </div>
      )}

      <main className="max-w-[1651px] mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {children}
      </main>

      <NotificationButton />
      <NotificationDrawer />

      <LogoutConfirmDialog
        open={showLogoutModal}
        onCancel={cancelLogout}
        onConfirm={confirmLogout}
      />
    </div>
  );
}
