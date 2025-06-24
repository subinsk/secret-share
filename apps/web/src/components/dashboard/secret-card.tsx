import { FC } from "react"
import { Card, CardActions, CardContent, Chip, IconButton, Stack, Typography, Box, Button, Tooltip } from "@mui/material";
import { motion } from "framer-motion";
import {
    Security as SecurityIcon,
    CopyAll as CopyIcon,
    Delete as DeleteIcon,
    AccessTime as TimeIcon,
    LockOutlined as LockIcon,
    Visibility as OneTimeIcon
} from '@mui/icons-material';
import { formatDistanceToNow } from "date-fns";
import { Secret } from "@/types";

export const SecretCard: FC<{
    secret: { id: string; secretText: string; status: string; expiresAt: string | null; createdAt: string; isViewed: boolean; hasPassword: boolean; oneTimeAccess?: boolean; } | Secret;
    index: number;
    handleDeleteSecret: (id: string) => void;
    copyToClipboard: (text: string) => void;

}> = ({
    secret,
    index,
    handleDeleteSecret,
    copyToClipboard
}) => {
        const getStatusColor = (status: string): 'error' | 'warning' | 'success' | 'default' => {
            switch (status) {
                case 'viewed': return 'error';
                case 'expired': return 'warning';
                case 'active': return 'success';
                default: return 'default';
            }
        };

        const getStatusText = (status: string, expiresAt: string | Date | null): string => {
            switch (status) {
                case 'viewed': return 'Already viewed';
                case 'expired': return 'Expired';
                case 'active':
                    if (!expiresAt) return 'No expiration';
                    return `Expires ${formatDistanceToNow(new Date(expiresAt), { addSuffix: true })}`;
                default: return 'Unknown';
            }
        };

        return (
            <motion.div
                key={secret.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
            >
                <Card
                    elevation={0}
                    sx={{
                        width: 320,
                        border: '1px solid #e2e8f0',
                        borderRadius: 3,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                        },
                    }}
                >
                    <CardContent sx={{ pb: 1 }}>
                        <Stack spacing={2}>
                            <Box display="flex" alignItems="center" gap={1}>
                                <SecurityIcon color="primary" />
                                <Typography variant="h6" fontWeight={600} noWrap>
                                    Secret #{secret.id.slice(0, 8)}
                                </Typography>
                            </Box>
                            <Tooltip title={secret.secretText} arrow placement="left-end">
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                    }}
                                >
                                    {secret.secretText.length > 40
                                        ? `${secret.secretText.substring(0, 40)}...`
                                        : secret.secretText}
                                </Typography>
                            </Tooltip>

                            <Box display="flex" gap={1} flexWrap="wrap">
                                <Chip
                                    size="small"
                                    icon={<TimeIcon />}
                                    label={getStatusText(secret.status, secret.expiresAt)}
                                    color={getStatusColor(secret.status)}
                                    variant="outlined"
                                />                                {secret.hasPassword && (
                                    <Tooltip title="This secret is password protected" arrow>
                                    <Chip
                                        size="small"
                                        icon={<LockIcon />}
                                        label=""
                                        variant="outlined"
                                        sx={{ 
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: 24,
                                            height: 24,
                                            minWidth: 24,
                                            borderRadius: '50%',
                                            '& .MuiChip-icon': {
                                                margin: 0,
                                                fontSize: '1rem',
                                            },
                                            '& .MuiChip-label': {
                                                display: 'none',
                                            }
                                        }}
                                    />
                                    </Tooltip>
                                )}
                                {secret.oneTimeAccess !== false && (
                                    <Tooltip title="One-time access only" arrow>
                                    <Chip
                                        size="small"
                                        icon={<OneTimeIcon />}
                                        label=""
                                        variant="outlined"
                                        sx={{ 
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: 24,
                                            height: 24,
                                            minWidth: 24,
                                            borderRadius: '50%',
                                            '& .MuiChip-icon': {
                                                margin: 0,
                                                fontSize: '1rem',
                                            },
                                            '& .MuiChip-label': {
                                                display: 'none',
                                            }
                                        }}
                                    />
                                    </Tooltip>
                                )}
                            </Box>

                            <Typography variant="caption" color="text.secondary">
                                Created {formatDistanceToNow(new Date(secret.createdAt), { addSuffix: true })}
                            </Typography>
                        </Stack>
                    </CardContent>

                    <CardActions sx={{ px: 2, pb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Button
                            size="small"
                            variant='outlined'
                            startIcon={<CopyIcon />}                            onClick={() =>
                                copyToClipboard(`${process.env.NEXT_PUBLIC_BASE_URL}/secret/${secret.id}`)
                            }
                        >
                            Copy Link
                        </Button>
                        <Tooltip title="Delete Secret" arrow>
                            <IconButton
                                color="error"
                                onClick={() => handleDeleteSecret(secret.id)}
                                sx={{ ml: 'auto' }}
                            >
                                <DeleteIcon />
                            </IconButton>
                        </Tooltip>
                    </CardActions>
                </Card>
            </motion.div>
        )
    }