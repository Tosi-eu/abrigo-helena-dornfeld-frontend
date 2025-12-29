import { getBackendLoadingStatus } from "@/api/requests";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const checkBackend = async () => {
      try {
        const res = await getBackendLoadingStatus();
        if (res.ok) {
          setProgress(100);
          setTimeout(() => navigate("/user/login"), 500); 
          clearInterval(interval);
        } else {
          throw new Error("Backend ainda não pronto");
        }
      } catch {
        setProgress((prev) => Math.min(prev + 5, 90));
      }
    };

    interval = setInterval(checkBackend, 500);

    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <div className="h-screen w-screen flex flex-col justify-center items-center bg-sky-100">
      <img src="/logo.png" alt="Logo" className="w-32 mb-4" />
      <h1 className="text-sky-900 font-bold text-3xl mb-6">Abrigo Helena Dornfeld</h1>

      <div className="w-64 h-4 bg-sky-200 rounded-full overflow-hidden">
        <div
          className="h-4 bg-sky-900 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
