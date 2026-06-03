import { useEffect, useRef } from 'react';
import type { AuthStatus, CachedUser, User } from '../../types';

type StableLoginViewArgs = {
  authStatus: AuthStatus;
  user: User | null;
  cachedUser: CachedUser | null;
};  

export function useStableLoginView({ authStatus, user, cachedUser }: StableLoginViewArgs) {
  const liveHasLogin = Boolean(user || cachedUser);
  const lastKnownHasLoginRef = useRef<boolean | null>(liveHasLogin ? true : null);

  useEffect(() => {
    if (authStatus === 'unknown' || authStatus === 'checking') {
      return;
    }

    lastKnownHasLoginRef.current = liveHasLogin;
  }, [authStatus, liveHasLogin]);

  const isAuthPending = authStatus === 'unknown' || authStatus === 'checking';
  const hasKnownSession = lastKnownHasLoginRef.current !== null;
  const hasLogin = isAuthPending ? (lastKnownHasLoginRef.current ?? liveHasLogin) : liveHasLogin;

  return {
    hasKnownSession,
    hasLogin,
    isAuthPending,
  };
}
