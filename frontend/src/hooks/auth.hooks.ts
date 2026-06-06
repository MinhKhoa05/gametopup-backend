import { useRoute } from './common/route.hooks';
import { useAuthStore } from '../store/auth.store';
import type { AuthFormData } from '../types';
import { useAuthMutations, useAuthUserQuery } from '../services/auth';

export type AuthMode = 'login' | 'register';

export function useAuthSession() {
  const { navigate } = useRoute();
  const authUserQuery = useAuthUserQuery();
  const authMutations = useAuthMutations();
  const user = authUserQuery.data ?? null;
  const authStatus: 'unknown' | 'checking' | 'authenticated' | 'guest' = authUserQuery.isLoading ? 'checking' : user ? 'authenticated' : 'guest';
  const isLoggedIn = authStatus === 'authenticated';
  function submitAuth({ form, mode }: { form: AuthFormData; mode: AuthMode }) {
    const navigateToGames = () => navigate({ name: 'games' });
    const loginPayload = {
      email: form.email,
      password: form.password,
    };

    if (mode === 'register') {
      authMutations.register.mutate(
        {
          displayName: form.displayName,
          email: form.email,
          password: form.password,
        },
        {
          onSuccess: () => {
            authMutations.login.mutate(loginPayload, {
              onSuccess: navigateToGames,
            });
          },
        },
      );
      return;
    }

    authMutations.login.mutate(loginPayload, {
      onSuccess: navigateToGames,
    });
  }

  function handleLogout() {
    authMutations.logout.mutate(undefined, {
      onSuccess: () => {
        useAuthStore.getState().setGuest();
        navigate({ name: 'home' });
      },
    });
  }

  return {
    isAuthSubmitting: authMutations.login.isPending || authMutations.logout.isPending || authMutations.register.isPending,
    authStatus,
    isLoggedIn,
    handleLogout,
    submitAuth,
    user,
  };
}
