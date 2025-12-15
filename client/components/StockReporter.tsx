import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

Font.register({
  family: "Inter",
  fonts: [
    {
      src: "http://localhost:8080/fonts/Inter-Regular.ttf",
    },
  ],
});

interface ResidentesResponse {
  detalhes: RowData[];
  consumo_mensal: RowData[];
}

interface RowData {
  insumo?: string;
  principio_ativo?: string;
  quantidade?: number | string;
  validade: string;
  residente?: string;
  medicamento?: string;
  casela?: number;
  data?: string;
  consumo_mensal?: string | number;
  armario?: number;
  medicamentos?: RowData[];
  insumos?: RowData[];
}

const styles = StyleSheet.create({
  page: {
    paddingTop: 20,
    paddingHorizontal: 30,
    paddingBottom: 40,
    fontFamily: "Inter",
    fontSize: 11,
    backgroundColor: "#ffffff",
  },

  topLine: {
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    marginBottom: 8,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },

  logo: { width: 90 },

  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 5,
    color: "#000",
    textTransform: "uppercase",
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 6,
    color: "#000",
  },

  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#e5e5e5",
    paddingVertical: 4,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#000",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 9, 
  },

  tableRow: {
    flexDirection: "row",
    paddingVertical: 5,
    borderBottomWidth: 0.5,
    borderBottomColor: "#ccc",
  },

  striped: {
    backgroundColor: "#f2f2f2",
  },


  cell: {
    flex: 1,
    paddingHorizontal: 2,
    textAlign: "center",
    fontSize: 9,    
    whiteSpace: "nowrap", 
  },

  footer: {
    position: "absolute",
    bottom: 20,
    right: 30,
    fontSize: 9,
    color: "#444",
  },
});

function renderTable(headers: string[], rows: RowData[]) {
  return (
    <>
      <View style={styles.tableHeader}>
        {headers.map((h, i) => (
          <Text key={i} style={styles.cell}>
            {h}
          </Text>
        ))}
      </View>

      {rows.map((row, idx) => (
        <View
          key={idx}
          style={[
            styles.tableRow,
            idx % 2 === 0 ? styles.striped : undefined,
          ]}
        >
          {headers.map((h, i) => {
            const key = h
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .toLowerCase()
              .replace(/\s+/g, "_");

            let value: any = row[key as keyof RowData] ?? "";

            return (
              <Text key={i} style={styles.cell}>
                {value}
              </Text>
            );
          })}
        </View>
      ))}
    </>
  );
}

export function createStockPDF(
  tipo: string,
  data: RowData[] | ResidentesResponse
) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.topLine} />

        <View style={styles.header}>
          <Image src="http://localhost:8080/logo.png" style={styles.logo} />
          <Text style={styles.title}>ESTOQUE ATUAL</Text>
        </View>

        {tipo === "residentes" && (
          <>
            <Text style={styles.sectionTitle}>
              Medicamentos por Residente
            </Text>

            {renderTable(
              [
                "Residente",
                "Casela",
                "Medicamento",
                "Principio Ativo",
                "Quantidade",
                "Validade",
              ],
              (data as ResidentesResponse).detalhes
            )}

            <Text style={styles.sectionTitle}>Consumo Mensal</Text>

            {renderTable(
              [
                "Residente",
                "Casela",
                "Medicamento",
                "Principio Ativo",
                "Data",
                "Consumo Mensal",
              ],
              (data as ResidentesResponse).consumo_mensal
            )}
          </>
        )}

        {tipo === "medicamentos" && (
          <>
            <Text style={styles.sectionTitle}>Medicamentos</Text>
            {renderTable(
              [
                "Medicamento",
                "Principio Ativo",
                "Quantidade",
                "Validade",
                "Residente",
              ],
              data as RowData[]
            )}
          </>
        )}

        {tipo === "insumos" && (
          <>
            <Text style={styles.sectionTitle}>Insumos</Text>
            {renderTable(["Insumo", "Quantidade", "Armario", "Validade"], data as RowData[])}
          </>
        )}

        {tipo === "insumos_medicamentos" && (
          <>
            <Text style={styles.sectionTitle}>Medicamentos</Text>
            {renderTable(
              [
                "Medicamento",
                "Principio Ativo",
                "Quantidade",
                "Validade",
                "Residente",
              ],
              (data as any).medicamentos ?? []
            )}

            <Text style={styles.sectionTitle}>Insumos</Text>
            {renderTable(
              ["Insumo", "Quantidade", "Armario"],
              (data as any).insumos ?? []
            )}
          </>
        )}

        {tipo === "psicotropicos" && (
          <>
            <Text style={styles.sectionTitle}>Psicotrópicos</Text>
            {renderTable(
              [
                "Tipo",
                "Medicamento",
                "Residente",
                "Data Movimentação",
                "Quantidade",
              ],
              (data as any).psicotropico ?? []
            )}
          </>
        )}

        <Text style={styles.footer}>
          Gerado em: {new Date().toLocaleDateString("pt-BR")} às{" "}
          {new Date().toLocaleTimeString("pt-BR")}
        </Text>
      </Page>
    </Document>
  );
}
