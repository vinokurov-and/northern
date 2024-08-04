import { Button, Typography } from '@mui/material';
import React from 'react';
import { useMobile } from '../../../../hooks/adaptive';

export const Tab = ({ onClick, children }) => {
    const isMobile = useMobile();
    return (
        <Button onClick={onClick}>
            <Typography fontSize={isMobile ? 10 : 12} sx={{
                color: '#cfcfcf', padding: 1,
                "&:hover": {
                    color: 'white'
                }
            }}>
                {children}
            </Typography>
        </Button>
    )
}