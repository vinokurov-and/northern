import styled from "@emotion/styled";
import { Typography } from "@mui/material";

export const Title = styled(Typography)`
  text-transform: uppercase;
  font-weight: 600;
  color: ${({ theme }) => theme.palette.secondary[100]};
`;
