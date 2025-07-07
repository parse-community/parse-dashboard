import { useState, useEffect } from 'react';
import Parse from 'parse';
import { Box, Button, TextField, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';

export default function CloudConfig({ app }) {
  const [params, setParams] = useState({});
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');

  useEffect(() => {
    if (!app) return;
    Parse.serverURL = app.serverURL;
    Parse.initialize(app.appId, app.javascriptKey || '', app.masterKey);
    Parse._request('GET', 'config', {}, { useMasterKey: true })
      .then(res => setParams(res.params || {}));
  }, [app]);

  const saveParam = () => {
    if (!key) return;
    Parse._request('PUT', 'config', { params: { [key]: value } }, { useMasterKey: true })
      .then(() => {
        setParams(prev => ({ ...prev, [key]: value }));
        setKey('');
        setValue('');
      });
  };

  return (
    <Box p={2}>
      <Box display="flex" gap={1} mb={2}>
        <TextField label="Key" value={key} onChange={e => setKey(e.target.value)} />
        <TextField label="Value" value={value} onChange={e => setValue(e.target.value)} />
        <Button variant="contained" onClick={saveParam}>Save</Button>
      </Box>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Key</TableCell>
            <TableCell>Value</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Object.entries(params).map(([k, v]) => (
            <TableRow key={k}>
              <TableCell>{k}</TableCell>
              <TableCell>{String(v)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}
