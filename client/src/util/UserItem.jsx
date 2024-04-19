import { FolderRounded, GroupAddRounded, ShieldRounded } from '@mui/icons-material';
import { Avatar, Card, CardContent, CardOverflow, Divider, Stack, Typography } from '@mui/joy';
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';

const NUMBER_FORM = Intl.NumberFormat('en', { notation: 'compact' });

function UserItem({
  Id: id, username, profile, description, admin, totalFollowers = 0,
  totalQuizzes = 0,
}) {
  return (
    <RouterLink to={`/user/${id}`} style={{ textDecoration: "none", flex: 1, minWidth: 200, maxWidth: 500 }}>
      <Card variant="outlined">
        <Stack direction="row" gap={3}>
        <Avatar src={profile} size="lg"/>
        <Stack gap={1}>
          <Typography level='h4' component="pre">{username}&nbsp;</Typography>
          <Typography level="body-sm" sx={{ display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{description}&nbsp;</Typography>
        </Stack>
        </Stack>
        <CardOverflow>
          <CardContent orientation="horizontal">
            <Typography component="pre" flexShrink={1} startDecorator={<GroupAddRounded color="action" fontSize="small" />} level="body-xs" ml={0.5}>{NUMBER_FORM.format(totalFollowers)}</Typography>
            <Divider orientation="vertical" />
            <Typography component="pre" flexShrink={1} startDecorator={<FolderRounded color="action" fontSize="small" />} level="body-xs" ml={0.5}>{NUMBER_FORM.format(totalQuizzes)}</Typography>
            {admin &&
              <>
                <Divider orientation="vertical" />
                <Typography component="pre" startDecorator={<ShieldRounded color="action" fontSize="small" />} level="body-xs"></Typography>
              </>
            }
          </CardContent>
        </CardOverflow>
      </Card>
    </RouterLink>
  );
}

export default React.memo(UserItem);