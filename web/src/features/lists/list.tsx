import styled from '@emotion/styled';
import {
  IconHeart,
  IconLayoutGrid,
  IconLayoutList,
  IconLock,
  IconMessage,
} from '@tabler/icons-react';
import { CardContainer } from '../../components/containers/card-container';
import { Group } from '../../components/flex/group';
import { Stack } from '../../components/flex/stack';
import { CardLink } from '../../components/links/card-link';
import { Link } from '../../components/links/link';
import { Typography } from '../../components/typography';
import { getListPathname } from '../../utils/get-pathname';
import { User } from '../users/user';

const StyledListThumb = styled.div`
  position: relative;
  overflow: hidden;
  height: 150px;
  max-width: 150px;
  flex-shrink: 1;
  flex-grow: 1;
  flex-basis: 0;

  display: inline-block;

  img {
    width: auto;
    max-width: 100%;
    height: 100%;
    aspect-ratio: 1;
    object-fit: cover;
  }
`;

const StyledListThumbPlaceholder = styled.div`
  height: 120px;
  overflow: hidden;
  flex-shrink: 1;
  flex-grow: 1;
  flex-basis: 0;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export interface ListProps {
  list: any;
  withoutUser?: boolean;
}

export function List({ list, withoutUser }: ListProps) {
  return (
    <CardContainer>
      <Stack gap="sm">
        <Group justify="apart">
          <Link size="title" to={getListPathname(list.id)}>
            {list.title}
          </Link>
          {!list.published && <IconLock />}
        </Group>
        <CardLink to={getListPathname(list.id)}>
          <Thumb cover={list.cover} />
        </CardLink>
        <Group justify="apart">
          <Group gap={2}>
            {list.grid ? (
              <IconLayoutGrid size="16px" />
            ) : (
              <IconLayoutList size="16px" />
            )}
            <Typography size="small">{list.listItemsCount}</Typography>
          </Group>
          <Group gap={2}>
            <IconHeart size="16px" />
            <Typography size="small">{list.likesCount}</Typography>
            <IconMessage size="16px" />
            <Typography size="small">{list.commentsCount}</Typography>
          </Group>
        </Group>
        {!withoutUser && <User user={list.user} />}
      </Stack>
    </CardContainer>
  );
}

interface ThumbProps {
  cover: Array<string | undefined | null>;
}

const Thumb = ({ cover }: ThumbProps) => {
  return (
    <Group>
      {cover && cover.length !== 0 ? (
        cover.map((imageStr, i) => (
          <StyledListThumb key={i}>
            {imageStr ? (
              <img src={imageStr} alt="release" />
            ) : (
              <img src="/placeholder.jpg" alt="release" />
            )}
          </StyledListThumb>
        ))
      ) : (
        <StyledListThumbPlaceholder>
          <span>*empty*</span>
        </StyledListThumbPlaceholder>
      )}
    </Group>
  );
};
