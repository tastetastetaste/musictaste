import { toFormData } from 'axios';

export const buildFormData = (data: Record<string, any>): FormData => {
  return toFormData(data) as FormData;
};
