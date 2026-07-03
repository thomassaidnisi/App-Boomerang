import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { BoomerangLogo } from './Header';
import { Eye, EyeOff } from 'lucide-react';

interface LoginScreenProps {
  onSubmitLogin: (email: string, password: string) => void;
  onGoRegister: () => void;
}

const loginSchema = z.object({
  email: z.string().email('Ingresá un email válido'),
  password: z.string().min(1, 'Ingresá tu contraseña'),
});

export const LoginScreen: React.FC<LoginScreenProps> = ({ onSubmitLogin, onGoRegister }) => {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' }
  });

  const onSubmit = (data: any) => {
    onSubmitLogin(data.email, data.password);
  };

  return (
    <div
      id="login-screen-container"
      className="flex flex-col items-center justify-between h-full bg-white px-8 py-14 animate-fade-in overflow-y-auto scrollbar-none"
    >
      {/* Logo + Branding */}
      <div className="flex flex-col items-center gap-5 mt-4">
        <div className="bg-white p-4 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-gray-100">
          <BoomerangLogo className="w-14 h-14" />
        </div>

        <div className="flex flex-col items-center gap-1.5 text-center">
          <h1 className="text-2xl font-black tracking-tight text-[#1A1A1A]">
            Bienvenido a Boomerang
          </h1>
          <p className="text-xs text-gray-500 font-medium leading-relaxed max-w-[240px]">
            Instituto Jóvenes Argentinos
          </p>
        </div>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3 w-full mt-8">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Email</label>
          <input
            id="login-email-input"
            type="email"
            placeholder="tu-email@ija.edu.ar"
            {...register('email')}
            className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-xs text-neutral-800 focus:outline-none focus:border-[#CC0000] focus:bg-white transition-colors placeholder-gray-400"
          />
          {errors.email && (
            <span className="text-[10px] text-[#CC0000] font-bold">{errors.email.message}</span>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Contraseña</label>
          <div className="relative">
            <input
              id="login-password-input"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              {...register('password')}
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 pr-10 text-xs text-neutral-800 focus:outline-none focus:border-[#CC0000] focus:bg-white transition-colors placeholder-gray-400"
            />
            <button
              type="button"
              id="btn-toggle-login-password"
              onClick={() => setShowPassword(prev => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-neutral-700"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <span className="text-[10px] text-[#CC0000] font-bold">{errors.password.message}</span>
          )}
        </div>

        <button
          id="btn-login-submit"
          type="submit"
          className="w-full bg-[#CC0000] hover:bg-red-700 text-white font-bold text-sm py-3.5 rounded-2xl shadow-[0_4px_16px_rgba(204,0,0,0.25)] transition-all cursor-pointer mt-2"
        >
          Ingresar
        </button>

        <button
          type="button"
          id="btn-forgot-password"
          onClick={(e) => e.preventDefault()}
          className="text-[11px] text-gray-400 hover:text-neutral-600 text-center mt-1 cursor-pointer"
        >
          ¿Olvidaste tu contraseña?
        </button>
      </form>

      <button
        type="button"
        id="btn-go-register"
        onClick={onGoRegister}
        className="text-xs text-gray-500 text-center mt-6 cursor-pointer"
      >
        ¿No tenés cuenta? <span className="text-[#CC0000] font-bold hover:underline">Registrate</span>
      </button>
    </div>
  );
};
