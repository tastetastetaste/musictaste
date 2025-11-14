import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { FindReleasesType, ReportType } from 'shared';
import { Stack } from '../../components/flex/stack';
import { Loading } from '../../components/loading';
import { Typography } from '../../components/typography';
import { useSnackbar } from '../../hooks/useSnackbar';
import AppPageWrapper from '../../layout/app-page-wrapper';
import { api } from '../../utils/api';
import { cacheKeys } from '../../utils/cache-keys';
import ReleasesListRenderer from '../releases/releases-list-renderer';
import { ReportDialog } from '../reports/report-dialog';

const LabelPage = () => {
  const { id } = useParams();

  const { snackbar } = useSnackbar();

  const [openReport, setOpenReport] = useState(false);

  const { data, isLoading } = useQuery(
    cacheKeys.labelKey(id),
    () => api.getLabel(id!),
    {
      enabled: !!id,
    },
  );

  const label = data && data.label;

  return (
    <AppPageWrapper
      title={label ? label.name : ''}
      menu={[
        {
          label: 'History',
          to: '/history/label/' + label?.id,
        },
        {
          label: 'Edit',
          to: '/contributions/labels/' + label?.id,
        },
        {
          label: 'Copy ID',
          action: () => {
            navigator.clipboard.writeText(label?.id || '');
            snackbar('ID copied to clipboard');
          },
        },
        {
          label: 'Copy Reference',
          action: () => {
            navigator.clipboard.writeText(`[[label/${label?.id}]]`);
            snackbar('Reference copied to clipboard');
          },
        },
        {
          label: 'Report',
          action: () => setOpenReport(true),
        },
      ]}
    >
      {isLoading ? <Loading /> : <div></div>}

      {label ? (
        <Stack>
          <div
            css={{
              minHeight: '130px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              padding: '10px 0',
            }}
          >
            <Typography size="title-xl" as="h1">
              {label.name}
            </Typography>
            {label.nameLatin && (
              <Typography size="title-lg">{label.nameLatin}</Typography>
            )}
          </div>
          <ReleasesListRenderer type={FindReleasesType.New} labelId={id} />
        </Stack>
      ) : (
        <div></div>
      )}
      <ReportDialog
        id={(data && data.label && data.label.id) || ''}
        type={ReportType.LABEL}
        isOpen={openReport}
        onClose={() => setOpenReport(false)}
      />
    </AppPageWrapper>
  );
};

export default LabelPage;
