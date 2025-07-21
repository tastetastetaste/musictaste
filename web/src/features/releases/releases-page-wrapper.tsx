import AppPageWrapper from '../../layout/app-page-wrapper';

const ReleasesPageWrapper: React.FC<{
  children: JSX.Element | JSX.Element[];
}> = ({ children }) => {
  return (
    <AppPageWrapper
      title="Releases"
      navigation={[
        { to: `/releases/new`, label: 'New' },
        { to: `/releases/upcoming`, label: 'Upcoming' },
        { to: `/releases/popular`, label: 'Popular' },
        { to: `/releases/top`, label: 'Top' },
        { to: `/releases/recently-added`, label: 'Recently added' },
      ]}
    >
      {children}
    </AppPageWrapper>
  );
};

export default ReleasesPageWrapper;
