import { Avatar, Card, CircularProgress, Stack, Typography } from '@mui/joy';
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import useFetchye from './useFetchye';

// const NUMBER_FORM = Intl.NumberFormat('en', { notation: 'compact' });

function InputItem({ type, itemID: id }) {
  const { data, loading } = useFetchye(`/api/${type}/${id}`, {}, [id, type]);

  let inner;

  if (loading) {
    inner = <CircularProgress />
  } else if (type === 'user') {
    inner = <>
      <Avatar alt="User profile." src={data?.profile} size="md" />
      <Stack width={1} overflow="hidden">
        <Typography width={1} fontWeight="lg" component="pre" level="body-md" overflow="hidden" whiteSpace="nowrap" textOverflow="ellipsis">@{data?.username}</Typography>
        <Typography width={1} level="body-xs" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">{data?.description}</Typography>
      </Stack>
    </>
  }

  return (
    <RouterLink to={`/${type}/${id}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
      <Card sx={{ borderRadius: 8, p: 1 }}>
        <Stack direction="row" alignItems="center" justifyContent="center" gap={2} width={1}>
          {inner}
        </Stack>
      </Card>
    </RouterLink>
  );
}

export default React.memo(InputItem);