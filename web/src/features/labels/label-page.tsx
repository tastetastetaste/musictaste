import { useState } from 'react';
import { useQuery } from 'react-query';
import { useParams } from 'react-router-dom';
import { FindReleasesType, ReportType } from 'shared';
import { Stack } from '../../components/flex/stack';
import { Loading } from '../../components/loading';
import { Typography } from '../../components/typography';
import AppPageWrapper from '../../layout/app-page-wrapper';
import { api } from '../../utils/api';
import { cacheKeys } from '../../utils/cache-keys';
import ReleasesListRenderer from '../releases/releases-list-renderer';
import { ReportDialog } from '../reports/report-dialog';

const LabelPage = () => {
  const { id } = useParams();

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
