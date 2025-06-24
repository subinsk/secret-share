import { Box, InputAdornment, TextField, IconButton as MuiIconButton, Button } from "@mui/material";
import { FC } from "react";
import { Search as SearchIcon, Clear as ClearIcon } from "@mui/icons-material";

export const SearchBar: FC<{
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    handleSearch: () => void;
    handleClearSearch: () => void;
}> = ({
    searchQuery,
    setSearchQuery,
    handleSearch,
    handleClearSearch
}) => {
        return (
            <Box display="flex" alignItems="center" gap={1} mb={2} maxWidth={400} mx="auto">
                <TextField
                    size="small"
                    fullWidth
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    slotProps={{
                        input:
                        {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon color="action" fontSize="small" />
                                </InputAdornment>
                            ),
                            endAdornment: searchQuery && (
                                <InputAdornment position="end">
                                    <MuiIconButton onClick={handleClearSearch} size="small">
                                        <ClearIcon fontSize="small" />
                                    </MuiIconButton>
                                </InputAdornment>
                            )
                        }
                    }}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 1.5,
                            fontSize: '0.95rem',
                            height: 36,
                            background: '#fff',
                        },
                    }}
                />
                <Button
                    size="small"
                    variant="contained"
                    sx={{ minWidth: 36, px: 1.5, height: 36, borderRadius: 1.5 }}
                    onClick={handleSearch}
                    disabled={!searchQuery.trim()}
                >
                    <SearchIcon fontSize="small" />
                </Button>
            </Box>
        )
    }