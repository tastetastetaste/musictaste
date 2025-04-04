import { api } from '../../utils/api';
import { useEffect } from 'react';
import { useQueryClient, useQuery } from 'react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { Group } from '../../components/flex/group';
import { Loading } from '../../components/loading';
import {
  USER_EMAIL_CONFIRMED,
  SOMETHING_WENT_WRONG,
} from '../../static/feedback';
import { useSnackbar } from '../../hooks/useSnackbar';

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
