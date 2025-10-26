'use client';

import { useState, useEffect } from 'react';
import { AvailabilityData, exportAvailabilities } from '../utils/spreadsheet_creator';
import { formatAvailabilityForDisplay } from '../utils/availability_formatter';

//DATOS DE EJEMPLO
const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
const HORAS_COUNT = 14;

const createMockAvailability = () => {
  const avail: Record<string, boolean[]> = {};
  DIAS.forEach(dia => {
    avail[dia] = Array(HORAS_COUNT).fill(false);
  });
  
  // Ejemplo
  for(let i = 1; i <= 4; i++) avail['Lunes'][i] = true;
  for(let i = 7; i <= 8; i++) avail['Lunes'][i] = true;
  for(let i = 3; i <= 6; i++) avail['Miércoles'][i] = true;
  
  return avail;
};

const createMockAvailability2 = () => {
    const avail: Record<string, boolean[]> = {};
    DIAS.forEach(dia => {
      avail[dia] = Array(HORAS_COUNT).fill(false);
    });
    for(let i = 1; i <= 10; i++) avail['Martes'][i] = true;
    for(let i = 9; i <= 12; i++) avail['Jueves'][i] = true;
    return avail;
};

const MOCK_DATA: AvailabilityData[] = [
  {
    id: '6539a7b9e4b0c8a2f0e1f3a0',
    teacherId: {
      nua: '12345',
      firstName: 'yo',
      lastName: 'mero',
      phoneNumber: '4731234567',
      emails: ['yo.mero@correo.mx', 'yo@gmail.com']
    },
    archHours: 18,
    hasAdministrativePos: false,
    availability: createMockAvailability(),
    desiredSubjects: ['Taller de Proyectos', 'Historia del Arte']
  },
  {
    id: '6539a7b9e4b0c8a2f0e1f3a1',
    teacherId: {
      nua: '54321',
      firstName: 'yo',
      lastName: 'merenguez',
      phoneNumber: '4737654321',
      emails: ['yo.merenguez@ugto.mx']
    },
    archHours: 10,
    hasAdministrativePos: true,
    availability: createMockAvailability2(),
    desiredSubjects: ['Urbanismo', 'Sistemas Constructivos', 'Taller de Proyectos']
  },
  {
    id: '6539a7b9e4b0c8a2f0e1f3a2',
    teacherId: {
      nua: null,
      firstName: null, 
      lastName: null,
      phoneNumber: null, 
      emails: [] //
    },
    archHours: null, 
    hasAdministrativePos: false,
    availability: {},
    desiredSubjects: []
  }
];
//FIN DE DATOS DE EJEMPLO


export default function DataExportPage() {
  const [profesores, setProfesores] = useState<AvailabilityData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // hay que reemplaza esto con el fetch real a la API
    
    // Usando datos de ejemplo por ahora:
    setProfesores(MOCK_DATA);
    setLoading(false);
  }, []);

  const handleExport = () => {
    exportAvailabilities(profesores);
  };

  const displayString = (val: string | null | undefined) => val || 'N/A';
  const displayArray = (arr: string[]) => arr.length > 0 ? arr.join(' | ') : 'N/A';
  const displayNumber = (num: number | null | undefined) => num ?? 'N/A'; 

  return (
    <div className="bg-[#FDFCF4] min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl w-full mx-auto bg-white rounded-lg shadow-xl p-8 border border-gray-200">
        <header className="mb-6 pb-4 border-b border-gray-200 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-black">
            Datos de Profesores ({profesores.length})
          </h1>
          <button
            onClick={handleExport}
            disabled={loading || profesores.length === 0}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#4F7842] hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4F7842] disabled:bg-opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Cargando...' : 'Exportar a CSV'}
          </button>
        </header>

        {loading ? (
          <p className="text-center text-gray-600">Cargando datos de la base de datos...</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table id="prof-table" className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">NUE</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Apellidos</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Nombre</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Phone Number</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Emails</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Horas Def.</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Puesto Admin.</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Disponibilidad</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">UDAs de Interés</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {profesores.map((prof) => (
                  <tr key={prof.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">{displayString(prof.teacherId.nua)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{displayString(prof.teacherId.lastName)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">{displayString(prof.teacherId.firstName)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">{displayString(prof.teacherId.phoneNumber)}</td>
                    <td className="px-4 py-3 text-sm text-gray-800 min-w-[200px]">
                      {displayArray(prof.teacherId.emails)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-800">{displayNumber(prof.archHours)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">{prof.hasAdministrativePos ? 'Sí' : 'No'}</td>
                    <td className="px-4 py-3 text-sm text-gray-800 min-w-[250px]">
                      {formatAvailabilityForDisplay(prof.availability)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800 min-w-[200px]">
                      {displayArray(prof.desiredSubjects)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}