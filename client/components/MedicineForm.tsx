import { useEffect, useState, memo } from "react";
import { Controller } from "react-hook-form";
import DatePicker from "react-datepicker";
import { ptBR } from "date-fns/locale";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from "react-router-dom";

import { MedicineFormProps } from "@/interfaces/interfaces";
import { toast } from "@/hooks/use-toast.hook";
import { getErrorMessage } from "@/helpers/validation.helper";
import { useFormWithZod } from "@/hooks/use-form-with-zod";
import {
  medicineFormSchema,
  type MedicineFormData,
} from "@/schemas/medicine-form.schema";
import {
  ItemStockType,
  OriginType,
  SectorType,
  StockTypeLabels,
} from "@/utils/enums";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

export const MedicineForm = memo(function MedicineForm({
  medicines,
  caselas,
  cabinets,
  drawers,
  onSubmit,
}: MedicineFormProps) {
  const navigate = useNavigate();
  const [medicineOpen, setMedicineOpen] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useFormWithZod(medicineFormSchema, {
    defaultValues: {
      id: undefined,
      quantity: undefined,
      stockType: undefined,
      expirationDate: null,
      casela: null,
      cabinetId: null,
      drawerId: null,
      origin: null,
      sector: SectorType.FARMACIA,
      lot: null,
      observacao: null,
    },
  });

  const stockType = watch("stockType");
  const selectedMedicineId = watch("id");
  const casela = watch("casela");

  const selectedMedicine = medicines.find((m) => m.id === selectedMedicineId);
  const isEmergencyCart = stockType === ItemStockType.CARRINHO;
  const isIndividual = stockType === ItemStockType.INDIVIDUAL;

  useEffect(() => {
    if (isEmergencyCart) {
      setValue("sector", SectorType.ENFERMAGEM);
    }
  }, [isEmergencyCart, setValue]);

  useEffect(() => {
    setValue("cabinetId", null);
    setValue("drawerId", null);
  }, [stockType, setValue]);

  useEffect(() => {
    if (!isIndividual) {
      setValue("casela", null);
    }
  }, [stockType, setValue, isIndividual]);

  useEffect(() => {
    if (casela) {
      const selected = caselas.find((c) => c.casela === casela);
      if (selected) {
      }
    }
  }, [casela, caselas]);

  const handleMedicineSelect = (id: number) => {
    setValue("id", id);
    setMedicineOpen(false);
  };

  const onFormSubmit = async (data: MedicineFormData) => {
    try {
      onSubmit({
        id: data.id,
        quantity: data.quantity,
        stockType: data.stockType,
        expirationDate: data.expirationDate ?? new Date(),
        casela: data.casela ?? undefined,
        cabinetId: data.cabinetId ?? undefined,
        drawerId: data.drawerId ?? undefined,
        origin: data.origin ?? "",
        sector: data.sector,
        lot: data.lot ?? undefined,
        observacao: data.observacao ?? undefined,
        isEmergencyCart,
      });
    } catch (err: unknown) {
      toast({
        title: "Erro ao processar formulário",
        description: getErrorMessage(
          err,
          "Não foi possível processar o formulário.",
        ),
        variant: "error",
        duration: 3000,
      });
    }
  };

  const storageOptions = isEmergencyCart ? drawers : cabinets;
  const selectedCasela = caselas.find((c) => c.casela === casela);

  return (
    <form
      onSubmit={handleSubmit(onFormSubmit)}
      className="bg-white border border-slate-200 rounded-xl shadow-sm p-8 space-y-8"
    >
      <div className="bg-sky-50 px-4 py-3 rounded-lg border border-sky-100">
        <h2 className="text-lg font-semibold text-slate-800">
          Informações do Medicamento
        </h2>
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-semibold text-slate-700">
          Medicamento <span className="text-red-500">*</span>
        </label>
        <Controller
          name="id"
          control={control}
          render={({ field }) => (
            <>
              <Popover open={medicineOpen} onOpenChange={setMedicineOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    className={cn(
                      "w-full justify-between bg-white",
                      errors.id && "border-red-500",
                    )}
                  >
                    {selectedMedicine
                      ? `${selectedMedicine.name} ${selectedMedicine.dosage} ${selectedMedicine.measurementUnit}`
                      : "Selecione o medicamento"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Buscar medicamento..." />
                    <CommandEmpty>Nenhum medicamento encontrado.</CommandEmpty>
                    <CommandGroup>
                      {medicines.map((m) => (
                        <CommandItem
                          key={m.id}
                          value={`${m.name} ${m.dosage} ${m.measurementUnit}`}
                          onSelect={() => {
                            field.onChange(m.id);
                            handleMedicineSelect(m.id);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedMedicineId === m.id
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                          {m.name} {m.dosage} {m.measurementUnit}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              {errors.id && (
                <p className="text-sm text-red-500 mt-1">{errors.id.message}</p>
              )}
            </>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="grid gap-2">
          <label className="text-sm font-semibold text-slate-700">
            Quantidade <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            {...register("quantity", { valueAsNumber: true })}
            min={1}
            max={999999}
            className={cn(
              "w-full border rounded-lg px-3 py-2 text-sm",
              errors.quantity ? "border-red-500" : "border-slate-300",
            )}
          />
          {errors.quantity && (
            <p className="text-sm text-red-500 mt-1">
              {errors.quantity.message}
            </p>
          )}
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-semibold text-slate-700">
            Validade
          </label>
          <Controller
            name="expirationDate"
            control={control}
            render={({ field }) => (
              <DatePicker
                selected={field.value}
                onChange={(date: Date | null) => field.onChange(date)}
                locale={ptBR}
                dateFormat="dd/MM/yyyy"
                placeholderText="dd/mm/aaaa"
                allowSameDay={true}
                strictParsing={true}
                showPopperArrow={false}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                calendarClassName="react-datepicker-calendar"
              />
            )}
          />
        </div>
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-semibold text-slate-700">
          Tipo de estoque <span className="text-red-500">*</span>
        </label>
        <select
          {...register("stockType")}
          className={cn(
            "w-full border rounded-lg px-3 py-2 text-sm bg-white",
            errors.stockType ? "border-red-500" : "border-slate-300",
          )}
        >
          <option value="" disabled hidden>
            Selecione
          </option>
          {Object.values(ItemStockType).map((t) => (
            <option key={t} value={t}>
              {StockTypeLabels[t]}
            </option>
          ))}
        </select>
        {errors.stockType && (
          <p className="text-sm text-red-500 mt-1">
            {errors.stockType.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="grid gap-2">
          <label className="text-sm font-semibold text-slate-700">Casela</label>
          <select
            {...register("casela", { valueAsNumber: true })}
            disabled={!isIndividual}
            className={cn(
              "w-full border rounded-lg px-3 py-2 text-sm",
              errors.casela ? "border-red-500" : "border-slate-300",
              !isIndividual
                ? "bg-slate-100 text-slate-500 cursor-not-allowed"
                : "bg-white",
            )}
          >
            <option value="">Selecione</option>
            {caselas.map((c) => (
              <option key={c.casela} value={c.casela}>
                {c.casela}
              </option>
            ))}
          </select>
          {errors.casela && (
            <p className="text-sm text-red-500 mt-1">{errors.casela.message}</p>
          )}
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-semibold text-slate-700">
            Residente
          </label>
          <input
            type="text"
            value={selectedCasela?.name || ""}
            readOnly
            disabled={!isIndividual}
            className={cn(
              "w-full border rounded-lg px-3 py-2 text-sm",
              !isIndividual
                ? "bg-slate-100 text-slate-500 cursor-not-allowed border-slate-200"
                : "bg-slate-50 border-slate-200",
            )}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="grid gap-2">
          <label className="text-sm font-semibold text-slate-700">
            {isEmergencyCart ? "Gaveta" : "Armário"}{" "}
            <span className="text-red-500">*</span>
          </label>
          {isEmergencyCart ? (
            <>
              <select
                {...register("drawerId", { valueAsNumber: true })}
                className={cn(
                  "w-full border rounded-lg px-3 py-2 text-sm bg-white",
                  errors.drawerId ? "border-red-500" : "border-slate-300",
                )}
              >
                <option value="">Selecione</option>
                {storageOptions.map((s) => (
                  <option key={s.numero} value={s.numero}>
                    {s.numero}
                  </option>
                ))}
              </select>
              {errors.drawerId && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.drawerId.message}
                </p>
              )}
            </>
          ) : (
            <>
              <select
                {...register("cabinetId", { valueAsNumber: true })}
                className={cn(
                  "w-full border rounded-lg px-3 py-2 text-sm bg-white",
                  errors.cabinetId ? "border-red-500" : "border-slate-300",
                )}
              >
                <option value="">Selecione</option>
                {storageOptions.map((s) => (
                  <option key={s.numero} value={s.numero}>
                    {s.numero}
                  </option>
                ))}
              </select>
              {errors.cabinetId && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.cabinetId.message}
                </p>
              )}
            </>
          )}
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-semibold text-slate-700">Origem</label>
          <select
            {...register("origin")}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
          >
            <option value="">Selecione</option>
            {Object.values(OriginType).map((o) => (
              <option key={o} value={o}>
                {o.charAt(0) + o.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-semibold text-slate-700">
          Setor <span className="text-red-500">*</span>
        </label>
        <select
          {...register("sector")}
          disabled={isEmergencyCart}
          className={cn(
            "w-full border rounded-lg px-3 py-2 text-sm bg-white",
            errors.sector ? "border-red-500" : "border-slate-300",
            isEmergencyCart && "bg-slate-100 text-slate-500 cursor-not-allowed",
          )}
        >
          <option value="" disabled hidden>
            Selecione
          </option>
          {Object.values(SectorType).map((sector) => (
            <option key={sector} value={sector}>
              {sector === SectorType.FARMACIA ? "Farmácia" : "Enfermagem"}
            </option>
          ))}
        </select>
        {errors.sector && (
          <p className="text-sm text-red-500 mt-1">{errors.sector.message}</p>
        )}
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-semibold text-slate-700">Lote</label>
        <input
          type="text"
          {...register("lot")}
          maxLength={100}
          placeholder="Ex: L2024-01"
          className={cn(
            "w-full border rounded-lg px-3 py-2 text-sm",
            errors.lot ? "border-red-500" : "border-slate-300",
          )}
        />
        {errors.lot && (
          <p className="text-sm text-red-500 mt-1">{errors.lot.message}</p>
        )}
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-semibold text-slate-700">
          Observação
          <span className="text-xs font-normal text-slate-500 ml-1">
            (Opcional)
          </span>
        </label>
        <textarea
          {...register("observacao")}
          maxLength={500}
          rows={3}
          placeholder={
            isIndividual
              ? 'Ex: "Uso contínuo", "Usar apenas em caso de agitação", "1 dose por mês"'
              : "Informações adicionais sobre este lote de medicamento..."
          }
          className={cn(
            "w-full border rounded-lg px-3 py-2 text-sm resize-none",
            errors.observacao ? "border-red-500" : "border-slate-300",
          )}
        />
        {errors.observacao && (
          <p className="text-sm text-red-500 mt-1">
            {errors.observacao.message}
          </p>
        )}
        {isIndividual && (
          <p className="text-xs text-slate-500 mt-1">
            Para medicamentos individuais, use este campo para informar detalhes sobre o uso pelo residente.
          </p>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={() => navigate("/stock")}
          className="px-5 py-2 border border-slate-400 rounded-lg text-sm"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-5 py-2 bg-sky-600 text-white rounded-lg text-sm hover:bg-sky-700 transition-colors"
        >
          Confirmar
        </button>
      </div>
    </form>
  );
});
