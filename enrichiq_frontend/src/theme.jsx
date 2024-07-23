// theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  typography: {
    fontFamily: [
      'poppins',
      'Arial',
      'sans-serif',
    ].join(','),
  },
});

export default theme;
