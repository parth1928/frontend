import React from 'react';
import { useSelector } from 'react-redux';
import {
    Box,
    Paper,
    Typography,
    List,
    ListItem,
    ListItemText,
    Divider,
} from '@mui/material';

const CoordinatorProfile = () => {
    const { currentUser } = useSelector((state) => state.user);

    return (
        <Box sx={{ p: 3 }}>
            <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
                <Typography variant="h5" gutterBottom>
                    Coordinator Profile
                </Typography>
                <Divider sx={{ my: 2 }} />
                <List>
                    <ListItem>
                        <ListItemText
                            primary="Name"
                            secondary={currentUser?.name}
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemText
                            primary="Email"
                            secondary={currentUser?.email}
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemText
                            primary="Assigned Class"
                            secondary={currentUser?.assignedClass?.sclassName}
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemText
                            primary="School"
                            secondary={currentUser?.school?.schoolName}
                        />
                    </ListItem>
                </List>
            </Paper>
        </Box>
    );
};

export default CoordinatorProfile;
