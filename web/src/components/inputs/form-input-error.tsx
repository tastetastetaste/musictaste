import { Typography } from '../typography';

export const FormInputError = ({ error }) => {
  return error ? <Typography color="error">{error.message}</Typography> : null;
};
