import { IconDots } from '@tabler/icons-react';
import { useState } from 'react';
import { Stack } from '../../../components/flex/stack';
import { IconButton } from '../../../components/icon-button';
import { Popover } from '../../../components/popover';
import { useAuth } from '../../account/useAuth';
import { AddToListPopoverContent } from './add-to-list';
import { RatingPopoverContent } from './rating-action';
import dayjs from 'dayjs';

export interface ReleaseActionsProps {
  id: string;
  date: string;
}

const ReleaseActionsPopoverContent: React.FC<ReleaseActionsProps> = ({
  id,
  date,
}) => {
  const isUnreleased = dayjs(date).isAfter(dayjs());
  return (
    <Stack>
      {!isUnreleased && <RatingPopoverContent releaseId={id} />}
      <AddToListPopoverContent releaseId={id} />
    </Stack>
  );
};

export const ReleaseActions = ({ id, date }: ReleaseActionsProps) => {
  const { isLoggedIn } = useAuth();

  const [open, setOpen] = useState(false);

  if (!isLoggedIn) {
    return <div></div>;
  }

  return (
    <Popover
      open={open}
      onClose={() => setOpen(false)}
      content={<ReleaseActionsPopoverContent id={id} date={date} />}
    >
      <IconButton title="" onClick={() => setOpen(!open)}>
        <IconDots />
      </IconButton>
    </Popover>
  );
};

export default ReleaseActions;
