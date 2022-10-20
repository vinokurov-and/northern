import styled from "@emotion/styled";
import { AppBar, Typography } from "@mui/material";

export const Title = styled(Typography)`
  text-transform: uppercase;
  font-weight: 600;
  color: ${({ theme }) => theme.palette.secondary[100]};
`;

export const AppBarRoot = styled(AppBar)`
  background-color: ${({ theme }) => theme.palette.primary.main};
  opacity: 0.9;
`;
