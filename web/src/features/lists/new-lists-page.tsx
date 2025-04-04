import Lists from './lists-list-renderer';
import ListsPageWrapper from './lists-page-wrapper';

const NewListsPage = () => {
  return (
    <ListsPageWrapper>
      <Lists sortBy="new" />
    </ListsPageWrapper>
  );
};

export default NewListsPage;
