import { css, Theme, useTheme } from '@emotion/react';
import { useDropzone } from 'react-dropzone';

const dropzoneStyles = (theme: Theme) => css`
  border-radius: ${theme.border_radius.base};
  padding: 20px;
  background-color: ${theme.colors.background_sub};
  color: ${theme.colors.primary};
  text-align: center;
  cursor: pointer;
  outline: none;
  width: 100%;

  &:hover {
    border-color: ${theme.colors.text};
    color: ${theme.colors.text};
  }
`;

export const Dropzone = ({
  onDrop,
  file,
  fileURL,
  placeholder,
}: {
  onDrop: any;
  file: any;
  fileURL?: string;
  placeholder: string;
}) => {
  const theme = useTheme();

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <div {...getRootProps()} css={dropzoneStyles(theme)}>
      <input {...getInputProps()} />
      <p>{placeholder}</p>
      {file ? (
        <div>
          <img
            src={URL.createObjectURL(file)}
            alt="Preview"
            style={{ marginTop: '20px', maxHeight: '200px' }}
          />
        </div>
      ) : fileURL ? (
        <div>
          <img
            src={fileURL}
            alt="Preview"
            style={{ marginTop: '20px', maxHeight: '200px' }}
          />
        </div>
      ) : (
        <div></div>
      )}
    </div>
  );
};
