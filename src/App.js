import React, { useState } from "react";
import * as XLSX from "xlsx";
import { useVariables } from "@sigmacomputing/plugin";

function App() {   // <-- cambia ExcelUploader in App
  const [status, setStatus] = useState("");
  const controlValue = useVariables("myControl"); 

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
            rows: jsonData,
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

export default App;
