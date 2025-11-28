import { useState } from "react";
import Layout from "@/components/Layout";
import { useNavigate } from "react-router-dom";

export default function NotifyDispatch() {
  const navigate = useNavigate();
  const [medicamento, setMedicamento] = useState("");
  const [destino, setDestino] = useState("SUS");
  const [paciente, setPaciente] = useState("");
  const [data, setData] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/notify");
  };

  return (
    <Layout title="Notificação de Receita SUS/Família">
      <div className="max-w-lg mx-auto mt-10 bg-gray-50 border border-gray-300 rounded-xl p-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          Notificação de Receita SUS/Família
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Medicamento
            </label>
            <input
              type="text"
              value={medicamento}
              onChange={(e) => setMedicamento(e.target.value)}
              className="w-full border border-gray-400 rounded-md p-2 text-sm"
              placeholder="Digite o nome do medicamento"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Destino da notificação
            </label>
            <select
              value={destino}
              onChange={(e) => setDestino(e.target.value)}
              className="w-full border border-gray-400 rounded-md p-2 text-sm"
            >
              <option value="SUS">SUS</option>
              <option value="Família">Família</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Residente
            </label>
            <input
              type="text"
              value={paciente}
              onChange={(e) => setPaciente(e.target.value)}
              className="w-full border border-gray-400 rounded-md p-2 text-sm"
              placeholder="Digite o nome do paciente"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data prevista de retirada
            </label>
            <input
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              className="w-full border border-gray-400 rounded-md p-2 text-sm"
            />
          </div>

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={() => navigate("/notify")}
              className="px-5 py-2 border border-gray-600 rounded-md text-sm font-semibold hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gray-800 text-white rounded-md text-sm font-semibold hover:bg-gray-900"
            >
              Gerar Notificação
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
