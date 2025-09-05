import React, { useState } from "react";
import * as XLSX from "xlsx";
import {
  client,
  useConfig,
  useElementData,
  useElementColumns,
} from "@sigmacomputing/plugin";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

client.config.configureEditorPanel([
  {
    // configuring selection of data source
    name: "source",
    type: "element",
  },
  {
    // configuring selection of data column from the source that contains qualitative values
    // (e.g. names, dates)
    name: "dimension",
    type: "column",
    source: "source",
    allowMultiple: false,
  },
  {
    // configuring selection of data column(s) from the source that contain quantitative, numeric values
    name: "measures",
    type: "column",
    source: "source",
    allowMultiple: true,
  },
]);

function ExcelUploader() {
  const [status, setStatus] = useState("");
  const controlValue = useControlValue("myControl"); // es: "template_1"

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = async (e) => {
      const binaryStr = e.target.result;
      const workbook = XLSX.read(binaryStr, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet);

      try {
        const resp = await fetch("https://mia-api.com/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tableName: `dev_lab.sigma_csv_to_upload.${controlValue}`,
            rows: jsonData
          }),
        });

        if (resp.ok) {
          setStatus("Upload riuscito 🚀");
        } else {
          setStatus("Errore nell’upload ❌");
        }
      } catch (err) {
        setStatus("Errore connessione API ❌");
      }
    };

    reader.readAsBinaryString(file);
  };

  return (
    <div>
      <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
      <p>{status}</p>
    </div>
  );
}

export default ExcelUploader;
