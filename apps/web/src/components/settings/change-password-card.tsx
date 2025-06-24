import { Box, Button, Card, CardActions, CardContent, Typography } from "@mui/material";
import { LockReset as LockResetIcon } from "@mui/icons-material";
import { useRouter } from "next/navigation";

export function ChangePasswordCard() {
    const router = useRouter();
    return (
        <Card
            elevation={0}
            sx={{
                border: '1px solid #e2e8f0',
                borderRadius: 3,
            }}
        >
            <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                    <LockResetIcon fontSize="large" sx={{ color: 'primary.main' }} />
                    <Box>
                        <Typography variant="h6" fontWeight={600}>
                            Security
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Manage your account security settings
                        </Typography>
                    </Box>
                </Box>
            </CardContent>
            <CardActions sx={{ px: 3, pb: 3 }}>
                <Button
                    variant="outlined"
                    startIcon={<LockResetIcon />}
                    onClick={() => router.push('/dashboard/settings/change-password')}
                >
                    Change Password
                </Button>
            </CardActions>
        </Card>
    )
}