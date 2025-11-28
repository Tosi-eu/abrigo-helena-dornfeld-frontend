import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import SignUpMedicine from "./pages/RegisterMedicine";
import Transactions from "./pages/Transactions";
import Stock from "./pages/Stock";
import StockEntry from "./pages/StockIn";
import Resident from "./pages/Residents";
import RegisterResident from "./pages/RegisterResident";
import EditResident from "./pages/EditResident";
import StockOut from "./pages/StockOut";
import EditMedicine from "./pages/EditMedicine";
import EditInput from "./pages/EditInput";
import Medicines from "./pages/Medicines";
import Cabinets from "./pages/Cabinets";
import RegisterCabinet from "./pages/RegisterCabinet";
import EditCabinet from "./pages/EditCabinet";
import RegisterInput from "./pages/RegisterInput";
import Inputs from "./pages/Inputs";

import { AuthProvider } from "./context/auth-context";
import PrivateRoute from "./pages/PrivateRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/user/login" replace />} />
            <Route path="/user/login" element={<Auth />} />

            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/transactions"
              element={
                <PrivateRoute>
                  <Transactions />
                </PrivateRoute>
              }
            />
            <Route
              path="/medicines"
              element={
                <PrivateRoute>
                  <Medicines />
                </PrivateRoute>
              }
            />
            <Route
              path="/medicines/register"
              element={
                <PrivateRoute>
                  <SignUpMedicine />
                </PrivateRoute>
              }
            />
            <Route
              path="/medicines/edit"
              element={
                <PrivateRoute>
                  <EditMedicine />
                </PrivateRoute>
              }
            />
            <Route
              path="/stock"
              element={
                <PrivateRoute>
                  <Stock />
                </PrivateRoute>
              }
            />
            <Route
              path="/stock/in"
              element={
                <PrivateRoute>
                  <StockEntry />
                </PrivateRoute>
              }
            />
            <Route
              path="/stock/out"
              element={
                <PrivateRoute>
                  <StockOut />
                </PrivateRoute>
              }
            />
            <Route
              path="/residents"
              element={
                <PrivateRoute>
                  <Resident />
                </PrivateRoute>
              }
            />
            <Route
              path="/residents/register"
              element={
                <PrivateRoute>
                  <RegisterResident />
                </PrivateRoute>
              }
            />
            <Route
              path="/residents/edit"
              element={
                <PrivateRoute>
                  <EditResident />
                </PrivateRoute>
              }
            />
            <Route
              path="/inputs"
              element={
                <PrivateRoute>
                  <Inputs />
                </PrivateRoute>
              }
            />
            <Route
              path="/inputs/register"
              element={
                <PrivateRoute>
                  <RegisterInput />
                </PrivateRoute>
              }
            />
            <Route
              path="/inputs/edit"
              element={
                <PrivateRoute>
                  <EditInput />
                </PrivateRoute>
              }
            />
            <Route
              path="/cabinets"
              element={
                <PrivateRoute>
                  <Cabinets />
                </PrivateRoute>
              }
            />
            <Route
              path="/cabinets/register"
              element={
                <PrivateRoute>
                  <RegisterCabinet />
                </PrivateRoute>
              }
            />
            <Route
              path="/cabinets/edit"
              element={
                <PrivateRoute>
                  <EditCabinet />
                </PrivateRoute>
              }
            />
            <Route
              path="/user/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />
            <Route path="/user/forgot-password" element={<ForgotPassword />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
