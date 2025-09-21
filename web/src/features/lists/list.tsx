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
import { IListReleaseCover } from 'shared';
import { hideExplicitCoverArtFn } from '../releases/release/shared';

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
  const linkTo = getListPathname(list.id);
  const linkState = {
    user: list.user,
  };

  return (
    <CardContainer>
      <Stack gap="sm">
        <Group justify="apart">
          <Link size="title" to={linkTo} state={linkState}>
            {list.title}
          </Link>
          {!list.published && <IconLock />}
        </Group>
        <CardLink to={linkTo} state={linkState}>
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
  cover: Array<IListReleaseCover>;
}

const Thumb = ({ cover }: ThumbProps) => {
  return (
    <Group>
      {cover && cover.length !== 0 ? (
        cover.map((cover, i) => (
          <StyledListThumb key={i}>
            {hideExplicitCoverArtFn(cover.explicitCoverArt) ? (
              <img src={`/placeholder/explicit-sm.jpeg`} alt="release" />
            ) : cover?.cover ? (
              <img src={cover.cover} alt="release" />
            ) : (
              <img src="/placeholder/sm.jpeg" alt="release" />
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
