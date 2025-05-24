import { useQuery } from 'react-query';
import { useParams } from 'react-router-dom';
import { cacheKeys } from '../../utils/cache-keys';
import { api } from '../../utils/api';
import AppPageWrapper from '../../layout/app-page-wrapper';
import { Loading } from '../../components/loading';
import { Stack } from '../../components/flex/stack';
import { Typography } from '../../components/typography';
import { ILabelResponse } from 'shared';
import { Grid } from '../../components/flex/grid';
import { RELEASE_GRID_PADDING } from '../releases/releases-virtual-grid';
import { Release } from '../releases/release';
import { Feedback } from '../../components/feedback';
import { useState } from 'react';
import { ReportDialog } from '../reports/report-dialog';

const Releases: React.FC<{ releases: ILabelResponse['releases'] }> = ({
  releases,
}) => {
  return (
    <Stack gap="sm">
      {releases.length > 0 ? (
        <>
          <Typography size="title-lg">Releases</Typography>

          <Grid cols={[2, 4, 4, 6]} gap={RELEASE_GRID_PADDING}>
            {releases
              .sort(
                (a, b) => Number(new Date(b.date)) - Number(new Date(a.date)),
              )
              .map((release) => (
                <Release release={release} key={release.id} />
              ))}
          </Grid>
        </>
      ) : (
        <Feedback message="There are no releases associated with this label" />
      )}
    </Stack>
  );
};

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
          <Releases releases={data.releases} />
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
