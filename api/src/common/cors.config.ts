export const getCorsConfig = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const domain = process.env.DOMAIN;

  return {
    credentials: true,
    origin: isProduction
      ? [`https://${domain}`, `https://www.${domain}`]
      : ['http://localhost:4200'],
  };
};
