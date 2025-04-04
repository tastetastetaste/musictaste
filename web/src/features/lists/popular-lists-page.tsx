import Lists from './lists-list-renderer';
import ListsPageWrapper from './lists-page-wrapper';

const PopularListsPage = () => {
  return (
    <ListsPageWrapper>
      <Lists sortBy="popular" />
    </ListsPageWrapper>
  );
};

export default PopularListsPage;
