import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, doc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { LoginScreen } from './LoginScreen';
import { RegisterScreen } from './RegisterScreen';
import { AccessDeniedScreen } from './AccessDeniedScreen';

type AuthView = 'login' | 'register' | 'denied';

const LOGIN_ERROR_MESSAGES: Record<string, string> = {
  'auth/invalid-credential': 'Email o contraseña incorrectos',
  'auth/too-many-requests': 'Demasiados intentos, esperá unos minutos',
  'auth/user-disabled': 'Tu cuenta fue desactivada',
};

export const AuthFlow: React.FC = () => {
  const [view, setView] = useState<AuthView>('login');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (email: string, password: string) => {
    setErrorMessage('');
    setIsSubmitting(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
      // useAuth (App.tsx) recoge la sesión vía onAuthStateChanged a partir de acá.
    } catch (err: any) {
      setErrorMessage(LOGIN_ERROR_MESSAGES[err.code] || 'No se pudo iniciar sesión. Intentá de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    course: string;
    division: string;
    type: 'Estudiante' | 'Docente';
  }) => {
    setErrorMessage('');
    setIsSubmitting(true);
    const normalizedEmail = data.email.trim().toLowerCase();

    try {
      // 1. Verificar whitelist en Firestore antes de crear la cuenta
      const usersRef = collection(db, 'usuarios_autorizados');
      const whitelistQuery = query(
        usersRef,
        where('email', '==', normalizedEmail),
        where('active', '==', true)
      );
      const snapshot = await getDocs(whitelistQuery);

      if (snapshot.empty) {
        setIsSubmitting(false);
        setView('denied');
        return;
      }

      // 2. Crear la cuenta en Firebase Auth
      const credential = await createUserWithEmailAndPassword(auth, normalizedEmail, data.password);

      // 3. Guardar el perfil completo en Firestore colección 'usuarios'
      await setDoc(doc(db, 'usuarios', credential.user.uid), {
        uid: credential.user.uid,
        nombre: data.firstName,
        apellido: data.lastName,
        email: normalizedEmail,
        curso: data.course,
        division: data.division,
        tipo: data.type,
        fechaRegistro: new Date().toISOString(),
      });
      // useAuth (App.tsx) recoge la sesión vía onAuthStateChanged a partir de acá.
    } catch (err: any) {
      setErrorMessage(
        err.code === 'auth/email-already-in-use'
          ? 'Ese email ya tiene una cuenta registrada'
          : 'No se pudo completar el registro. Intentá de nuevo.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (view === 'denied') {
    return <AccessDeniedScreen onBack={() => setView('register')} />;
  }

  if (view === 'register') {
    return (
      <RegisterScreen
        onSubmitRegister={handleRegister}
        onGoLogin={() => { setErrorMessage(''); setView('login'); }}
        errorMessage={errorMessage}
        isSubmitting={isSubmitting}
      />
    );
  }

  return (
    <LoginScreen
      onSubmitLogin={handleLogin}
      onGoRegister={() => { setErrorMessage(''); setView('register'); }}
      errorMessage={errorMessage}
      isSubmitting={isSubmitting}
    />
  );
};
