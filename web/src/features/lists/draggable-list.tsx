import styled from '@emotion/styled';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Fragment, memo, useEffect, useState } from 'react';
import {
  DragDropContext,
  Draggable,
  DraggableProvided,
  Droppable,
  DropResult,
} from 'react-beautiful-dnd';
import { IListItem } from 'shared';
import { Button } from '../../components/button';
import { Group } from '../../components/flex/group';
import { useSnackbar } from '../../hooks/useSnackbar';
import { SOMETHING_WENT_WRONG } from '../../static/feedback';
import { api } from '../../utils/api';
import { cacheKeys } from '../../utils/cache-keys';
import { EditListItem } from './edit-list-item';

export type RemoveItemFu = (index: number) => void;

const StyledDrggableList = styled.div`
  width: 100%;
  padding: 8px;
  border: 8px;
  display: flex;
  flex-direction: column;
`;

const StyledDropZone = styled.div`
  min-height: 250px;
  padding-bottom: 8px;
`;

const ListItem = memo(function ListItem({
  item,
  isDragging,
  provided,
  index,
  removeItem,
  listId,
}: {
  item: IListItem;
  isDragging: boolean;
  provided: DraggableProvided;
  index: number;
  removeItem: RemoveItemFu;
  listId: string;
}) {
  const handleRemove = () => {
    removeItem(index);
  };

  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      style={{ ...provided.draggableProps.style }}
      data-is-dragging={isDragging}
      data-testid={item.id}
      data-index={index}
      aria-label={`${item.release.title} By ${
        item.release.artists && item.release.artists.map((a) => a.name)
      }`}
    >
      <EditListItem
        id={item.id}
        release={item.release}
        index={index}
        note={item.note}
        noteSource={item.noteSource}
        handleRemove={handleRemove}
        listId={listId}
      />
    </div>
  );
});

const InnerListMap = memo(function InnerItemList({
  items,
  removeItem,
  listId,
}: {
  items: IListItem[];
  removeItem: RemoveItemFu;
  listId: string;
}) {
  return (
    <div>
      {items.map((item, index) => (
        <Draggable key={item.id} draggableId={item.id} index={index}>
          {(dragProvided, dragSnapshot) => (
            <ListItem
              key={item.index}
              index={index}
              item={item}
              isDragging={dragSnapshot.isDragging}
              removeItem={removeItem}
              provided={dragProvided}
              listId={listId}
            />
          )}
        </Draggable>
      ))}
    </div>
  );
});

function List({
  listId,
  items,
  removeItem,
}: {
  listId: string;
  items: IListItem[];
  removeItem: RemoveItemFu;
}) {
  return (
    <Droppable droppableId={listId}>
      {(dropProvided) => (
        <StyledDrggableList {...dropProvided.droppableProps}>
          <StyledDropZone ref={dropProvided.innerRef}>
            <InnerListMap
              items={items}
              removeItem={removeItem}
              listId={listId}
            />
            {dropProvided.placeholder}
          </StyledDropZone>
        </StyledDrggableList>
      )}
    </Droppable>
  );
}

const DraggableList = ({
  list: { id, items: listItems },
}: {
  list: { id: string; items: IListItem[] };
}) => {
  const qc = useQueryClient();

  const updateCache = () => qc.removeQueries(cacheKeys.listItemsKey(id));

  const { mutateAsync: removeFromList } = useMutation(api.removeFromList, {
    onSuccess: updateCache,
  });

  const { mutateAsync: reorderListItems, isLoading } = useMutation(
    api.reorderListItems,
    {
      onSuccess: updateCache,
    },
  );

  const [changed, setChanged] = useState(false);

  const [items, setItems] = useState<IListItem[]>([]);

  const { snackbar } = useSnackbar();

  useEffect(() => {
    setItems(listItems);
  }, [listItems]);

  const saveList = () => {
    reorderListItems({
      id,
      items: items.map((itm, i) => ({ id: itm.id, index: i })),
    }).catch(() => {
      snackbar(SOMETHING_WENT_WRONG, { isError: true });
    });

    setChanged(false);
  };

  function onDragStart() {
    // Add a little vibration if the browser supports it.
    // Add's a nice little physical feedback
    if (window.navigator.vibrate) {
      window.navigator.vibrate(100);
    }
  }

  function onDragEnd(result: DropResult) {
    const startIndex = result.source.index;
    const endIndex = result.destination?.index;

    // combining item
    if (result.combine) {
      // super simple: just removing the dragging item
      const newItems = [...items];
      newItems.splice(startIndex, 1);
      setItems(newItems);
      return;
    }

    // dropped outside the list
    if (!result.destination) {
      return;
    }

    if (endIndex === startIndex) {
      return;
    }

    if (typeof endIndex !== 'number') {
      return;
    }

    setChanged(true);

    const newItems = Array.from(items);
    const [removed] = newItems.splice(startIndex, 1);

    newItems.splice(endIndex, 0, removed);

    setItems(newItems);
  }

  const orderItems = (v: 'date_asc' | 'date_desc') => {
    const newItems = [...items];
    if (v === 'date_asc') {
      newItems.sort(
        (a, b) =>
          new Date(a.release.date).getTime() -
          new Date(b.release.date).getTime(),
      );
      setItems(newItems);
      setChanged(true);
    } else if (v === 'date_desc') {
      newItems.sort(
        (a, b) =>
          new Date(b.release.date).getTime() -
          new Date(a.release.date).getTime(),
      );
      setItems(newItems);
      setChanged(true);
    }
  };

  const removeItem: RemoveItemFu = (index) => {
    const newItems = Array.from(items);
    const [remove] = newItems.splice(index, 1);
    setItems(newItems);
    removeFromList({
      id,
      itemId: remove.id,
    });
  };

  return (
    <Fragment>
      <Group gap="sm">
        <Button
          variant="main"
          disabled={!changed || isLoading}
          onClick={saveList}
        >
          {changed ? 'Save' : 'Saved'}
        </Button>
        <span>order by: </span>
        <Button variant="main" onClick={() => orderItems('date_asc')}>
          date ASC
        </Button>
        <Button variant="main" onClick={() => orderItems('date_desc')}>
          date DESC
        </Button>
      </Group>
      <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <List listId={id} items={items} removeItem={removeItem} />
      </DragDropContext>
    </Fragment>
  );
};

export default DraggableList;
