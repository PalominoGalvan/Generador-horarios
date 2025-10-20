'use client';

import { useState, FormEvent } from 'react';
import { subjects } from '../utils/subject_validator';

//paquetes para validar
import validatePositiveNumber from '../utils/number_validator'

//datos para el formulario
interface FormData {
  nombramiento: 'tiempo_completo' | 'tiempo_parcial_definitivo' | 'tiempo_parcial_indefinido' | '';
  horasDefinidas?: number;
  departamento?: 'arquitectura' | 'diseno' | 'otro';
  puestoAdministrativo: 'si' | 'no' | '';
  disponibilidad: Record<string, boolean[]>;
  udasInteres: string[];
}

//Estado inicial para poder resetear el formulario
const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const HORAS = Array.from({ length: 14 }, (_, i) => `${i + 7}:00 - ${i + 8}:00`);

const disponibilidadInicial = DIAS.reduce((acc, dia) => {
  acc[dia] = Array(HORAS.length).fill(false);
  return acc;
}, {} as Record<string, boolean[]>);

const initialState: FormData = {
  nombramiento: '',
  puestoAdministrativo: '',
  disponibilidad: disponibilidadInicial,
  udasInteres: [],
};

// Estado para los errores de validación
interface FormErrors {
  nombramiento?: string;
  horasDefinidas?: string;
  puestoAdministrativo?: string;
  udasInteres?: string;
}


//Componente principal de la página
export default function CargaAcademicaPage() {
  
  const [formData, setFormData] = useState<FormData>(initialState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error'; message: string }>({
    type: 'idle',
    message: '',
  });

  //Manejadores de cambios en los inputs
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    let processedValue =value;

    if (name === 'nombres' || name === 'apellidos') {
      processedValue = value.toUpperCase();
    }

    setFormData(prev => ({ ...prev, [name]: processedValue }));
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


  // --- FUNCIÓN NUEVA: Valida un campo específico ---
  const validateField = (name: keyof FormData, value: string | number | undefined) => {
    let errorMessage: string | undefined = undefined;
    const strValue = String(value || '');

    switch (name) {
      case 'nombramiento':
      case 'puestoAdministrativo':
        if (!strValue) errorMessage = 'Debes seleccionar una opción.';
        break;
      case 'horasDefinidas':
        const numValue = Number(value);
        if (formData.nombramiento === 'tiempo_parcial_definitivo' && !validatePositiveNumber(numValue)) {
          errorMessage = 'Debe ser un número entero y positivo.';
        }
        break;
    }
    
    // Actualiza el estado de errores para ese campo
    setErrors(prev => ({ ...prev, [name]: errorMessage }));
  };

  // Manejador onBlur ---
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target as { name: keyof FormData; value: string };
    validateField(name, value);
  };

  // Valida el formulario completo ---
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Re-valida todos los campos
    if (!formData.nombramiento) newErrors.nombramiento = 'Debes seleccionar un nombramiento.';
    if (formData.nombramiento === 'tiempo_parcial_definitivo' && !validatePositiveNumber(Number(formData.horasDefinidas))) {
      newErrors.horasDefinidas = 'El número de horas es inválido.';
    }
    if (!formData.puestoAdministrativo) newErrors.puestoAdministrativo = 'Debes seleccionar una opción.';
    if (formData.udasInteres.length === 0) {
      newErrors.udasInteres = 'Debes seleccionar al menos una UDA de interés.';
      // (Opcional) Mostramos este error cerca del botón de envío o del título de UDAs
    }

    setErrors(newErrors);
    
    // Retorna true si el objeto newErrors está vacío (sin errores)
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const isValid = validateForm();
    if (!isValid) {
      setStatus({ type: 'error', message: 'Por favor, corrige los errores en el formulario.' });
      return;
    }

    setStatus({ type: 'loading', message: 'Enviando información...' });

    const dataToSend = { ...formData };
  
    try {
      const response = await fetch('/api/profesores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData), 
      });

      const responseBody = await response.json();
      if (!response.ok) {
        throw new Error(responseBody.error || responseBody.message || `Error del servidor: ${response.statusText}`);
      }
      
      console.log('Respuesta del servidor:', responseBody);
      setStatus({ type: 'success', message: responseBody.message });
      setErrors({}); // Limpia los errores

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
            Este formulario recopila información necesaria para la organización de Unidades de Aprendizaje (UDAs) para el próximo ciclo escolar. Por favor, complete cada campo con
          atención. 
          Los datos se usarán exclusivamente con fines administrativos.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Sección de Información Laboral */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-xl font-semibold text-black mb-4">Información Laboral</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderInputSelect('nombramiento', 'Nombramiento', [
                { value: 'tiempo_completo', label: 'Profesor de Tiempo Completo' },
                { value: 'tiempo_parcial_definitivo', label: 'Profesor de Tiempo Parcial con horas definitivas' },
                { value: 'tiempo_parcial_indefinido', label: 'Profesor de Tiempo Parcial sin horas definitivas' },
              ])}
              
              {formData.nombramiento === 'tiempo_parcial_definitivo' && (
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
            <p className="text-sm text-gray-500 mb-4">
              Seleccione las horas en que puede impartir clase. Cada celda representa una hora. 
              Haga clic en las horas disponibles; se marcarán en verde.
            </p>
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
            <p className="text-sm text-gray-500 mb-4">Marque las unidades de aprendizaje (UDAs) que le gustaría impartir o en las que tiene experiencia.</p>
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
          
          {/* --- SECCIÓN DE BOTONES (MODIFICADA) --- */}
      <div className="pt-5">
        
        {/* Mensaje de Status (visible en cualquier paso si hay error/success) */}
        {(status.type === 'error' || status.type === 'success') && (
          <p className={`text-sm mb-4 ${status.type === 'success' ? 'text-[#4F7842]' : 'text-[#AD0D00]'}`}>
            {status.message}
          </p>
        )}

        <div className="flex justify-between items-center gap-4">
          {/* --- Botón "Siguiente" (Paso 1) o "Enviar" (Paso 2) --- */}
          <button
            type="submit" // Este SÍ es type="submit"
            disabled={status.type === 'loading'}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#4F7842] hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4F7842] disabled:bg-opacity-50 disabled:cursor-not-allowed"
          >
            {status.type === 'loading' ? 'Enviando...' : 'Enviar'}
          </button>
        </div>
      </div>
      
    </form>
  </div>
</div>
  );
  
  //Funciones helper para renderizar inputs 
  function renderInput(name: keyof FormData, label: string, type: string, placeholder?: string) {
    const error = errors[name as keyof FormErrors];
    const isInvalid = !!error;

    return (
      <div>
        <label htmlFor={name} className="block text-sm font-medium text-black">{label}</label>
        <input
          type={type}
          id={name}
          name={name}
          value={formData[name] as string || ''}
          onChange={handleInputChange}
          //Llama a la validación al salir del campo ---
          onBlur={handleBlur} 
          placeholder={placeholder}
          required={name !== 'horasDefinidas'}
          className={`
            mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm text-black
            focus:border-[#5C8AA8] focus:ring-[#5C8AA8]
            ${isInvalid ? 'border-red-500 ring-red-500 focus:border-red-500 focus:ring-red-500' : ''}
          `} // Añade clases de error
        />
        {/* --- Muestra el mensaje de error --- */}
        {isInvalid && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }

  function renderInputSelect(name: keyof FormData, label: string, options: { value: string; label: string }[]) {
    const error = errors[name as keyof FormErrors];
    const isInvalid = !!error;

    return (
      <div>
        <label htmlFor={name} className="block text-sm font-medium text-black">{label}</label>
        <select
          id={name}
          name={name}
          value={formData[name] as string || ''}
          onChange={handleInputChange}
          // --- AÑADIDO: Llama a la validación al salir del campo ---
          onBlur={handleBlur}
          required
          className={`
            mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm text-black
            focus:border-[#5C8AA8] focus:ring-[#5C8AA8]
            ${isInvalid ? 'border-red-500 ring-red-500 focus:border-red-500 focus:ring-red-500' : ''}
          `} // Añade clases de error
        >
          <option value="">Selecciona una opción</option>
          {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
        {/* --- AÑADIDO: Muestra el mensaje de error --- */}
        {isInvalid && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
}

