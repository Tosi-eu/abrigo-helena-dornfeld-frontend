import {
  createNotificationEvent,
  getMedicines,
  getResidents,
  patchNotificationEvent,
} from "@/api/requests";
import { formatDateToPtBr } from "@/helpers/dates.helper";
import { useAuth } from "@/hooks/use-auth.hook";
import { useNotifications } from "@/hooks/use-notification.hook";
import { toast } from "@/hooks/use-toast.hook";
import { EventStatus } from "@/utils/enums";
import { parseDateFromString } from "@/utils/utils";
import { ptBR } from "date-fns/locale";
import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";

interface CreateNotificationFormProps {
  editData?: any;
  onCreated?: () => void;
}

export default function CreateNotificationForm({
  editData,
  onCreated,
}: CreateNotificationFormProps) {
  const { reload } = useNotifications();
  const { user } = useAuth();

  const [saving, setSaving] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(true);

  const [medicamentos, setMedicamentos] = useState([]);
  const [residentes, setResidentes] = useState([]);

  const [form, setForm] = useState({
    medicamento_id: 0,
    residente_id: 0,
    destino: "SUS",
    data_prevista: null as Date | null,
    criado_por: user?.id,
    status: EventStatus.PENDENTE,
    id: undefined as number | undefined,
  });

  useEffect(() => {
    if (editData) {
      setForm({
        medicamento_id: editData.medicamento_id,
        residente_id: editData.residente_id,
        destino: editData.destino,
        data_prevista: parseDateFromString(editData.data_prevista),
        criado_por: editData.criado_por,
        status: editData.status,
        id: editData.id,
      });
    } else {
      setForm({
        medicamento_id: 0,
        residente_id: 0,
        destino: "SUS",
        data_prevista: null,
        criado_por: user?.id,
        status: EventStatus.PENDENTE,
        id: undefined,
      });
    }
  }, [editData, user?.id]);

  useEffect(() => {
    async function loadOptions() {
      setLoadingOptions(true);
      try {
        const meds = await getMedicines(1, 200);
        const res = await getResidents(1, 200);
        setMedicamentos(meds.data || meds);
        setResidentes(res.data || res);
      } catch (err) {
        toast({
          title: "Erro ao carregar opções",
          description: "Não foi possível carregar residentes ou medicamentos.",
          variant: "error",
        });
      } finally {
        setLoadingOptions(false);
      }
    }
    loadOptions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.medicamento_id || !form.residente_id || !form.data_prevista) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha medicamento, residente e data prevista.",
        variant: "error",
      });
      return;
    }

    setSaving(true);
    try {
      if (form.id) {
        await patchNotificationEvent(form.id, form);
        toast({ title: "Notificação atualizada", variant: "success" });
      } else {
        await createNotificationEvent(form);
        toast({ title: "Notificação criada", variant: "success" });
      }

      reload();
      onCreated?.();
    } catch (err) {
      toast({
        title: "Erro ao salvar notificação",
        description: "Ocorreu um erro ao tentar salvar a notificação.",
        variant: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loadingOptions) {
    return <div className="text-slate-500 py-4">Carregando opções...</div>;
  }

  return (
    <form
      id="create-notification-form"
      onSubmit={handleSubmit}
      className="space-y-4 pb-20"
    >
      <div className="flex flex-col">
        <label
          htmlFor="medicamento"
          className="mb-1 text-sm font-medium text-slate-700"
        >
          Medicamento
        </label>
        <select
          id="medicamento"
          className="border rounded p-2 w-full bg-white"
          value={form.medicamento_id}
          onChange={(e) =>
            setForm({ ...form, medicamento_id: Number(e.target.value) })
          }
        >
          <option value={0}>Selecione o Medicamento</option>
          {medicamentos.map((m) => (
            <option key={m.id} value={m.id}>
              {m.nome}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col">
        <label
          htmlFor="residente"
          className="mb-1 text-sm font-medium text-slate-700"
        >
          Residente
        </label>
        <select
          id="residente"
          className="border rounded p-2 w-full bg-white"
          value={form.residente_id}
          onChange={(e) =>
            setForm({ ...form, residente_id: Number(e.target.value) })
          }
        >
          <option value={0}>Selecione o Residente</option>
          {residentes.map((r) => (
            <option key={r.casela} value={r.casela}>
              {r.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col">
        <label
          htmlFor="destino"
          className="mb-1 text-sm font-medium text-slate-700"
        >
          Destino
        </label>
        <select
          id="destino"
          className="border rounded p-2 w-full bg-white"
          value={form.destino}
          onChange={(e) => setForm({ ...form, destino: e.target.value })}
        >
          <option value="SUS">SUS</option>
          <option value="Família">Família</option>
        </select>
      </div>

      <div className="flex flex-col">
        <label
          htmlFor="data_prevista"
          className="mb-1 text-sm font-medium text-slate-700"
        >
          Data Prevista
        </label>
        <DatePicker
          id="data_prevista"
          selected={form.data_prevista}
          onChange={(date: Date) => setForm({ ...form, data_prevista: date })}
          dateFormat="dd-MM-yyyy"
          locale={ptBR}
          placeholderText="Selecione a data"
          className="border rounded p-2 w-full"
        />
        {form.data_prevista && (
          <div className="text-sm text-slate-500 mt-1">
            Selecionado: {formatDateToPtBr(form.data_prevista)}
          </div>
        )}
      </div>
    </form>
  );
}
