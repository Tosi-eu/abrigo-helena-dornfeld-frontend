import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth.hook";
import {
  getMedicines,
  getInputs,
  getResidents,
  getCabinets,
  getStock,
} from "@/api/requests";
import { fetchAllPaginated } from "@/helpers/paginacao.helper";
import {
  Medicine,
  Input,
  Patient,
  Cabinet,
  StockItemRaw,
} from "@/interfaces/interfaces";

interface DataContextType {
  medicines: Medicine[];
  inputs: Input[];
  residents: Patient[];
  cabinets: Cabinet[];
  stock: StockItemRaw[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  refreshMedicines: () => Promise<void>;
  refreshInputs: () => Promise<void>;
  refreshResidents: () => Promise<void>;
  refreshCabinets: () => Promise<void>;
  refreshStock: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within DataProvider");
  }
  return context;
};

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider = ({ children }: DataProviderProps) => {
  const { user } = useAuth();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [inputs, setInputs] = useState<Input[]>([]);
  const [residents, setResidents] = useState<Patient[]>([]);
  const [cabinets, setCabinets] = useState<Cabinet[]>([]);
  const [stock, setStock] = useState<StockItemRaw[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMedicines = useCallback(async () => {
    try {
      const allMedicines = await fetchAllPaginated(
        (page, limit) => getMedicines(page, limit),
        100,
      );
      setMedicines(allMedicines as Medicine[]);
    } catch (err) {
      console.error("Error loading medicines:", err);
      setMedicines([]);
    }
  }, []);

  const loadInputs = useCallback(async () => {
    try {
      const allInputs = await fetchAllPaginated(
        (page, limit) => getInputs(page, limit),
        100,
      );
      setInputs(allInputs as Input[]);
    } catch (err) {
      console.error("Error loading inputs:", err);
      setInputs([]);
    }
  }, []);

  const loadResidents = useCallback(async () => {
    try {
      const allResidents = await fetchAllPaginated(
        (page, limit) => getResidents(page, limit),
        100,
      );
      setResidents(allResidents as Patient[]);
    } catch (err) {
      console.error("Error loading residents:", err);
      setResidents([]);
    }
  }, []);

  const loadCabinets = useCallback(async () => {
    try {
      const allCabinets = await fetchAllPaginated(
        (page, limit) => getCabinets(page, limit),
        100,
      );
      setCabinets(allCabinets as Cabinet[]);
    } catch (err) {
      console.error("Error loading cabinets:", err);
      setCabinets([]);
    }
  }, []);

  const loadStock = useCallback(async () => {
    try {
      const allStock = await fetchAllPaginated(
        (page, limit) => getStock(page, limit),
        100,
      );
      setStock(allStock as StockItemRaw[]);
    } catch (err) {
      console.error("Error loading stock:", err);
      setStock([]);
    }
  }, []);

  const loadAllData = useCallback(async () => {
    if (!user) {
      setMedicines([]);
      setInputs([]);
      setResidents([]);
      setCabinets([]);
      setStock([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await Promise.all([
        loadMedicines(),
        loadInputs(),
        loadResidents(),
        loadCabinets(),
        loadStock(),
      ]);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao carregar dados";
      setError(errorMessage);
      console.error("Error loading all data:", err);
    } finally {
      setLoading(false);
    }
  }, [user, loadMedicines, loadInputs, loadResidents, loadCabinets, loadStock]);

  useEffect(() => {
    if (user) {
      loadAllData();
    } else {
      setMedicines([]);
      setInputs([]);
      setResidents([]);
      setCabinets([]);
      setStock([]);
      setLoading(false);
    }
  }, [user, loadAllData]);

  const refresh = useCallback(async () => {
    await loadAllData();
  }, [loadAllData]);

  const refreshMedicines = useCallback(async () => {
    await loadMedicines();
  }, [loadMedicines]);

  const refreshInputs = useCallback(async () => {
    await loadInputs();
  }, [loadInputs]);

  const refreshResidents = useCallback(async () => {
    await loadResidents();
  }, [loadResidents]);

  const refreshCabinets = useCallback(async () => {
    await loadCabinets();
  }, [loadCabinets]);

  const refreshStock = useCallback(async () => {
    await loadStock();
  }, [loadStock]);

  const value: DataContextType = {
    medicines,
    inputs,
    residents,
    cabinets,
    stock,
    loading,
    error,
    refresh,
    refreshMedicines,
    refreshInputs,
    refreshResidents,
    refreshCabinets,
    refreshStock,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

