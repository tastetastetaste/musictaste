import styled from '@emotion/styled';
import { Fragment } from 'react';
import { LinkProps } from 'react-router-dom';
import { ExplicitCoverArt, IArtistSummary, IReleaseSummary } from 'shared';
import { CardLink } from '../../../components/links/card-link';
import { Link } from '../../../components/links/link';
import { Typography } from '../../../components/typography';
import { getArtistPath, getReleasePath } from 'shared';
import { useAuth } from '../../account/useAuth';

export type ReleaseImageSizeT = 'lg' | 'md' | 'sm' | 'xs';

export const releaseImageWidthMap = {
  lg: '350px',
  md: '350px',
  sm: '150px',
  xs: '100px',
};

const StyledReleaseImageContainer = styled.div<{ size: ReleaseImageSizeT }>`
  position: relative;
  width: 100%;
  padding-top: 100%; /* Creates square based on width */
  background: #cccccc;
  border-radius: ${({ theme }) => theme.border_radius.base};
  overflow: hidden;
  max-width: ${({ size }) => releaseImageWidthMap[size]};
`;

const StyledReleaseImage = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.3s;
`;

interface ReleaseImageLinkProps {
  release: IReleaseSummary;
  size?: ReleaseImageSizeT;
}

export const hideExplicitCoverArtFn = (
  releaseExplicitCoverArt?: ExplicitCoverArt[],
) => {
  const { me } = useAuth();
  return (
    releaseExplicitCoverArt &&
    releaseExplicitCoverArt.length > 0 &&
    (!me ||
      !me.allowExplicitCoverArt ||
      releaseExplicitCoverArt.some(
        (c) => !me.allowExplicitCoverArt.includes(c),
      ))
  );
};

export const ReleaseImageLink: React.FC<ReleaseImageLinkProps> = ({
  release: { id, cover, artists, title, explicitCoverArt },
  size = 'md',
}) => {
  const sizeKey =
    size === 'xs' || size === 'sm' ? 'sm' : size === 'md' ? 'md' : 'lg';

  const hideExplicitCoverArt = hideExplicitCoverArtFn(explicitCoverArt);

  return (
    <CardLink to={getReleasePath({ releaseId: id })}>
      <StyledReleaseImageContainer size={size}>
        <StyledReleaseImage
          src={
            hideExplicitCoverArt
              ? `/placeholder/explicit-${sizeKey}.jpeg`
              : cover
                ? cover[sizeKey]
                : `/placeholder/${sizeKey}.jpeg`
          }
          alt={`${artists.map((a) => a.name).join(', ')} - ${title}`}
          width={releaseImageWidthMap[size]}
          height={releaseImageWidthMap[size]}
          loading="lazy"
          onLoad={(e) => (e.currentTarget.style.opacity = '1')}
          css={{ opacity: 0 }}
        />
      </StyledReleaseImageContainer>
    </CardLink>
  );
};

export const ReleaseTitleLink = ({
  to,
  title,
  latinTitle,
}: {
  to: LinkProps['to'];
  title: string;
  latinTitle?: string;
}) => {
  return (
    <Link to={to} size="title">
      {title}
      <span css={{ fontStyle: 'italic' }}>
        {latinTitle && ` [${latinTitle}]`}
      </span>
    </Link>
  );
};

export const ArtistsLinks = ({ artists }: { artists: IArtistSummary[] }) => {
  return (
    <Typography color="sub">
      {artists.map(({ id, name, nameLatin }, i) => (
        <Fragment key={id}>
          {i > 0 && ', '}
          <Link to={getArtistPath({ artistId: id })}>
            {name}{' '}
            {nameLatin ? (
              <span css={{ fontStyle: 'italic' }}>[{nameLatin}]</span>
            ) : (
              ''
            )}
          </Link>
        </Fragment>
      ))}
    </Typography>
  );
};

export const LabelsLinks = ({
  links,
}: {
  links: { label: string; href: string }[];
}) => {
  return (
    <Typography color="sub">
      {links.map(({ label, href }, i) => (
        <Fragment key={href}>
          {i > 0 && ', '}
          <Link to={href}>{label}</Link>
        </Fragment>
      ))}
    </Typography>
  );
};
export const GenresLinks = ({
  links,
}: {
  links: { label: string; href: string }[];
}) => {
  return (
    <Typography color="sub">
      {links.map(({ label, href }, i) => (
        <Fragment key={href}>
          {i > 0 && ', '}
          <Link to={href}>{label}</Link>
        </Fragment>
      ))}
    </Typography>
  );
};
