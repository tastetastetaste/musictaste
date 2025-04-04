import '@emotion/react';

declare module '@emotion/react' {
  export interface Theme {
    colors: {
      base: string;
      complement: string;
      main: string;
      accent: string;
      text: string;
      text_sub: string;
      error: string;
    };
    border_radius: {
      base: string;
    };
    font: {
      family: {
        base: string;
        sub: string;
      };
      weight: {
        normal: number;
        bold: number;
        bolder: number;
      };
      size: {
        title_xl: string;
        title_lg: string;
        title: string;
        body: string;
        small: string;
      };
    };
  }
}
