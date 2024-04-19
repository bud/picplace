import { FlagRounded, LinkRounded } from '@mui/icons-material';
import { Avatar, Button, Card, CardContent, CardOverflow, CircularProgress, Divider, IconButton, Sheet, Stack, Typography } from '@mui/joy';
import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import useFetchye from './useFetchye';
import moment from 'moment';

function ReportItem({
  Id: id, type, item, reason, reporter, created
}) {
  const navigate = useNavigate();
  const [discarded, setDiscarded] = React.useState(false);
  const {
    loading: user_loading,
    data: user_data,
  } = useFetchye(`/api/user/${reporter}`, {}, [reporter]);

  const { profile, username } = user_data ?? {};

  const handleDiscard = React.useCallback(() => {
    fetch(`/api/report/${id}`, { method: 'DELETE' });
    setDiscarded(true);
  }, [id]);

  const handleDelete = React.useCallback(() => {
     fetch(`/api/${type}/${item}`, { method: 'DELETE' });
    handleDiscard();
  }, [handleDiscard, type, item]);

  if (discarded) {
    return null;
  }

  if (user_loading) {
    return <CircularProgress />;
  }

  return (
    <Card variant="outlined" sx={{ width: 1 }}>
      <Stack direction="column" gap={2}>
        <Sheet variant='soft' color='primary' sx={{ p: 2, borderRadius: 8, display: 'flex', gap: 2, flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: "center" }}>
            <div>Report on {type}</div>
            <IconButton color='primary' variant='outlined' onClick={() => navigate(`/${type}/${item}`)}><LinkRounded/></IconButton>
          </div>
          <Typography level='h4' component="pre">{item}</Typography>
        </Sheet>
        <Typography level="body-sm">{reason}&nbsp;</Typography>
        <Stack direction="row" width={1} gap={2}>
          <Button fullWidth color='neutral' variant='soft' onClick={handleDiscard}>Discard report</Button>
          <Button fullWidth color='danger' onClick={handleDelete}>Delete {type}</Button>
        </Stack>
      </Stack>
      <CardOverflow>
        <CardContent orientation="horizontal">
          { user_data ? (
            <RouterLink to={`/user/${reporter}`} style={{ textDecoration: 'none' }}>
              <Typography component="pre" flexShrink={1} level="body-xs" display="flex">
                Made by
                <Avatar src={profile} sx={{ mx: 1, width: 20, height: 20 }} />
                {username}
              </Typography>
            </RouterLink>
          ) : (
            <Typography component="pre" flexShrink={1} level="body-xs" display="flex">Unknown Reporter</Typography>
          )}
          <Divider orientation="vertical" />
          <Typography component="pre" flexShrink={1} startDecorator={<FlagRounded color="action" fontSize="small" />} level="body-xs">{moment(created).fromNow()}</Typography>
        </CardContent>
      </CardOverflow>
    </Card>
  );
}

export default React.memo(ReportItem);