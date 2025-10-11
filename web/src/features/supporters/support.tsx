import styled from '@emotion/styled';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/button';
import { Stack } from '../../components/flex/stack';
import { Typography } from '../../components/typography';
import { useAuth } from '../account/useAuth';
import { SupporterStatus } from 'shared';

const Section = styled.div`
  background: ${({ theme }) => theme.colors.background_sub};
  border-radius: ${({ theme }) => theme.border_radius.base};
  padding: 18px;
  margin-top: 48px;
  margin-bottom: 24px;
`;

const Cta = styled.div`
  margin-top: 6px;
`;

function Support() {
  const navigate = useNavigate();

  const { isLoading, me } = useAuth();

  if (isLoading || me?.supporter === SupporterStatus.SUPPORTER) return null;

  return (
    <Section>
      <Stack gap="md">
        <Typography size="title">
          Support your favorite music reviews site by giving a small donation!
        </Typography>
        <Cta>
          <Button onClick={() => navigate('/support-us')} variant="highlight">
            Support us
          </Button>
        </Cta>
      </Stack>
    </Section>
  );
}

export default Support;
