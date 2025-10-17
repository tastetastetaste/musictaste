const appendToFormData = (
  formData: FormData,
  key: string,
  value: any,
): void => {
  if (value == null) return;

  if (value instanceof File) {
    formData.append(key, value);
  } else if (Array.isArray(value)) {
    value.forEach((item, index) =>
      appendToFormData(formData, `${key}[${index}]`, item),
    );
  } else if (typeof value === 'object') {
    Object.entries(value).forEach(([subKey, subValue]) =>
      appendToFormData(formData, `${key}[${subKey}]`, subValue),
    );
  } else {
    formData.append(key, String(value));
  }
};

export const buildFormData = (data: Record<string, any>): FormData => {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) =>
    appendToFormData(formData, key, value),
  );
  return formData;
};
