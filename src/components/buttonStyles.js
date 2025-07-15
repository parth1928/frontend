import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';

export const BlueButton = styled(Button)(({ theme }) => ({
    color: theme.palette.getContrastText('#1976d2'),
    backgroundColor: '#1976d2',
    '&:hover': {
        backgroundColor: '#1565c0',
    },
    textTransform: 'none',
    fontWeight: 500,
    boxShadow: 'none',
    borderRadius: '8px',
    padding: '8px 16px',
}));

export const PurpleButton = styled(Button)(({ theme }) => ({
    color: theme.palette.getContrastText('#7f56da'),
    backgroundColor: '#7f56da',
    '&:hover': {
        backgroundColor: '#6544ae',
    },
    textTransform: 'none',
    fontWeight: 500,
    boxShadow: 'none',
    borderRadius: '8px',
    padding: '8px 16px',
}));

export const RedButton = styled(Button)(({ theme }) => ({
    color: theme.palette.getContrastText('#ff1744'),
    backgroundColor: '#ff1744',
    '&:hover': {
        backgroundColor: '#d50000',
    },
    textTransform: 'none',
    fontWeight: 500,
    boxShadow: 'none',
    borderRadius: '8px',
    padding: '8px 16px',
}));

export const GreenButton = styled(Button)({
    backgroundColor: '#4CAF50',
    color: '#fff',
    '&:hover': {
        backgroundColor: '#43A047',
    },
    textTransform: 'none',
    fontWeight: 500,
    boxShadow: 'none',
    borderRadius: '8px',
    padding: '8px 16px',
});

export const BlackButton = styled(Button)(({ theme }) => ({
    color: theme.palette.getContrastText('#000000'),
    backgroundColor: '#000000',
    '&:hover': {
        backgroundColor: '#2C2C2C',
    },
    textTransform: 'none',
    fontWeight: 500,
    boxShadow: 'none',
    borderRadius: '8px',
    padding: '8px 16px',
}));

export const LightPurpleButton = styled(Button)({
    backgroundColor: '#7f56da',
    color: '#fff',
    '&:hover': {
        backgroundColor: '#6e48c0',
    },
    textTransform: 'none',
    fontWeight: 500,
    boxShadow: 'none',
    borderRadius: '8px',
    padding: '10px 20px',
    fontSize: '16px',
});
