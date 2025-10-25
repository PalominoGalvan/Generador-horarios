import { formatAvailabilityForCSV } from './availability_formatter';


export interface TeacherInfo {
    nue: string; //faltaba este 
    firstName: string;
    lastName: string;
}

export interface AvailabilityData {
    id: string; //ID  de mongo para el react key
    teacherId: TeacherInfo;
    archHours: number;
    availability: Record<string, boolean[]>;
    desiredSubjects: string[];
    hasAdministrativePos: boolean;
}

export default function exportAvailabilities(data: AvailabilityData[]) {
    if (!data || data.length === 0) {
    console.warn("No hay datos para exportar.");
    return;
  }

  const headers = [
    "NUE",
    "Apellidos",
    "Nombre",
    "Horas Definitivas",
    "Puesto Administrativo",
    "Disponibilidad",
    "UDAs de Interes"
  ];

  //Para asegurar que Excel reconozca UTF-8
  let csvContent = "\uFEFF";
  
  //cabeceras
  csvContent += headers.join(",") + "\r\n";

  //maneja comas y comillas
  const escapeCSV = (field: any): string => {
    let str = String(field);
    if (str.includes(",") || str.includes("\n") || str.includes('"')) {
      str = `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  // Añadir filas
  data.forEach(prof => {
    const row = [
      escapeCSV(prof.teacherId.nue),
      escapeCSV(prof.teacherId.lastName),
      escapeCSV(prof.teacherId.firstName),
      escapeCSV(prof.archHours),
      escapeCSV(prof.hasAdministrativePos ? 'Sí' : 'No'),
      escapeCSV(formatAvailabilityForCSV(prof.availability)), 
      escapeCSV(prof.desiredSubjects.join('; ')) 
    ];
    csvContent += row.join(",") + "\r\n";
  });

  // Crear y descargar el archivo
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "reporte_profesores.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}