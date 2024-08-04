import { useMediaQuery, useTheme } from "@mui/material";
import { S_0, S_600 } from "../../../breakpoints";

export const useMobile = () => {
    const theme = useTheme();
    const s_0_600 = useMediaQuery(theme.breakpoints.between(S_0, S_600));
    return s_0_600
}