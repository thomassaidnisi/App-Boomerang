import React, { useState } from 'react';
import { AuthorizedUser, UserRole } from '../types';
import { LoginScreen } from './LoginScreen';
import { RegisterScreen } from './RegisterScreen';
import { AccessDeniedScreen } from './AccessDeniedScreen';

interface AuthFlowProps {
  users: AuthorizedUser[];
  onAuthSuccess: (user: AuthorizedUser) => void;
}

type AuthView = 'login' | 'register' | 'denied';

export const AuthFlow: React.FC<AuthFlowProps> = ({ users, onAuthSuccess }) => {
  const [view, setView] = useState<AuthView>('login');

  // TODO: reemplazar whitelist mock por consulta a Firestore colección
  // 'usuarios_autorizados' y crear cuenta con Firebase Auth email/password
  const findAuthorizedUser = (email: string) =>
    users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());

  const handleLogin = (email: string, _password: string) => {
    const match = findAuthorizedUser(email);
    if (match && match.active) {
      onAuthSuccess(match);
    } else {
      setView('denied');
    }
  };

  const handleRegister = (data: {
    firstName: string;
    lastName: string;
    email: string;
    course: string;
    division: string;
    type: 'Estudiante' | 'Docente';
  }) => {
    const match = findAuthorizedUser(data.email);

    if (match && match.active) {
      onAuthSuccess({
        ...match,
        name: `${data.firstName} ${data.lastName}`,
        role: data.type as UserRole,
        course: data.type === 'Estudiante' ? `${data.course}°${data.division}` : undefined,
      });
    } else {
      setView('denied');
    }
  };

  if (view === 'denied') {
    return <AccessDeniedScreen onBack={() => setView('login')} />;
  }

  if (view === 'register') {
    return <RegisterScreen onSubmitRegister={handleRegister} onGoLogin={() => setView('login')} />;
  }

  return <LoginScreen onSubmitLogin={handleLogin} onGoRegister={() => setView('register')} />;
};
