import styled from '@emotion/styled';
import MarkdownToJsx from 'markdown-to-jsx';
import { Link } from 'react-router-dom';
import { SITE_DOMAIN } from '../../static/site-info';
import { isValidURL } from '../../utils/is-valid-url';
import { IconExternalLink, IconPhoto } from '@tabler/icons-react';

const MarkdownContainer = styled.div<{ variant?: 'default' | 'compact' }>`
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    margin: 0px 0px 1rem;

    font-family: ${({ theme }) => theme.font.family.base};
    font-weight: ${({ theme }) => theme.font.weight.bold};
    color: ${({ theme }) => theme.colors.text};
  }

  strong {
    font-weight: ${({ theme }) => theme.font.weight.bold};
    color: ${({ theme }) => theme.colors.text};
  }

  em {
    color: ${({ theme }) => theme.colors.text};
  }

  h1 {
    font-size: 20px;
  }

  h2 {
    font-size: 16px;
  }

  h3,
  h4,
  h5,
  h6 {
    font-size: 14px;
  }

  p {
    margin: ${({ variant }) => (variant === 'compact' ? '0' : '1em 0')};
    overflow-wrap: break-word;
    word-wrap: break-word;
    -ms-word-break: break-all;
    word-break: break-all;
    word-break: break-word;
    -ms-hyphens: auto;
    -moz-hyphens: auto;
    -webkit-hyphens: auto;
    hyphens: auto;
    white-space: pre-wrap;
    font-weight: ${({ theme }) => theme.font.weight.normal};
    font-family: ${({ theme }) => theme.font.family.sub};
    color: ${({ theme }) => theme.colors.text};
  }

  blockquote {
    &::before {
      color: ${({ theme }) => theme.colors.text};

      content: '“';
      position: absolute;
      top: -0.1em;
      left: -0.3em;
      font: bold 2.25rem / 1 'Times New Roman';
      color: inherit;
      opacity: 0.75;
    }

    margin: ${({ variant }) =>
      variant === 'compact' ? '0 0 0 0.5rem' : '1rem 0px 0px 0.5rem'};
    padding-left: 1rem;
    position: relative;
    display: block;
  }

  > div > ul {
    margin: 1em 0;
  }

  > div > ol {
    margin: 1em 0;
  }

  ul {
    list-style-type: initial;
  }

  li {
    margin: 0 1.2em;
  }

  hr {
    height: 1px;
    background-color: ${({ theme }) => theme.colors.primary};
    margin: 1em 0;
  }
`;

const MDLink = styled(Link)`
  text-decoration: underline;
  cursor: pointer;
  overflow: hidden;
  color: ${({ theme }) => theme.colors.primary};
  &:hover {
    color: ${({ theme }) => theme.colors.text};
  }
  &:active {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

export interface MarkdownProps {
  children: string;
  variant?: 'default' | 'compact';
}

export function Markdown({
  children: child,
  variant = 'default',
}: MarkdownProps) {
  return (
    <MarkdownContainer variant={variant}>
      <MarkdownToJsx
        options={{
          disableParsingRawHTML: true,
          forceBlock: true,
          overrides: {
            a: {
              component: ({ children, href, title }) => {
                let external = false;
                let to;
                let target = undefined;

                if (
                  (isValidURL(href) || href.includes(':')) &&
                  !href.includes(SITE_DOMAIN)
                ) {
                  // external link
                  to = href;
                  target = '_blank';
                  external = true;
                } else {
                  // relative link
                  to =
                    href.startsWith('/') || href.startsWith('http')
                      ? href
                      : `/${href}`;
                }

                return (
                  <div
                    css={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '2px',
                    }}
                  >
                    <MDLink to={to} target={target} title={title}>
                      {children}
                    </MDLink>
                    {external ? <IconExternalLink size={16} /> : null}
                  </div>
                );
              },
            },
            img: {
              component: ({ src, alt, title }) => {
                return (
                  <div
                    css={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '2px',
                    }}
                  >
                    <MDLink to={src} target="_blank" title={title}>
                      {alt}
                    </MDLink>
                    <IconPhoto size={16} />
                  </div>
                );
              },
            },
          },
        }}
      >
        {child}
      </MarkdownToJsx>
    </MarkdownContainer>
  );
}
