import { useNavigate } from "react-router-dom";
import { LayoutProps } from "@/interfaces/interfaces";
import { useAuth } from "@/hooks/use-auth.hook";
import { useState } from "react";
import LogoutConfirmDialog from "./LogoutConfirmDialog";
import { NotificationButton } from "@/components/NotificationButton";
import { NotificationDrawer } from "./NotificationDrawer";
import { VerticalLayout } from "./VerticalLayout";

export default function Layout({ children, title }: LayoutProps) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => setShowLogoutModal(true);

  const confirmLogout = () => {
    logout();
    navigate("/user/login");
  };

  const cancelLogout = () => setShowLogoutModal(false);

  return (
    <div className="h-screen flex bg-slate-50 text-foreground overflow-hidden">
      <VerticalLayout onLogout={handleLogout} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {title && (
          <div className="shrink-0 border-b border-sky-100 bg-white/80 backdrop-blur">
            <div className="max-w-[1651px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                {title}
              </h1>
            </div>
          </div>
        )}

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1651px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </div>
        </main>
      </div>

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
