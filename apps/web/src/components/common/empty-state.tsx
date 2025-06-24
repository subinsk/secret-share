import { Button, Paper, Typography } from "@mui/material"
import { Security as SecurityIcon, Add as AddIcon } from '@mui/icons-material';
import { FC } from "react";

export const EmptyState: FC<
    {
        title: string;
        message: string;
        buttonText: string;
        onButtonClick: () => void;
    }
> = ({
    title,
    message,
    buttonText,
    onButtonClick
}) => {
        return (
            <Paper
                elevation={0}
                sx={{
                    textAlign: 'center',
                    py: 8,
                    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                    border: '2px dashed #cbd5e1',
                    borderRadius: 3,
                }}
            >
                <SecurityIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h5" fontWeight={600} color="text.secondary" mb={1}>
                    {title}
                </Typography>
                <Typography variant="body1" color="text.secondary" mb={3}>
                    {message}
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={onButtonClick}
                    size="large"
                >
                    {buttonText}
                </Button>
            </Paper>
        )
    }