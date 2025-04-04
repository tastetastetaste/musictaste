import AppPageWrapper from '../../layout/app-page-wrapper';

const ReviewsPageWrapper: React.FC<{
  children: JSX.Element | JSX.Element[];
}> = ({ children }) => {
  return (
    <AppPageWrapper
      title="Reviews"
      navigation={[
        { to: `/reviews/new`, label: 'New' },
        { to: `/reviews/top`, label: 'Top' },
      ]}
    >
      {children}
    </AppPageWrapper>
  );
};

export default ReviewsPageWrapper;
