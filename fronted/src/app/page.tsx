'use client';

import { useState, FormEvent } from 'react';
import { subjects } from './utils/subject_validator';

//datos para el formulario
interface FormData {
  nue: string;
  apellidos: string;
  nombres: string;
  correoInstitucional: string;
  correoAlterno: string;
  telefono: string;
  nombramiento: 'tiempo_completo' | 'tiempo_parcial_definido' | 'tiempo_parcial_indefinido' | '';
  horasDefinidas?: number;
  departamento?: 'arquitectura' | 'diseno' | 'otro';
  puestoAdministrativo: 'si' | 'no' | '';
  disponibilidad: Record<string, boolean[]>;
  udasInteres: string[];
}

//Estado inicial para poder resetear el formulario
const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const HORAS = Array.from({ length: 12 }, (_, i) => `${i + 8}:00 - ${i + 9}:00`);

const disponibilidadInicial = DIAS.reduce((acc, dia) => {
  acc[dia] = Array(HORAS.length).fill(false);
  return acc;
}, {} as Record<string, boolean[]>);

const initialState: FormData = {
  nue: '',
  apellidos: '',
  nombres: '',
  correoInstitucional: '',
  correoAlterno: '',
  telefono: '',
  nombramiento: '',
  puestoAdministrativo: '',
  disponibilidad: disponibilidadInicial,
  udasInteres: [],
};


//Componente principal de la página
export default function CargaAcademicaPage() {
  
  const [formData, setFormData] = useState<FormData>(initialState);
  const [status, setStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error'; message: string }>({
    type: 'idle',
    message: '',
  });

  //Manejadores de cambios en los inputs
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDisponibilidadChange = (dia: string, horaIndex: number) => {
    setFormData(prev => {
      const nuevaDisponibilidad = { ...prev.disponibilidad };
      const nuevoArrayDia = [...nuevaDisponibilidad[dia]]; 
      nuevoArrayDia[horaIndex] = !nuevoArrayDia[horaIndex];
      nuevaDisponibilidad[dia] = nuevoArrayDia;
      return { ...prev, disponibilidad: nuevaDisponibilidad };
    });
  };

  const handleUdaChange = (uda: string) => {
    setFormData(prev => {
      const nuevasUdas = prev.udasInteres.includes(uda)
        ? prev.udasInteres.filter(u => u !== uda)
        : [...prev.udasInteres, uda];
      return { ...prev, udasInteres: nuevasUdas };
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus({ type: 'loading', message: 'Enviando información...' });

    try {
      const response = await fetch('/api/profesores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nua: formData.nue,
          firstName: formData.nombres,
          lastName: formData.apellidos,
          desiredSubjects: formData.udasInteres,
          emailAddress: [formData.correoInstitucional, formData.correoAlterno],
          phoneNumber: formData.telefono,
          contractType: ["", "tiempo_completo", "tiempo_parcial_definido", "tiempo_parcial_indefinido"].indexOf(formData.nombramiento),
          hasAdministrativePosition: Boolean(["no", "si"].indexOf(formData.puestoAdministrativo)),
          availability: DIAS.map((dia: string) => (formData.disponibilidad[dia].map(Number).join('')))
        }),
      });

      const responseBody = await response.json();
      if (!response.ok) {
        throw new Error(responseBody.error || responseBody.message || `Error del servidor: ${response.statusText}`);
      }
      
      console.log('Respuesta del servidor:', responseBody);
      setStatus({ type: 'success', message: '¡Formulario enviado con éxito!' });
      setFormData(initialState);

    } catch (error: any) {
      console.error('Error al enviar el formulario:', error);
      setStatus({ type: 'error', message: error.message || 'No se pudo enviar el formulario. Intenta de nuevo.' });
    }
  };

  // renderizado
  return (
    <div className="bg-[#FDFCF4] min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl w-full bg-white rounded-lg shadow-xl p-8 space-y-8 border border-gray-200">
        
        <header className="text-center">
          <h1 className="text-3xl font-bold text-black">Carga Académica de Profesores</h1>
          <p className="mt-2 text-md text-gray-700">
            Este formulario nos ayuda a recopilar la información necesaria para la asignación de Unidades de Aprendizaje (UDAs) para el próximo ciclo escolar.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Sección de Información Personal */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-xl font-semibold text-black mb-4">Información Personal</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderInput('nue', 'NUE (Clave Única)', 'text', 'Ej. 123456')}
              {renderInput('apellidos', 'Apellidos', 'text', 'Ej. Pérez García')}
              {renderInput('nombres', 'Nombre(s)', 'text', 'Ej. Juan Carlos')}
              {renderInput('correoInstitucional', 'Correo Institucional', 'email', 'ejemplo@ugto.mx')}
              {renderInput('correoAlterno', 'Correo Alterno', 'email', 'ejemplo@gmail.com')}
              {renderInput('telefono', 'Número Telefónico', 'tel', 'Ej. 4731234567')}
            </div>
          </div>

          {/* Sección de Información Laboral */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-xl font-semibold text-black mb-4">Información Laboral</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderInputSelect('nombramiento', 'Nombramiento', [
                { value: 'tiempo_completo', label: 'Profesor de Tiempo Completo' },
                { value: 'tiempo_parcial_definido', label: 'Tiempo Parcial (Horas Definidas)' },
                { value: 'tiempo_parcial_indefinido', label: 'Tiempo Parcial (Sin Horas Definidas)' },
              ])}
              
              {formData.nombramiento === 'tiempo_parcial_definido' && (
                <>
                  {renderInput('horasDefinidas', '¿Cuántas horas tiene definidas?', 'number')}
                  {renderInputSelect('departamento', 'Departamento', [
                    { value: 'arquitectura', label: 'Arquitectura' },
                    { value: 'diseno', label: 'Diseño' },
                    { value: 'otro', label: 'Otro' },
                  ])}
                </>
              )}

              {renderInputSelect('puestoAdministrativo', '¿Tiene un puesto administrativo adicional?', [
                { value: 'si', label: 'Sí' },
                { value: 'no', label: 'No' },
              ])}
            </div>
          </div>
          
          {/* Disponibilidad de Horario */}
          <div>
            <h2 className="text-xl font-semibold text-black mb-4">Disponibilidad de Horario</h2>
            <p className="text-sm text-gray-500 mb-4">Selecciona los bloques de una hora en los que puedes impartir clase (8:00 am a 8:00 pm).</p>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Hora</th>
                    {DIAS.map(dia => (
                      <th key={dia} className="px-2 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">{dia}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {HORAS.map((hora, horaIndex) => (
                    <tr key={hora}>
                      <td className="px-2 py-2 whitespace-nowrap text-sm font-medium text-gray-700">{hora}</td>
                      {DIAS.map(dia => (
                        <td key={dia} className="text-center">
                          <input
                            type="checkbox"
                            className="h-5 w-5 rounded text-[#5C8AA8] focus:ring-[#4F7842] border-gray-300 cursor-pointer"
                            checked={formData.disponibilidad[dia][horaIndex]}
                            onChange={() => handleDisponibilidadChange(dia, horaIndex)}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* UDAs de Interés */}
          <div>
            <h2 className="text-xl font-semibold text-black mb-4">UDAs de Interés</h2>
            <p className="text-sm text-gray-500 mb-4">Selecciona todas las Unidades de Aprendizaje que puedes o te gustaría impartir.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {subjects.map(uda => (
                <div key={uda} className="flex items-center">
                  <input
                    id={`uda-${uda}`}
                    type="checkbox"
                    className="h-4 w-4 rounded text-[#5C8AA8] focus:ring-[#4F7842] border-gray-300"
                    checked={formData.udasInteres.includes(uda)}
                    onChange={() => handleUdaChange(uda)}
                  />
                  <label htmlFor={`uda-${uda}`} className="ml-2 block text-sm text-black">{uda}</label>
                </div>
              ))}
            </div>
          </div>

          {/* Botón de envío*/}
          <div className="pt-5">
            <div className="flex justify-end items-center gap-4">
              {status.type !== 'idle' && status.type !== 'loading' && (
                <p className={`text-sm ${status.type === 'success' ? 'text-[#4F7842]' : 'text-[#AD0D00]'}`}>
                  {status.message}
                </p>
              )}
               <button
                type="submit"
                disabled={status.type === 'loading'}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#4F7842] hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4F7842] disabled:bg-opacity-50 disabled:cursor-not-allowed"
              >
                {status.type === 'loading' ? 'Enviando...' : 'Enviar Formulario'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
  
  //Funciones helper para renderizar inputs 
  function renderInput(name: keyof FormData, label: string, type: string, placeholder?: string) {
    return (
      <div>
        <label htmlFor={name} className="block text-sm font-medium text-black">{label}</label>
        <input
          type={type}
          id={name}
          name={name}
          value={formData[name] as string || ''}
          onChange={handleInputChange}
          placeholder={placeholder}
          required={name !== 'horasDefinidas'}
          /* La clase 'text-black' debería resolver el problema del texto invisible */
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#5C8AA8] focus:ring-[#5C8AA8] sm:text-sm text-black"
        />
      </div>
    );
  }

  function renderInputSelect(name: keyof FormData, label: string, options: { value: string; label: string }[]) {
    return (
      <div>
        <label htmlFor={name} className="block text-sm font-medium text-black">{label}</label>
        <select
          id={name}
          name={name}
          value={formData[name] as string || ''}
          onChange={handleInputChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#5C8AA8] focus:ring-[#5C8AA8] sm:text-sm text-black"
        >
          <option value="">Selecciona una opción</option>
          {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      </div>
    );
  }
}

