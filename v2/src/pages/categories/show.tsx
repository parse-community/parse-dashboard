import { Stack, Typography } from '@mui/material'
import { useShow } from '@refinedev/core';
import { NumberField, Show, TextFieldComponent as TextField } from '@refinedev/mui';

export const CategoryShow = () => {
  const { queryResult } = useShow({});
  const { data, isLoading } = queryResult;

  const record = data?.data;

  return (
    <Show isLoading={isLoading}>
      <Stack gap={1}>
        <Typography variant="body1" fontWeight="bold">
          {'ID'}
        </Typography>
        <NumberField value={record?.id ?? ''} />
        <Typography variant="body1" fontWeight="bold">
          {'Title'}
        </Typography>
        <TextField value={record?.title} />
      </Stack>
    </Show>
  );
};
