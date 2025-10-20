'use client';

import { useState, FormEvent } from 'react';
import validateEmail from '../utils/email_validator';
import validatePassword from '../utils/password_validator';
import { useRouter } from 'next/navigation';
import sleep from '../utils/sleep';
import validateNUA from '../utils/nua_validator';
import validateName from '../utils/name_validator';

interface FormData {
  nue: string;
  lastName: string;
  firstName: string;
  phoneNumber: string;
  emails: string[],
  password: string,
  passwordConfirm: string,
}

const initialState: FormData = {
  nue: '',
  lastName: '',
  firstName: '',
  phoneNumber: '',
  emails: ['', ''],
  password: '',
  passwordConfirm: ''
};

interface FormErrors {
    nue?: string;
    lastName?: string;
    firstName?: string;
    phoneNumber?: string;
    emails?: string[],
    password?: string,
    passwordConfirm?: string,
}

export default function RegistroPage() {
  const [formData, setFormData] = useState<FormData>(initialState);
  const [passwordVisibility, setPasswordVisibility] = useState<boolean[]>([false, false]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error'; message: string }>({
    type: 'idle',
    message: '',
  });
  const router = useRouter();

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
    if (name.includes('emails') && !validateEmail(strValue)) msg = "El correo electronico no es valido.";
    if (!validateNUA(strValue)) msg = 'El NUE debe contener 6 dígitos numéricos.';
    if (!validateName(strValue)) msg = 'El nombre es requerido.';
    if (!validateName(strValue)) msg = 'Los apellidos son requeridos.';
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
    if (!validateNUA(formData.nue)) errors.nue = 'El NUE debe contener 6 dígitos numéricos.';
    if (!validateName(formData.firstName)) errors.firstName = 'El nombre es requerido.';
    if (!validateName(formData.lastName)) errors.lastName = 'Los apellidos son requeridos.';
    let email_errs = Array(formData.emails.length).fill('');
    for (const [idx, email] of formData.emails.entries()) {
        if (!validateEmail(email)) email_errs[idx] = "El correo electrónico no es valido.";
    }
    errors.emails = email_errs;
    if (!validatePassword(formData.password)) errors.password = "La contraseña debe tener al menos 12 caracteres, con al menos una minúscula, una mayúscula, un numero y un caracter especial (-+_!@#$%^&*.,?).";
    if (formData.password !== formData.passwordConfirm) errors.passwordConfirm = "Las contraseñas no coinciden.";
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

      await sleep(10000);
      router.push('/');

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

        <h2 className="text-xl font-semibold text-black mb-4">Información Personal</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {renderInput('nue', 'NUE (Clave Única)', 'text', 'Ej. 123456')}
          {renderInput('lastNames', 'Apellidos', 'text', 'Ej. Pérez García')}
          {renderInput('firstNames', 'Nombre(s)', 'text', 'Ej. Juan Carlos')}
          {renderInput('phoneNumber', 'Número Telefónico', 'tel', 'Ej. 4731234567')}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <>
            {formData.emails.map((_, idx) => {
                return <div key={idx}>{renderInput(`emails[${idx}]`, "Correos Electronicos", "email", "john.doe@ugto.mx", idx)}</div>;
            })}
          </>
          <button 
            type='button'
            onClick={() => setFormData(prev => ({...prev, emails: [...prev.emails, '']}))}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#4F7842] hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4F7842] disabled:bg-opacity-50 disabled:cursor-not-allowed"
          >
            Agregar otro correo
          </button>
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
        {(key === 0 || key === undefined) && <label htmlFor={name} className="block text-sm font-medium text-black">{label}</label>}
        <input
          type={type}
          id={name}
          name={name}
          value={formData[name as keyof FormData] as string || ''}
          onBlur={handleBlur}
          onChange={handleInputChange}
          placeholder={placeholder}
          required={true}
          className={`
            mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm text-black
            focus:border-[#5C8AA8] focus:ring-[#5C8AA8]
          `}
        />
        {(isInvalid && error.length)&& (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
}

