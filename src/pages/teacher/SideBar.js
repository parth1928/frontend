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
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ClassIcon from '@mui/icons-material/Class';
import SubjectIcon from '@mui/icons-material/Subject';

const drawerWidth = 240;

const TeacherSideBar = () => {
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
                <ListItemButton component={Link} to="/Teacher/dashboard">
                    <ListItemIcon>
                        <HomeIcon color={location.pathname === "/Teacher/dashboard" ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Dashboard" />
                </ListItemButton>
                <ListItemButton component={Link} to="/Teacher/class">
                    <ListItemIcon>
                        <ClassIcon color={location.pathname.startsWith("/Teacher/class") ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Class" />
                </ListItemButton>
                <ListItemButton component={Link} to="/Teacher/students">
                    <ListItemIcon>
                        <PersonOutlineIcon color={location.pathname.startsWith("/Teacher/students") ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Students" />
                </ListItemButton>
                <ListItemButton component={Link} to="/Teacher/subjects">
                    <ListItemIcon>
                        <SubjectIcon color={location.pathname.startsWith("/Teacher/subjects") ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Subjects" />
                </ListItemButton>
                <ListItemButton component={Link} to="/Teacher/analysis">
                    <ListItemIcon>
                        <AssessmentIcon color={location.pathname.startsWith("/Teacher/analysis") ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Analysis" />
                </ListItemButton>
            </List>
            <Divider />
            <List>
                <ListSubheader component="div" inset>
                    Account
                </ListSubheader>
                <ListItemButton component={Link} to="/Teacher/profile">
                    <ListItemIcon>
                        <AccountCircleOutlinedIcon color={location.pathname.startsWith("/Teacher/profile") ? 'primary' : 'inherit'} />
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

export default TeacherSideBar;