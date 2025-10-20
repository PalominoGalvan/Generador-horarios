'use client';

import { useState, FormEvent } from 'react';
import validateEmail from '../utils/email_validator';
import validatePassword from '../utils/password_validator';

interface FormData {
  emails: string[],
  password: string,
  passwordConfirm: string,
}

const initialState: FormData = {
  emails: ['', ''],
  password: '',
  passwordConfirm: ''
};

interface FormErrors {
    emails?: string,
    password?: string,
    passwordConfirm?: string,
}

export default function CargaAcademicaPage() {
  const [formData, setFormData] = useState<FormData>(initialState);
  const [passwordVisibility, setPasswordVisibility] = useState<boolean[]>([false, false]);
  const [errors, setErrors] = useState<FormErrors>({});
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
  
  const validateField = (name: keyof FormData, value: string | undefined) => {
    let msg: string | undefined;
    const strValue = String(value || '');
    if (name === 'password' && !validatePassword(strValue)) msg = "La contrasena debe tener al menos 12 caracteres, con al menos una minuscula, una mayuscula, un numero y un caracter especial (-+_!@#$%^&*.,?).";
    if (name === 'passwordConfirm' && formData.password !== formData.passwordConfirm) msg = "Las contrasenas no coinciden.";
    setErrors(prev => ({ ...prev, [name]: msg }));
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target as { name: keyof FormData; value: string };
    validateField(name, value);
  };

  const validateForm = () => {
    let errors: FormErrors = {};
    if (!validatePassword(formData.password)) errors.password = "La contrasena debe tener al menos 12 caracteres, con al menos una minuscula, una mayuscula, un numero y un caracter especial (-+_!@#$%^&*.,?).";
    if (formData.password !== formData.passwordConfirm) errors.passwordConfirm = "Las contrasenas no coinciden.";
    setErrors(errors);
    return Object(errors).keys.length == 0;
  }

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

    } catch (error: any) {
      console.error('Error al enviar el formulario:', error);
      setStatus({ type: 'error', message: error.message || 'No se pudo enviar el formulario. Intenta de nuevo.' });
    }
  };

  return (
    <div className="bg-[#FDFCF4] min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-xl p-8 space-y-8 border border-gray-200">
        <header className="text-center">
          <h1 className="text-3xl font-bold text-black">Registro</h1>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <>
            {formData.emails.map((_, idx) => {
                return <div key={idx}>{renderInput(`emails[${idx}]`, "Correo Electronico", "email", "john.doe@ugto.mx", idx)}</div>;
            })}
          </>
          {renderInput("password", "Contrasena", passwordVisibility[0] ? "text" : "password", "************")}
          <p onClick={() => setPasswordVisibility(prev => [!prev[0], prev[1]])} className='block text-sm text-blue-800 underline'>Mostrar contrasena</p>
          {renderInput("passwordConfirm", "Confirmar Contrasena", passwordVisibility[1] ? "text" : "password", "************")}
          <p onClick={() => setPasswordVisibility(prev => [prev[0], !prev[1]])} className='block text-sm text-blue-800 underline'>Mostrar contrasena</p>
          {(status.type === 'error' || status.type === 'success') && (
            <p className={`text-sm mb-4 ${status.type === 'success' ? 'text-[#4F7842]' : 'text-[#AD0D00]'}`}>
              {status.message}
            </p>
          )}
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
  
  function renderInput(name: string, label: string, type: string, placeholder?: string, key?: number) {
    const error = errors[name as keyof FormErrors];
    const isInvalid = !!error;
    return (
      <div>
        {key === 0 && <label htmlFor={name} className="block text-sm font-medium text-black">{label}</label>}
        <input
          type={type}
          id={name}
          name={name}
          value={formData[name as keyof FormData] as string || ''}
          onChange={handleInputChange}
          placeholder={placeholder}
          required={true}
          className={`
            mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm text-black
            focus:border-[#5C8AA8] focus:ring-[#5C8AA8]
          `}
        />
        {isInvalid && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
}

