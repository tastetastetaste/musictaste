import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';

const Spin = keyframes`
  from {
    -webkit-transform: rotate(0);
    transform: rotate(0);
  }
  to {
    -webkit-transform: rotate(360deg);
    transform: rotate(360deg);
  }
`;

const Container = styled.div<{ small?: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  min-height: ${({ small }) => (small ? undefined : '240px')};
`;

const Spinner = styled.div`
  border-radius: 50%;
  width: 30px;
  height: 30px;
  background-color: none;
  border-radius: 50%;
  border: 3px solid ${({ theme }) => theme.colors.background_sub};
  border-top: 3px solid ${({ theme }) => theme.colors.primary};
  animation: ${Spin} 1s linear 0s infinite;
`;

const SpinnerSmall = styled.div`
  border-radius: 50%;
  width: 20px;
  height: 20px;
  background-color: none;
  border-radius: 50%;
  border: 3px solid ${({ theme }) => theme.colors.background_sub};
  border-top: 3px solid ${({ theme }) => theme.colors.primary};
  animation: ${Spin} 1s linear 0s infinite;
`;

interface LoadingProps {
  small?: boolean;
}

export const Loading = ({ small }: LoadingProps) => {
  const SpinnerComponent = small ? SpinnerSmall : Spinner;

  return (
    <Container small={small}>
      <SpinnerComponent />
    </Container>
  );
};
