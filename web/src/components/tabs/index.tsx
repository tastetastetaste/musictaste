import styled from '@emotion/styled';
import { Group } from '../flex/group';

const TabContainer = styled.div`
  padding: 10px;
  margin: 10px 0;
  background: ${({ theme }) => theme.colors.background_sub};
  border-radius: ${({ theme }) => theme.border_radius.base};
`;

const TabButton = styled.button<{ active: boolean }>`
  background: none;
  border: none;
  cursor: pointer;
  font-size: ${({ theme }) => theme.font.size.body};
  color: ${({ theme, active }) =>
    active ? theme.colors.highlight : theme.colors.primary};

  &:hover {
    color: ${({ theme }) => theme.colors.text};
  }
`;

export interface Tab {
  key: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabKey: string) => void;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onTabChange }) => {
  return (
    <TabContainer>
      <Group gap="lg" wrap>
        {tabs.map((tab) => (
          <TabButton
            key={tab.key}
            active={activeTab === tab.key}
            onClick={() => onTabChange(tab.key)}
          >
            {tab.label}
          </TabButton>
        ))}
      </Group>
    </TabContainer>
  );
};
