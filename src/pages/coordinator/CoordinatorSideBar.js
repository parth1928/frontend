import React from 'react';
import { ListItemButton, ListItemIcon, ListItemText, ListSubheader, Divider } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import AssessmentIcon from '@mui/icons-material/Assessment';
import DownloadIcon from '@mui/icons-material/Download';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';

const CoordinatorSideBar = () => {
    const location = useLocation();

    return (
        <>
            <React.Fragment>
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
            </React.Fragment>
            <Divider sx={{ my: 1 }} />
            <React.Fragment>
                <ListSubheader component="div" inset>
                    User
                </ListSubheader>
                <ListItemButton component={Link} to="/Coordinator/profile">
                    <ListItemIcon>
                        <AccountCircleOutlinedIcon color={location.pathname.startsWith("/Coordinator/profile") ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Profile" />
                </ListItemButton>
                <ListItemButton component={Link} to="/logout">
                    <ListItemIcon>
                        <ExitToAppIcon color={location.pathname.startsWith("/logout") ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Logout" />
                </ListItemButton>
            </React.Fragment>
        </>
    );
};

export default CoordinatorSideBar;
