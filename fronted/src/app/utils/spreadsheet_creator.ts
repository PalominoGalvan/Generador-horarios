import { formatAvailabilityForCSV } from './availability_formatter';


export interface TeacherInfo {
    nue: string | null; //faltaba este y permite el null
    firstName: string | null;
    lastName: string | null;
    phoneNumber: string | null;//tambien este
    emails: string[] | null;//y este
}

export interface AvailabilityData {
    id: string; //ID  de mongo para el react key
    teacherId: TeacherInfo;
    archHours: number | null;
    availability: Record<string, boolean[]>;
    desiredSubjects: string[];
    hasAdministrativePos: boolean;
}

//Genera y descarga un archivo CSV con los datos de los profesores.
export function exportAvailabilities(data: AvailabilityData[]) {
    if (!data || data.length === 0) {
    console.warn("No hay datos para exportar.");
    return;
  }

  const headers = [
    "NUE",
    "Apellidos",
    "Nombre",
    "Phone Number",
    "Emails",
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
    const str = (field !== null && field !== undefined) ? String(field) : 'N/A';
    if (str === 'N/A') return 'N/A';
    if (str.includes(",") || str.includes("\n") || str.includes('"')) {
      str = `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  // Añadir filas
  data.forEach(prof => {
    const row = [
      escapeCSV(prof.teacherId.nua || 'N/A'),
      escapeCSV(prof.teacherId.lastName || 'N/A'),
      escapeCSV(prof.teacherId.firstName || 'N/A'),
      escapeCSV(prof.teacherId.phoneNumber || 'N/A'),
      escapeCSV(prof.teacherId.emails.length > 0 ? prof.teacherId.emails.join(' | ') : 'N/A'),
      escapeCSV(prof.archHours ?? 'N/A'), // Maneja 0, null, y undefined
      escapeCSV(prof.hasAdministrativePos ? 'Sí' : 'No'),
      escapeCSV(formatAvailabilityForCSV(prof.availability)),
      escapeCSV(prof.desiredSubjects.length > 0 ? prof.desiredSubjects.join(' | ') : 'N/A')
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