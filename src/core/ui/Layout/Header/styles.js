import styled from "@emotion/styled";
import { AppBar, Typography, IconButton } from "@mui/material";

export const Title = styled(Typography)`
  text-transform: uppercase;
  font-weight: 600;
  color: ${({ theme }) => theme.palette.secondary[100]};
  margin-right: ${({isMobile}) => (isMobile ? '0' : '20px')};
`;

export const AppBarRoot = styled(AppBar)`
  background-color: ${({ theme }) => theme.palette.primary.main};
  opacity: 0.9;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1); // добавлена тень
`;

export const RightContainer = styled('div')`
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: white;
  width: 100%;
`;

export const SocialContainer = styled('div')`
  display: flex;
  gap: 10px;
`;

export const SocialButton = styled(IconButton)`
  transition: transform 0.3s ease-in-out;

  &:hover {
    transform: scale(1.1); // анимация при наведении
  }
`;
