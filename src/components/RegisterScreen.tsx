import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, EyeOff } from 'lucide-react';
import { BoomerangLogo } from './Header';

interface RegisterScreenProps {
  onSubmitRegister: (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    course: string;
    division: string;
    type: 'Estudiante' | 'Docente';
  }) => void;
  onGoLogin: () => void;
  errorMessage?: string;
  isSubmitting?: boolean;
}

const registerSchema = z.object({
  firstName: z.string().min(2, 'Ingresá tu nombre'),
  lastName: z.string().min(2, 'Ingresá tu apellido'),
  email: z.string().email('Ingresá un email válido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
  confirmPassword: z.string().min(8, 'Mínimo 8 caracteres'),
  course: z.string().min(1, 'Requerido'),
  division: z.string().min(1, 'Requerido'),
  type: z.enum(['Estudiante', 'Docente']),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ onSubmitRegister, onGoLogin, errorMessage, isSubmitting }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      course: '1',
      division: 'A',
      type: 'Estudiante' as const,
    }
  });

  const onSubmit = (data: any) => {
    onSubmitRegister({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
      course: data.course,
      division: data.division,
      type: data.type,
    });
  };

  return (
    <div
      id="register-screen-container"
      className="flex flex-col h-full bg-white px-8 py-10 animate-fade-in overflow-y-auto scrollbar-none"
    >
      <div className="flex flex-col items-center gap-3 mb-6">
        <div className="bg-white p-2.5 rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.08)] border border-gray-100">
          <BoomerangLogo className="w-9 h-9" />
        </div>
        <h1 className="text-xl font-black tracking-tight text-[#1A1A1A] text-center">
          Crear cuenta
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Nombre</label>
          <input
            id="register-firstname-input"
            type="text"
            placeholder="Ej: Ana"
            {...register('firstName')}
            className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-xs text-neutral-800 focus:outline-none focus:border-[#CC0000] focus:bg-white transition-colors placeholder-gray-400"
          />
          {errors.firstName && <span className="text-[10px] text-[#CC0000] font-bold">{errors.firstName.message}</span>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Apellido</label>
          <input
            id="register-lastname-input"
            type="text"
            placeholder="Ej: Martínez"
            {...register('lastName')}
            className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-xs text-neutral-800 focus:outline-none focus:border-[#CC0000] focus:bg-white transition-colors placeholder-gray-400"
          />
          {errors.lastName && <span className="text-[10px] text-[#CC0000] font-bold">{errors.lastName.message}</span>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Email</label>
          <input
            id="register-email-input"
            type="email"
            placeholder="tu-email@ija.edu.ar"
            {...register('email')}
            className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-xs text-neutral-800 focus:outline-none focus:border-[#CC0000] focus:bg-white transition-colors placeholder-gray-400"
          />
          {errors.email && <span className="text-[10px] text-[#CC0000] font-bold">{errors.email.message}</span>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Contraseña</label>
          <div className="relative">
            <input
              id="register-password-input"
              type={showPassword ? 'text' : 'password'}
              placeholder="Mínimo 8 caracteres"
              {...register('password')}
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 pr-10 text-xs text-neutral-800 focus:outline-none focus:border-[#CC0000] focus:bg-white transition-colors placeholder-gray-400"
            />
            <button
              type="button"
              id="btn-toggle-register-password"
              onClick={() => setShowPassword(prev => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-neutral-700"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <span className="text-[10px] text-[#CC0000] font-bold">{errors.password.message}</span>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Confirmar contraseña</label>
          <div className="relative">
            <input
              id="register-confirm-password-input"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Repetí tu contraseña"
              {...register('confirmPassword')}
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 pr-10 text-xs text-neutral-800 focus:outline-none focus:border-[#CC0000] focus:bg-white transition-colors placeholder-gray-400"
            />
            <button
              type="button"
              id="btn-toggle-confirm-password"
              onClick={() => setShowConfirmPassword(prev => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-neutral-700"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.confirmPassword && <span className="text-[10px] text-[#CC0000] font-bold">{errors.confirmPassword.message}</span>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Curso</label>
            <select
              id="register-course-select"
              {...register('course')}
              className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 text-xs text-neutral-800 focus:outline-none focus:border-[#CC0000] cursor-pointer"
            >
              {['1', '2', '3', '4', '5', '6'].map((c) => (
                <option key={c} value={c}>{c}°</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">División</label>
            <select
              id="register-division-select"
              {...register('division')}
              className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 text-xs text-neutral-800 focus:outline-none focus:border-[#CC0000] cursor-pointer"
            >
              {['A', 'B', 'C'].map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Tipo</label>
          <select
            id="register-type-select"
            {...register('type')}
            className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-xs text-neutral-800 focus:outline-none focus:border-[#CC0000] cursor-pointer"
          >
            <option value="Estudiante">Estudiante</option>
            <option value="Docente">Docente</option>
          </select>
        </div>

        {errorMessage && (
          <p className="text-[11px] text-[#CC0000] font-bold text-center bg-red-50 border border-red-100 rounded-xl px-3 py-2">
            {errorMessage}
          </p>
        )}

        <button
          id="btn-register-submit"
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#CC0000] hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold text-sm py-3.5 rounded-2xl shadow-[0_4px_16px_rgba(204,0,0,0.25)] transition-all cursor-pointer mt-2"
        >
          {isSubmitting ? 'Creando cuenta...' : 'Registrarse'}
        </button>
      </form>

      <button
        type="button"
        id="btn-go-login"
        onClick={onGoLogin}
        className="text-xs text-gray-500 text-center mt-5 cursor-pointer"
      >
        ¿Ya tenés cuenta? <span className="text-[#CC0000] font-bold hover:underline">Iniciá sesión</span>
      </button>
    </div>
  );
};
