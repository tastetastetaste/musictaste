import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Group } from '../../components/flex/group';
import { Loading } from '../../components/loading';
import { useSnackbar } from '../../hooks/useSnackbar';
import {
  SOMETHING_WENT_WRONG,
  USER_EMAIL_CONFIRMED,
} from '../../static/feedback';
import { api } from '../../utils/api';

const ValidateEmailPage = () => {
  const { snackbar } = useSnackbar();

  const { token } = useParams();

  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const { data, error, isLoading } = useQuery(
    ['confirm', token],
    () => api.confirmEmail(token!),
    {
      enabled: !!token,
    },
  );

  useEffect(() => {
    if (data) {
      snackbar(USER_EMAIL_CONFIRMED);
      queryClient.invalidateQueries();
      navigate('/', { replace: true });
    }

    if (error) {
      snackbar(SOMETHING_WENT_WRONG, {
        isError: true,
      });
    }
  }, [data, error]);

  return <Group justify="center">{isLoading ? <Loading /> : <div />}</Group>;
};

export default ValidateEmailPage;
