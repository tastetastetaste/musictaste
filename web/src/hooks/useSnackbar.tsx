import { createContext, useContext, useEffect, useRef, useState } from 'react';
import styled from '@emotion/styled';
import { IconButton } from '../components/icon-button';
import { IconX } from '@tabler/icons-react';

let id = 0;

const StyledSnackbarCard = styled.div`
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
  width: 100%;
`;

const StyledSnackbarContent = styled.div<{
  isError?: boolean;
}>`
  color: ${({ theme }) => theme.colors.base};
  background: ${({ isError, theme }) =>
    isError ? theme.colors.error : theme.colors.accent};
  border-radius: ${({ theme }) => theme.border_radius.base};
  padding: 12px 22px;
  font-size: 14px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  height: auto;
  margin-top: 10px;
`;

const StyledSnackbar = styled.div`
  position: fixed;
  z-index: 5000;
  width: 0 auto;
  bottom: 30px;
  margin: 0 auto;
  left: 30px;
  right: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  @media only screen and (min-width: 600px) {
    align-items: flex-start;
    ${StyledSnackbarCard} {
      width: 40ch;
    }
  }
`;

type SnackbarOptionsObject = {
  isError?: boolean;
};

type NewSnackbarFn = (msg: string, options?: SnackbarOptionsObject) => void;

type SetRef = (newSnackbarFn: NewSnackbarFn) => void;

const Snackbar = ({ setRef }: { setRef: SetRef }) => {
  const [items, setItems] = useState<
    { key: number; msg: string; options?: SnackbarOptionsObject }[]
  >([]);

  const newSnackbarFn: NewSnackbarFn = (msg, options) =>
    setItems((state) => [...state, { key: id++, msg, options }]);

  useEffect(() => void setRef(newSnackbarFn), [setRef]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (items.length > 0) {
        setItems((items) => items.slice(1));
      }
    }, 5000);
    return () => clearInterval(timer);
  }, [items]);

  return (
    <StyledSnackbar>
      {items.map((item) => (
        <StyledSnackbarCard key={item.key}>
          <StyledSnackbarContent isError={item.options?.isError}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                width: '100%',
              }}
            >
              <span>{item.msg}</span>
              <IconButton
                title="close"
                onClick={() => {
                  setItems((items) => items.filter((i) => i.key !== item.key));
                }}
              >
                <IconX />
              </IconButton>
            </div>
          </StyledSnackbarContent>
        </StyledSnackbarCard>
      ))}
    </StyledSnackbar>
  );
};

export const snackBarRefContext =
  createContext<React.MutableRefObject<NewSnackbarFn | null> | null>(null);

export const SnackbarProvider: React.FC<{
  children: JSX.Element | JSX.Element[];
}> = ({ children }) => {
  const ref = useRef<NewSnackbarFn | null>(null);

  const setRef: SetRef = (createMIFu) => (ref.current = createMIFu);

  return (
    <snackBarRefContext.Provider value={ref}>
      {children}
      <Snackbar setRef={setRef} />
    </snackBarRefContext.Provider>
  );
};

export const useSnackbar = () => {
  const ref = useContext(snackBarRefContext);

  const snackbar = (msg: string, options?: SnackbarOptionsObject) => {
    if (ref && ref.current && ref.current !== null) {
      ref.current(msg, options);
    }
  };

  return { snackbar };
};
