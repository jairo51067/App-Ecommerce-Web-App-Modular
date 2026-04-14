export const exportService = {
  /**
   * Transforma un array de objetos en un archivo CSV y lo descarga
   * @param {Array} data - Los datos (Leads o Productos)
   * @param {String} fileName - Nombre del archivo
   */
  toCSV(data, fileName) {
    if (!data || !data.length) {
      alert("No hay datos para exportar");
      return;
    }

    // 1. Extraemos las cabeceras (las llaves del primer objeto)
    const headers = Object.keys(data[0]).join(",");

    // 2. Creamos las filas (limpiando comas internas para no romper el CSV)
    const rows = data.map(obj => {
      return Object.values(obj)
        .map(val => String(val).replace(/,/g, ".").replace(/\n/g, " ")) 
        .join(",");
    });

    // 3. Unimos todo
    const csvContent = [headers, ...rows].join("\n");

    // 4. Truco para la descarga automática
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `${fileName}.csv`);
    link.style.visibility = "hidden";
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};