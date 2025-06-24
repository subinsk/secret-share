import { Box, Card, CardActions, CardContent, Skeleton } from "@mui/material";
import { FC } from "react";

export const LoadingState: FC = () => {
    return (
        <Box display="flex" flexWrap="wrap" gap={3}>
            {[1, 2, 3].map((i) => (
                <Card key={i} sx={{ width: 300 }}>
                    <CardContent>
                        <Skeleton variant="text" width="60%" />
                        <Skeleton variant="text" width="80%" />
                        <Skeleton variant="text" width="40%" />
                    </CardContent>
                    <CardActions>
                        <Skeleton variant="rectangular" width={80} height={36} />
                        <Skeleton variant="rectangular" width={80} height={36} />
                    </CardActions>
                </Card>
            ))}
        </Box>
    )
}