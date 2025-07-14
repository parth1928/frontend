import React from 'react';
import {
    Box,
    Drawer,
    Toolbar,
    List,
    Divider,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    ListSubheader,
    IconButton,
} from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import AssessmentIcon from '@mui/icons-material/Assessment';
import DownloadIcon from '@mui/icons-material/Download';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';

const drawerWidth = 240;

const CoordinatorSideBar = () => {
    const location = useLocation();
    const [open, setOpen] = React.useState(true);

    const toggleDrawer = () => {
        setOpen(!open);
    };

    return (
        <Drawer
            variant="permanent"
            open={open}
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: drawerWidth,
                    boxSizing: 'border-box',
                    ...(!open && {
                        width: theme => theme.spacing(7),
                        overflowX: 'hidden',
                    }),
                },
            }}
        >
            <Toolbar
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    px: [1],
                }}
            >
                <IconButton onClick={toggleDrawer}>
                    {open ? <ChevronLeftIcon /> : <MenuIcon />}
                </IconButton>
            </Toolbar>
            <Divider />
            <List>
                <ListItemButton component={Link} to="/Coordinator/dashboard">
                    <ListItemIcon>
                        <HomeIcon color={location.pathname === "/Coordinator/dashboard" ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Dashboard" />
                </ListItemButton>
                <ListItemButton component={Link} to="/Coordinator/students">
                    <ListItemIcon>
                        <PersonOutlineIcon color={location.pathname.startsWith("/Coordinator/students") ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Students" />
                </ListItemButton>
                <ListItemButton component={Link} to="/Coordinator/attendance">
                    <ListItemIcon>
                        <AssessmentIcon color={location.pathname.startsWith("/Coordinator/attendance") ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Attendance Analysis" />
                </ListItemButton>
                <ListItemButton component={Link} to="/Coordinator/reports">
                    <ListItemIcon>
                        <DownloadIcon color={location.pathname.startsWith("/Coordinator/reports") ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Download Reports" />
                </ListItemButton>
            </List>
            <Divider />
            <List>
                <ListSubheader component="div" inset>
                    Account
                </ListSubheader>
                <ListItemButton component={Link} to="/Coordinator/profile">
                    <ListItemIcon>
                        <AccountCircleOutlinedIcon color={location.pathname.startsWith("/Coordinator/profile") ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Profile" />
                </ListItemButton>
                <ListItemButton component={Link} to="/logout">
                    <ListItemIcon>
                        <ExitToAppIcon />
                    </ListItemIcon>
                    <ListItemText primary="Logout" />
                </ListItemButton>
            </List>
        </Drawer>
    );
};

export default CoordinatorSideBar;
