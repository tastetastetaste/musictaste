import AppPageWrapper from '../../layout/app-page-wrapper';

const ListsPageWrapper: React.FC<{ children: JSX.Element | JSX.Element[] }> = ({
  children,
}) => {
  return (
    <AppPageWrapper
      title="Lists"
      navigation={[
        { to: `/lists/new`, label: 'New' },
        { to: `/lists/popular`, label: 'Popular' },
      ]}
    >
      {children}
    </AppPageWrapper>
  );
};

export default ListsPageWrapper;
