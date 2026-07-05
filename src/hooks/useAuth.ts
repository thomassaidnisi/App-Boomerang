import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { AuthorizedUser } from '../types';

interface UseAuthResult {
  user: User | null;
  authorizedUser: AuthorizedUser | null;
  loading: boolean;
  isAdmin: boolean;
  isAuthorized: boolean;
}

export function useAuth(): UseAuthResult {
  const [user, setUser] = useState<User | null>(null);
  const [authorizedUser, setAuthorizedUser] = useState<AuthorizedUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      setUser(firebaseUser);

      if (!firebaseUser?.email) {
        setAuthorizedUser(null);
        setLoading(false);
        return;
      }

      try {
        // Verifica en Firestore si el email logueado existe en la whitelist
        const usersRef = collection(db, 'usuarios_autorizados');
        const q = query(usersRef, where('email', '==', firebaseUser.email.toLowerCase()));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
          setAuthorizedUser(null);
        } else {
          const docSnap = snapshot.docs[0];
          const data = docSnap.data();
          setAuthorizedUser({
            id: docSnap.id,
            email: data.email,
            name: data.name,
            role: data.role,
            course: data.course,
            active: !!data.active,
          });
        }
      } catch (err) {
        console.error('Error verificando usuarios_autorizados:', err);
        setAuthorizedUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const isAuthorized = !!authorizedUser?.active;
  const isAdmin = isAuthorized && authorizedUser?.role === 'Admin';

  return { user, authorizedUser, loading, isAdmin, isAuthorized };
}
