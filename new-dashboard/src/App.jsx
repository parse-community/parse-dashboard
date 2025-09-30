import { useEffect, useState } from 'react';
import { CssBaseline, AppBar, Toolbar, Typography, Drawer, List, ListItem, ListItemText, Box, Button } from '@mui/material';
import CloudConfig from './CloudConfig.jsx';

export default function App() {
  const [app, setApp] = useState(null);
  const basePath = window.PARSE_DASHBOARD_PATH || '/';

  useEffect(() => {
    fetch(basePath + 'parse-dashboard-config.json').then(r => r.json()).then(data => {
      if (data.apps && data.apps.length) {
        setApp(data.apps[0]);
      }
    });
  }, []);

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed">
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h6" component="div">New Dashboard</Typography>
          <Box>
            <Button color="inherit" href={basePath}>Classic Dashboard</Button>
            <Button color="inherit" href={basePath + 'logout'}>Logout</Button>
          </Box>
        </Toolbar>
      </AppBar>
      <Drawer variant="permanent" sx={{ width: 200, [`& .MuiDrawer-paper`]: { width: 200, boxSizing: 'border-box', mt: 8 } }}>
        <Toolbar />
        <List>
          <ListItem button selected>
            <ListItemText primary="Cloud Config" />
          </ListItem>
        </List>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
        <CloudConfig app={app} />
      </Box>
    </Box>
  );
}
