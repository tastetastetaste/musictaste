import { useState } from 'react';
import { useQuery } from 'react-query';
import { useParams } from 'react-router-dom';
import { FindReleasesType } from 'shared';
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
              height: 280,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
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
        type="label"
        isOpen={openReport}
        onClose={() => setOpenReport(false)}
      />
    </AppPageWrapper>
  );
};

export default LabelPage;
