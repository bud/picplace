import React from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import { Typography, Avatar, Stack, Card, Breadcrumbs, Link, CardContent, Button, ListItemDecorator, MenuItem, Menu, IconButton, MenuButton, Dropdown, ListDivider, CardOverflow, Divider } from '@mui/joy';
import LoadingPage from './LoadingPage';
import NotFoundPage from './NotFoundPage';
import useFetchye from '../util/useFetchye';
import { ChevronRightRounded, EditRounded, FavoriteRounded, FlagRounded, FolderRounded, GroupAddRounded, HomeRounded, MoreVertRounded, ShieldRounded, ThumbUpRounded } from '@mui/icons-material';
import { useWindowSize } from '@uidotdev/usehooks';
import moment from 'moment';
import { useAuth } from '../util/UserContext';
import { useReport } from '../util/ReportContext';

const NUMBER_FORM = Intl.NumberFormat('en', { notation: 'compact' });

const UserPage = () => {
  const { width } = useWindowSize();
  const promptReport = useReport();
  const [user, promptLogin] = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [counter, setCounter] = React.useState(0);

  const {
    error,
    loading,
    response,
    data,
  } = useFetchye(`/api/user/${id}`, {}, [counter]);

  const handleLike = React.useCallback(async () => {
    const type = data?.followed ? "remove" : "add";
    if (user == null) {
      promptLogin();
    } else {
      const response = await fetch("/api/me/follows", {
        headers: { "Content-Type": "application/json" },
        method: "PUT",
        body: JSON.stringify({ [type]: [data?.id] }),
      });

      if (!response.ok) {
        try {
          return alert(await response.text());
        } catch (err) {
          return alert("Internal error.");
        }
      }

      setCounter(c => c + 1);
    }
  }, [user, promptLogin, data?.id, data?.followed])

  if (loading) {
    return <LoadingPage />;
  } else if (response.status === 404) {
    return <NotFoundPage />;
  } else if (!response.ok) {
    return <LoadingPage error={error} />;
  }

  const {
    username = "<Unnamed User>",
    description = "--",
    totalFollowers = 0,
    totalQuizzes = 0,
    totalLikes = 0,
    profile,
    created = new Date(),
    admin = false,
    id: ownerID,
    followed = false
  } = data;

  const more = (
    <Dropdown>
      <MenuButton
        slots={{ root: IconButton }}
        slotProps={{ root: { variant: 'outlined', color: 'neutral' } }}>
        <MoreVertRounded />
      </MenuButton>
      <Menu placement="bottom-end">
        <MenuItem variant="plain" onClick={() => navigate(`edit`)}>
          <ListItemDecorator>
            <EditRounded />
          </ListItemDecorator>
          Edit
        </MenuItem>
        <ListDivider />
        <MenuItem variant="plain" color="danger" onClick={() => promptReport("user", ownerID)}>
          <ListItemDecorator>
            <FlagRounded />
          </ListItemDecorator>
          Report User
        </MenuItem>
      </Menu>
    </Dropdown>
  );
  
  const  desktop = width > 850;

  return (
    <Stack alignItems="center" overflow="scroll" boxSizing="border-box" width={1}>
      <Stack maxWidth={1024} gap={4} p={2} overflow="scroll" boxSizing="border-box" width={1}>
        <Breadcrumbs separator={<ChevronRightRounded fontSize="xs" />} sx={{ p: 0 }}>
          <Link underline='none' component={RouterLink} to="/" color='neutral'>
            <HomeRounded />
          </Link>
          <Link to="/explore?type=user" color='neutral' underline='none' component={RouterLink} fontSize="sm">Users</Link>
          <Typography fontSize="sm" color="primary" variant="solid">&nbsp;@{username}&nbsp;</Typography>
        </Breadcrumbs>
        <Card variant='outlined'>
          <CardContent orientation="vertical" sx={{ gap: 2 }}>
            { desktop ? (
              <Stack direction="row" gap={6} sx={{ p: 2 }}>
                <Avatar src={profile} sx={{ width: 200, height: 200, borderRadius: 16 }} />
                <Stack gap={4} width={1}>
                  <Stack direction="row" alignItems="flex-start" gap={2}>
                    <Stack gap={0.5}>
                      <Typography level='h2' component="pre" overflow="hidden" whiteSpace="nowrap" textOverflow="ellipsis">@{username}</Typography>
                      <Typography level='body-sm' component="pre" fontStyle="italic" color="neutral">Joined {moment(created).fromNow()}</Typography>
                    </Stack>
                    <div style={{ flex: 1 }} />
                    <Button color="danger" startDecorator={<FavoriteRounded />} variant={followed ? 'solid' : 'outlined'} onClick={handleLike}>{totalFollowers}</Button>
                    { (user?.id === ownerID || user?.admin) &&
                      <Button color="neutral" variant='outlined' startDecorator={<EditRounded />} onClick={() => navigate("edit")}>Edit</Button>
                    }
                    {more}
                  </Stack>
                  <Typography sx={{ hyphens: 'auto', textAlign: 'justify' }}>{description}</Typography>
                </Stack>
              </Stack>
            ) : (
              <Stack alignItems="center" gap={3}>
                <Stack direction="row" width={1} gap={1}>
                  <Button color="danger" startDecorator={<FavoriteRounded />} variant={followed ? 'solid' : 'outlined'} onClick={handleLike}>{totalFollowers}</Button>
                  <div style={{ flex: 1 }} />
                  { (user?.id === ownerID || user?.admin) &&
                    <Button color="neutral" variant='outlined' startDecorator={<EditRounded />} onClick={() => navigate("edit")}>Edit</Button>
                  }
                  {more}
                </Stack>
                <Avatar src={profile} sx={{ width: 200, height: 200, borderRadius: 16 }} />
                <Stack gap={0.5} alignItems="center">
                  <Typography level='h2' component="pre">@{username}</Typography>
                  <Typography level='body-sm' component="pre" fontStyle="italic" color="neutral">Joined {moment(created).fromNow()}</Typography>
                </Stack>
                <Typography sx={{ hyphens: 'auto', textAlign: 'justify' }}>{description}</Typography>
              </Stack>
            )}
          </CardContent>
          <CardOverflow>
            <CardContent orientation="horizontal">
              <Typography component="pre" flexShrink={1} startDecorator={<GroupAddRounded color="action" />} ml={0.5}>{NUMBER_FORM.format(totalFollowers)} { desktop && "Follows"}</Typography>
              <Divider orientation="vertical" />
              <Typography component="pre" flexShrink={1} startDecorator={<FolderRounded color="action" />} ml={0.5}>{NUMBER_FORM.format(totalQuizzes)} { desktop && "Quizzes"}</Typography>
              <Divider orientation="vertical" />
              <Typography component="pre" flexShrink={1} startDecorator={<ThumbUpRounded color="action" />} ml={0.5}>{NUMBER_FORM.format(totalLikes)} { desktop && "Likes"}</Typography>
              {admin &&
                <>
                  <Divider orientation="vertical" />
                  <Typography component="pre" startDecorator={<ShieldRounded color="action" />}>{ desktop && "Admin"}</Typography>
                </>
              }
            </CardContent>
          </CardOverflow>
        </Card>
      </Stack>
    </Stack>
  );
};

export default UserPage;
