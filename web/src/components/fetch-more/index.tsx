import styled from '@emotion/styled';
import { useEffect, useRef, useState } from 'react';
import { useOnScreen } from '../../hooks/useOnScreen';
import { Loading } from '../loading';

const FetchMoreContainer = styled.div`
  width: 100%;
  min-height: 20px;

  display: flex;
  align-items: center;
  justify-content: center;
`;

const FetchMoreClickContainer = styled.div`
  width: 100%;
  min-height: 20px;

  display: flex;
  align-items: center;
  justify-content: center;

  margin-bottom: 20px;
  cursor: pointer;
`;

export interface FetchMoreProps {
  handleFetchMore: any;
}

export function FetchMore({ handleFetchMore }: FetchMoreProps) {
  const { ref, isIntersecting } = useOnScreen('-10px');
  const [isLoading, setIsLoading] = useState(false);

  const fetchMoreData = async () => {
    setIsLoading(true);
    await handleFetchMore();
    setIsLoading(false);
  };

  useEffect(() => {
    if (isIntersecting) {
      fetchMoreData();
    }
  }, [isIntersecting]);

  return (
    <FetchMoreContainer ref={ref}>
      {isLoading && <Loading small />}
    </FetchMoreContainer>
  );
}

export function FetchMoreOnClick({ handleFetchMore }: FetchMoreProps) {
  const [isLoading, setIsLoading] = useState(false);

  const loadMore = async () => {
    setIsLoading(true);
    await handleFetchMore();
    setIsLoading(false);
  };

  return (
    <FetchMoreClickContainer onClick={loadMore}>
      {isLoading ? <Loading small /> : <span>Load more</span>}
    </FetchMoreClickContainer>
  );
}
