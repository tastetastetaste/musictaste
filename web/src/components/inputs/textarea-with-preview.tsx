import { useMutation } from '@tanstack/react-query';
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { api } from '../../utils/api';
import { Checkbox } from './checkbox';
import { Textarea } from './textarea';
import { Markdown } from '../markdown';
import { Stack } from '../flex/stack';
import styled from '@emotion/styled';

const PreviewContainer = styled.div`
  padding: 6px 10px;
  border-radius: ${({ theme }) => theme.border_radius.base};
  background-color: ${({ theme }) => theme.colors.background_sub};
  min-height: 100px;
`;

interface TextareaWithPreviewProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const TextareaWithPreview = forwardRef<
  HTMLTextAreaElement,
  TextareaWithPreviewProps
>(({ error, ...props }, ref) => {
  const [showPreview, setShowPreview] = useState(false);
  const [previewContent, setPreviewContent] = useState<string>('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useImperativeHandle(ref, () => textareaRef.current);

  const { mutateAsync: parseLinks, isLoading: isParsing } = useMutation(
    api.parseLinks,
    {
      onSuccess: (data) => {
        setPreviewContent(data.text);
      },
    },
  );

  const updatePreview = async (value: string) => {
    if (value) {
      try {
        await parseLinks(value);
      } catch (error) {
        console.error('Failed to parse links:', error);
        setPreviewContent(value);
      }
    } else {
      setPreviewContent('');
    }
  };

  const handlePreviewToggle = async (checked: boolean) => {
    setShowPreview(checked);
    if (checked) {
      const value = textareaRef.current?.value || '';
      await updatePreview(value);
    }
  };

  return (
    <Stack gap="sm">
      <Checkbox
        name="preview"
        value={showPreview}
        onChange={handlePreviewToggle}
        label="Preview"
      />
      {showPreview ? (
        <PreviewContainer>
          {isParsing ? (
            <div>Loading preview...</div>
          ) : (
            <Markdown>
              {previewContent || textareaRef.current?.value || ''}
            </Markdown>
          )}
        </PreviewContainer>
      ) : (
        <Textarea
          ref={textareaRef}
          onChange={props.onChange}
          error={error}
          {...props}
        />
      )}
    </Stack>
  );
});
