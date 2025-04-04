import { createContext, useContext, useEffect } from 'react';
import { useQuery } from 'react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import { ContributorStatus, ICurrentUserResponse } from 'shared';
import { api } from '../../utils/api';
import { cacheKeys } from '../../utils/cache-keys';

interface IUseAuth {
  isLoggedIn: boolean;
  canVoteOnSubmissions: boolean;
  isLoading: boolean;
  me?: ICurrentUserResponse['user'] | null;
}

const useAuthContext = createContext<IUseAuth>({
  isLoggedIn: false,
  canVoteOnSubmissions: false,
  isLoading: true,
  me: null,
});

export const useAuth = () => {
  const v = useContext(useAuthContext);

  return v;
};

export const UseAuthProvider: React.FC<{
  children: JSX.Element | JSX.Element[];
}> = ({ children }) => {
  const { data, isLoading } = useQuery<ICurrentUserResponse>(
    cacheKeys.currentUserKey(),
    () => api.getCurrentUser(),
    { suspense: true },
  );

  const { pathname } = useLocation();
  const navigate = useNavigate();

  const user = data?.user;
  useEffect(() => {
    if (user && !user.confirmed && pathname !== '/confirm') {
      navigate('/confirm');
    }
  }, [navigate, pathname, user]);

  return (
    <useAuthContext.Provider
      value={{
        isLoggedIn: !!user,
        canVoteOnSubmissions:
          user?.contributorStatus >= ContributorStatus.TRUSTED_CONTRIBUTOR,
        isLoading,
        me: user,
      }}
    >
      {children}
    </useAuthContext.Provider>
  );
};
