'use client';

import { useState, FormEvent } from 'react';

interface FormData {
  email: string,
  password: string,
}

const initialState: FormData = {
  email: '',
  password: ''
};

export default function CargaAcademicaPage() {
  const [formData, setFormData] = useState<FormData>(initialState);
  const [showPassword, setPasswordVisibility] = useState<boolean>(false);
  const [status, setStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error'; message: string }>({
    type: 'idle',
    message: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    let processedValue =value;

    if (name === 'email') {
      processedValue = value.toUpperCase();
    }

    setFormData(prev => ({ ...prev, [name]: processedValue }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

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

    } catch (error: any) {
      console.error('Error al enviar el formulario:', error);
      setStatus({ type: 'error', message: error.message || 'No se pudo enviar el formulario. Intenta de nuevo.' });
    }
  };

  return (
    <div className="bg-[#FDFCF4] min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-xl p-8 space-y-8 border border-gray-200">
        <header className="text-center">
          <h1 className="text-3xl font-bold text-black">Iniciar Sesion</h1>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          {renderInput("email", "Correo Electronico", "email", "john.doe@ugto.mx")}
          {renderInput("password", "Contrasena", showPassword ? "text" : "password", "************")}
          <p onClick={() => setPasswordVisibility(prev => !prev)} className='block text-sm text-blue-800 underline'>Mostrar contrasena</p>
          {(status.type === 'error' || status.type === 'success') && (
            <p className={`text-sm mb-4 ${status.type === 'success' ? 'text-[#4F7842]' : 'text-[#AD0D00]'}`}>
              {status.message}
            </p>
          )}
          <a href='/registro' className='block text-sm text-blue-800 underline'>No tienes cuenta? Registrate</a>
          <button
            type="submit"
            disabled={status.type === 'loading'}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#4F7842] hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4F7842] disabled:bg-opacity-50 disabled:cursor-not-allowed"
          >
            {status.type === 'loading' ? 'Enviando...' : 'Enviar'}
          </button>
      </form>
  </div>
</div>
  );
  
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
          required={true}
          className={`
            mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm text-black
            focus:border-[#5C8AA8] focus:ring-[#5C8AA8]
          `}
        />
      </div>
    );
  }
}

