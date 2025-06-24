import { Box, Button, Typography } from "@mui/material"
import { Add as AddIcon } from "@mui/icons-material"
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { FC } from "react";

export const DashboardHeader: FC = () => {
    const router = useRouter();
    const { data: session } = useSession();

    return (
        <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={4}
            flexWrap="wrap"
            gap={2}
        >
            <Box>
                <Typography variant="h3" fontWeight={700} color="primary.main">
                    Dashboard
                </Typography>
                <Typography variant="body1" color="text.secondary" mt={1}>
                    Welcome back, {session?.user?.name || session?.user?.email}
                </Typography>
            </Box>
            <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => router.push('/create')}
                size="large"
                sx={{ borderRadius: 2 }}
            >
                Create Secret
            </Button>
        </Box>
    );
};