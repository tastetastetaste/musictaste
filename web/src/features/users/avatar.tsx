import styled from '@emotion/styled';

const Container = styled.div`
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  img {
    border-radius: 50%;
  }
`;

export interface AvatarProps {
  src?: string | null;
  alt: string;
}

export function Avatar({ src, alt }: AvatarProps) {
  return (
    <Container>
      <img
        src={src || '/placeholder.jpg'}
        alt={alt}
        width={50}
        height={50}
        style={{
          height: 50,
          width: 50,
        }}
      />
    </Container>
  );
}
