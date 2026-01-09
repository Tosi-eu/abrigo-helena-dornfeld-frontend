import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";

import { AuthProvider } from "./context/auth-context";
import PrivateRoute from "./pages/PrivateRoute";
import { NotificationProvider } from "./context/notification.context";
import { LoadingFallback } from "./components/LoadingFallback";

const Auth = lazy(() => import("./pages/Auth"));
const Profile = lazy(() => import("./pages/Profile"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const SignUpMedicine = lazy(() => import("./pages/RegisterMedicine"));
const Movements = lazy(() => import("./pages/Movements"));
const Stock = lazy(() => import("./pages/Stock"));
const StockEntry = lazy(() => import("./pages/StockIn"));
const Resident = lazy(() => import("./pages/Residents"));
const RegisterResident = lazy(() => import("./pages/RegisterResident"));
const EditResident = lazy(() => import("./pages/EditResident"));
const StockOut = lazy(() => import("./pages/StockOut"));
const EditStock = lazy(() => import("./pages/EditStock"));
const EditMedicine = lazy(() => import("./pages/EditMedicine"));
const EditInput = lazy(() => import("./pages/EditInput"));
const Medicines = lazy(() => import("./pages/Medicines"));
const Cabinets = lazy(() => import("./pages/Cabinets"));
const RegisterCabinet = lazy(() => import("./pages/RegisterCabinet"));
const EditCabinet = lazy(() => import("./pages/EditCabinet"));
const RegisterInput = lazy(() => import("./pages/RegisterInput"));
const Inputs = lazy(() => import("./pages/Inputs"));
const Drawers = lazy(() => import("./pages/Drawers"));
const EditDrawer = lazy(() => import("./pages/EditDrawer"));
const RegisterDrawer = lazy(() => import("./pages/RegisterDrawer"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <NotificationProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Navigate to="/user/login" replace />} />
              <Route
                path="/user/login"
                element={
                  <Suspense fallback={<LoadingFallback title="Carregando login..." />}>
                    <Auth />
                  </Suspense>
                }
              />

              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Suspense fallback={<LoadingFallback title="Carregando dashboard..." />}>
                      <Dashboard />
                    </Suspense>
                  </PrivateRoute>
                }
              />
              <Route
                path="/Movements"
                element={
                  <PrivateRoute>
                    <Suspense fallback={<LoadingFallback title="Carregando movimentações..." />}>
                      <Movements />
                    </Suspense>
                  </PrivateRoute>
                }
              />
              <Route
                path="/medicines"
                element={
                  <PrivateRoute>
                    <Suspense fallback={<LoadingFallback title="Carregando medicamentos..." />}>
                      <Medicines />
                    </Suspense>
                  </PrivateRoute>
                }
              />
              <Route
                path="/medicines/register"
                element={
                  <PrivateRoute>
                    <Suspense fallback={<LoadingFallback title="Carregando formulário..." />}>
                      <SignUpMedicine />
                    </Suspense>
                  </PrivateRoute>
                }
              />
              <Route
                path="/medicines/edit"
                element={
                  <PrivateRoute>
                    <Suspense fallback={<LoadingFallback title="Carregando edição..." />}>
                      <EditMedicine />
                    </Suspense>
                  </PrivateRoute>
                }
              />
              <Route
                path="/stock"
                element={
                  <PrivateRoute>
                    <Suspense fallback={<LoadingFallback title="Carregando estoque..." />}>
                      <Stock />
                    </Suspense>
                  </PrivateRoute>
                }
              />
              <Route
                path="/stock/in"
                element={
                  <PrivateRoute>
                    <Suspense fallback={<LoadingFallback title="Carregando entrada..." />}>
                      <StockEntry />
                    </Suspense>
                  </PrivateRoute>
                }
              />
              <Route
                path="/stock/out"
                element={
                  <PrivateRoute>
                    <Suspense fallback={<LoadingFallback title="Carregando saída..." />}>
                      <StockOut />
                    </Suspense>
                  </PrivateRoute>
                }
              />
              <Route
                path="/stock/edit"
                element={
                  <PrivateRoute>
                    <Suspense fallback={<LoadingFallback title="Carregando edição..." />}>
                      <EditStock />
                    </Suspense>
                  </PrivateRoute>
                }
              />
              <Route
                path="/residents"
                element={
                  <PrivateRoute>
                    <Suspense fallback={<LoadingFallback title="Carregando residentes..." />}>
                      <Resident />
                    </Suspense>
                  </PrivateRoute>
                }
              />
              <Route
                path="/residents/register"
                element={
                  <PrivateRoute>
                    <Suspense fallback={<LoadingFallback title="Carregando formulário..." />}>
                      <RegisterResident />
                    </Suspense>
                  </PrivateRoute>
                }
              />
              <Route
                path="/residents/edit"
                element={
                  <PrivateRoute>
                    <Suspense fallback={<LoadingFallback title="Carregando edição..." />}>
                      <EditResident />
                    </Suspense>
                  </PrivateRoute>
                }
              />
              <Route
                path="/inputs"
                element={
                  <PrivateRoute>
                    <Suspense fallback={<LoadingFallback title="Carregando insumos..." />}>
                      <Inputs />
                    </Suspense>
                  </PrivateRoute>
                }
              />
              <Route
                path="/inputs/register"
                element={
                  <PrivateRoute>
                    <Suspense fallback={<LoadingFallback title="Carregando formulário..." />}>
                      <RegisterInput />
                    </Suspense>
                  </PrivateRoute>
                }
              />
              <Route
                path="/inputs/edit"
                element={
                  <PrivateRoute>
                    <Suspense fallback={<LoadingFallback title="Carregando edição..." />}>
                      <EditInput />
                    </Suspense>
                  </PrivateRoute>
                }
              />
              <Route
                path="/cabinets"
                element={
                  <PrivateRoute>
                    <Suspense fallback={<LoadingFallback title="Carregando armários..." />}>
                      <Cabinets />
                    </Suspense>
                  </PrivateRoute>
                }
              />
              <Route
                path="/cabinets/register"
                element={
                  <PrivateRoute>
                    <Suspense fallback={<LoadingFallback title="Carregando formulário..." />}>
                      <RegisterCabinet />
                    </Suspense>
                  </PrivateRoute>
                }
              />
              <Route
                path="/cabinets/edit"
                element={
                  <PrivateRoute>
                    <Suspense fallback={<LoadingFallback title="Carregando edição..." />}>
                      <EditCabinet />
                    </Suspense>
                  </PrivateRoute>
                }
              />
              <Route
                path="/drawers"
                element={
                  <PrivateRoute>
                    <Suspense fallback={<LoadingFallback title="Carregando gavetas..." />}>
                      <Drawers />
                    </Suspense>
                  </PrivateRoute>
                }
              />
              <Route
                path="/drawer/register"
                element={
                  <PrivateRoute>
                    <Suspense fallback={<LoadingFallback title="Carregando formulário..." />}>
                      <RegisterDrawer />
                    </Suspense>
                  </PrivateRoute>
                }
              />
              <Route
                path="/drawers/edit"
                element={
                  <PrivateRoute>
                    <Suspense fallback={<LoadingFallback title="Carregando edição..." />}>
                      <EditDrawer />
                    </Suspense>
                  </PrivateRoute>
                }
              />
              <Route
                path="/user/profile"
                element={
                  <PrivateRoute>
                    <Suspense fallback={<LoadingFallback title="Carregando perfil..." />}>
                      <Profile />
                    </Suspense>
                  </PrivateRoute>
                }
              />
              <Route
                path="/user/forgot-password"
                element={
                  <Suspense fallback={<LoadingFallback title="Carregando..." />}>
                    <ForgotPassword />
                  </Suspense>
                }
              />
            </Routes>
          </BrowserRouter>
        </NotificationProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
