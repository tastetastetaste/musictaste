import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/button';
import { Container } from '../../components/containers/container';
import { Group } from '../../components/flex/group';
import { Stack } from '../../components/flex/stack';
import { Input } from '../../components/inputs/input';
import { Typography } from '../../components/typography';
import { useSnackbar } from '../../hooks/useSnackbar';
import { api } from '../../utils/api';
import { useAuth } from '../account/useAuth';
import { THEME_COLOR_PRESETS } from '../theme/theme-constants';
import { useThemeColors } from '../theme/useTheme';

const SettingsThemePage = () => {
  const { themeColors, setThemeColors, applyPreset, selectedPreset } =
    useThemeColors();
  const { me } = useAuth();
  const navigate = useNavigate();

  const { snackbar } = useSnackbar();

  const { mutateAsync: updateTheme, isLoading } = useMutation(api.updateTheme, {
    onSuccess: () => {
      snackbar('Theme updated');
    },
  });

  const handlePresetClick = (presetName: string) => {
    applyPreset(presetName);
  };

  const handleColorChange = (field: string, value: string) => {
    setThemeColors({ ...themeColors, [field]: value });
  };

  const handleSaveTheme = async () => {
    await updateTheme({ id: me.id, theme: themeColors });
  };

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

  return (
    <Container>
      <Stack gap="lg">
        <Typography size="title-lg">Theme Presets</Typography>
        <Group gap="md" wrap>
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
        <Typography size="title-lg">Customize Colors</Typography>
        <Stack gap="sm">
          {colorFields.map(({ name, label }) => (
            <Group align="center" key={name}>
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
        <Typography size="small">
          Unsaved changes will be lost. If you are a supporter, these colors
          will also be applied to your public profile.
        </Typography>
        <Button onClick={handleSaveTheme} disabled={isLoading}>
          Save
        </Button>
      </Stack>
    </Container>
  );
};

export default SettingsThemePage;
