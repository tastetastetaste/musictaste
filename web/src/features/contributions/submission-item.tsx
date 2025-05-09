import { useTheme } from '@emotion/react';
import { SubmissionStatus } from 'shared';

export const SubmissionItemWrapper = ({
  children,
  status,
}: {
  children: React.ReactElement;
  status: any;
}) => {
  const { colors } = useTheme();
  const color =
    status === SubmissionStatus['DISAPPROVED']
      ? colors.error
      : status === SubmissionStatus['APPROVED']
        ? colors.accent
        : colors.text;
  return (
    <div
      css={{
        borderBottom: `1px solid ${colors.text_sub}`,
        display: 'flex',
        alignItems: 'flex-end',
        padding: '10px 0',
        marginBottom: '6px',
      }}
    >
      <div css={{ flex: '1 1 0' }}>{children}</div>
      <div
        css={(theme) => ({
          flex: '0 0 100px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: `1px solid ${color}`,
          borderRadius: theme.border_radius.base,
        })}
      >
        <span
          css={(theme) => ({
            color: color,
            fontSize: theme.font.size.small,
          })}
        >
          {SubmissionStatus[status]}
        </span>
      </div>
    </div>
  );
};
