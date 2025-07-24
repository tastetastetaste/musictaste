import AppPageWrapper from '../../layout/app-page-wrapper';
import { useThemeColors } from './useTheme';
import { Input } from '../../components/inputs/input';
import { Container } from '../../components/containers/container';
import { Stack } from '../../components/flex/stack';
import { Group } from '../../components/flex/group';
import { Typography } from '../../components/typography';
import { THEME_COLOR_PRESETS } from './theme-constants';

const colorFields = [
  { name: 'background', label: 'background' },
  {
    name: 'background_sub',
    label: 'background sub',
  },
  {
    name: 'primary',
    label: 'primary',
  },
  {
    name: 'highlight',
    label: 'highlight',
  },
  { name: 'text', label: 'text' },
  { name: 'text_sub', label: 'text sub' },
  { name: 'error', label: 'error' },
];

const ThemePage = () => {
  const { themeColors, setThemeColors, applyPreset, selectedPreset } =
    useThemeColors();

  const handlePresetClick = (presetName: string) => {
    applyPreset(presetName);
  };

  const handleColorChange = (field: string, value: string) => {
    setThemeColors({ ...themeColors, [field]: value });
  };

  return (
    <AppPageWrapper title="Theme">
      <Container>
        <Stack gap={16}>
          <Typography size="title">Theme Presets</Typography>
          <Group gap={12} wrap>
            {Object.keys(THEME_COLOR_PRESETS).map((themeName) => (
              <button
                key={themeName}
                css={(theme) => ({
                  borderRadius: theme.border_radius.base,
                  border:
                    selectedPreset === themeName
                      ? `1px solid ${theme.colors.primary}`
                      : 'none',
                  background: THEME_COLOR_PRESETS[themeName].background,
                  cursor: 'pointer',
                  padding: 12,
                  color: THEME_COLOR_PRESETS[themeName].text,
                })}
                onClick={() => handlePresetClick(themeName)}
                type="button"
              >
                {themeName}
              </button>
            ))}
          </Group>
          <Typography size="title">Customize Colors</Typography>
          <Stack gap={4}>
            {colorFields.map(({ name, label }) => (
              <Group align="center" gap={4} key={name}>
                <div css={{ flex: '1 1 120px' }}>
                  <Typography size="body">{label}</Typography>
                </div>
                <input
                  type="color"
                  value={themeColors[name]}
                  onChange={(e) => handleColorChange(name, e.target.value)}
                  css={(theme) => ({
                    flex: '0 0 40px',
                    overflow: 'hidden',
                    height: 40,
                    width: 40,
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    borderRadius: theme.border_radius.base,
                  })}
                />
                <div css={{ flex: '0 0 120px' }}>
                  <Input
                    type="text"
                    value={themeColors[name]}
                    onChange={(e) => handleColorChange(name, e.target.value)}
                  />
                </div>
              </Group>
            ))}
          </Stack>
        </Stack>
      </Container>
    </AppPageWrapper>
  );
};

export default ThemePage;
