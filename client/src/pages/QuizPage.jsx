import { AspectRatio, Avatar, Breadcrumbs, Button, Card, CardContent, CardOverflow, Chip, Divider, Dropdown, IconButton, Link, ListDivider, ListItemDecorator, Menu, MenuButton, MenuItem, Stack, Typography } from '@mui/joy';
import React from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import NotFoundPage from './NotFoundPage';
import LoadingPage from './LoadingPage';
import moment from 'moment';
import { AttachFileRounded, ChevronRightRounded, CommentRounded, EditRounded, FavoriteRounded, FlagRounded, HomeRounded, HourglassBottomRounded, LeaderboardRounded, MoreVertRounded, PlayArrowRounded, PublicOffRounded, PublicRounded, QuestionMarkRounded } from '@mui/icons-material';
import { useAuth } from '../util/UserContext';
import useFetchye from '../util/useFetchye';
import { useWindowSize } from '@uidotdev/usehooks';
import { useReport } from '../util/ReportContext';

const NUMBER_FORM = Intl.NumberFormat('en', { notation: 'compact' });

function elipse(text, length) {
  if (text.length > length) {
    return text.slice(0, length) + '...';
  } else {
    return text;
  }
} 

function QuizPage() {
  const navigate = useNavigate();
  const [user, promptLogin] = useAuth();
  const promptReport = useReport();
  const { id } = useParams();
  const { width } = useWindowSize();

  const [counter, setCounter] = React.useState(0);

  const {
    error: quiz_error,
    loading: quiz_loading,
    response: quiz_response,
    data: quiz_data
  } = useFetchye(`/api/quiz/${id}`, {}, [id, user, counter]);

  const { data: user_data = {} } = useFetchye(`/api/user/${quiz_data?.user}`, {

  }, [quiz_data?.user, user]);

  let {
    name, thumbnail, description, created, timelimit, comments,
    totalQuestions, public: Public, totalLikes, plays, liked
  } = quiz_data ?? {};

  const handleLike = React.useCallback(async () => {
    const type = liked ? "remove" : "add";
    if (user == null) {
      promptLogin();
    } else {
      const response = await fetch("/api/me/likes", {
        headers: { "Content-Type": "application/json" },
        method: "PUT",
        body: JSON.stringify({ [type]: [id] }),
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
  }, [user, promptLogin, id, liked])

  const handlePlay = React.useCallback(async () =>{
    if (user == null) return promptLogin();
    const response = await fetch("/api/play", {
      headers: { "Content-Type": "application/json" },
      method: "POST",
      body: JSON.stringify({ quiz: id }),
    });

    if (!response.ok) {
      try {
        return alert(await response.text());
      } catch (err) {
        return alert("Internal error.");
      }
    }

    const { id: playID } = await response.json();

    navigate(`/play/${playID}/edit`);
  }, [user, promptLogin, navigate, id]);

  if (quiz_loading) {
    return <LoadingPage />;
  } else if (quiz_response.status === 404) {
    return <NotFoundPage />;
  } else if (!quiz_response.ok) {
    return <LoadingPage error={quiz_error} />;
  }

  name ??= "<Unnamed>";
  description ??= "--";
  comments ??= 0;
  totalQuestions ??= 0;
  totalLikes ??= 0;
  plays ??= 0;
  created ??= "-1";

  const Visibleicon = Public ? PublicRounded : PublicOffRounded;

  const more = (
    <Dropdown>
      <MenuButton
        slots={{ root: IconButton }}
        slotProps={{ root: { variant: 'outlined', color: 'neutral' } }}>
        <MoreVertRounded />
      </MenuButton>
      <Menu placement="bottom">
        <MenuItem variant="plain" onClick={() => navigate(`edit`)}>
          <ListItemDecorator>
            <EditRounded />
          </ListItemDecorator>
          Edit
        </MenuItem>
        <ListDivider />
        <MenuItem variant="plain" color="danger" onClick={() => promptReport("quiz", id)}>
          <ListItemDecorator>
            <FlagRounded />
          </ListItemDecorator>
          Report Quiz
        </MenuItem>
      </Menu>
    </Dropdown>
  );

  return (
    <Stack alignItems="center" overflow="scroll" boxSizing="border-box" width={1}>
      <Stack maxWidth={1024} gap={4} p={2} overflow="scroll" boxSizing="border-box" width={1}>
        <Breadcrumbs separator={<ChevronRightRounded fontSize="xs" />} sx={{ p: 0 }}>
          <Link underline='none' component={RouterLink} to="/" color='neutral'>
            <HomeRounded />
          </Link>
          <Link to="/explore?type=quiz" color='neutral' underline='none' component={RouterLink} fontSize="sm">Quizzes</Link>
          <Typography fontSize="sm" color="primary" variant="solid">&nbsp;{elipse(name, 10)}&nbsp;</Typography>
        </Breadcrumbs>

      <Card variant="outlined" sx={{ borderRadius: 16 }}>
        <CardContent orientation="horizontal" sx={{ alignItems: 'center', gap: 2 }}>
          <Link underline="none" component={RouterLink} to={`/user/${user_data?.id}` ?? "#"} sx={{ mr: "auto" }}>
            <Stack direction="row" alignItems="center" gap={2} maxWidth={1}>
              <Avatar alt="?" src={user_data?.profile} size="md" />
              { width > 500 && (
                <Stack width={1}>
                  <Typography width={1} fontWeight="lg" level="body-md" sx={{ display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden", height: '1lh' }}>{user_data?.username ?? "Unknown user"}</Typography>
                  <Typography width={1} level="body-xs" component="pre" sx={{ display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden", height: '1lh' }}>{user_data?.description ?? "--"}</Typography>
                </Stack>
              )}
            </Stack>
          </Link>
          {more}
          <Button color="danger" startDecorator={<FavoriteRounded />} variant={liked ? 'solid' : 'outlined'} onClick={handleLike}>
            {totalLikes}
          </Button>
          {width > 500 ? (
            <Button startDecorator={<PlayArrowRounded />} variant='solid' onClick={handlePlay}>Play</Button>
          ) : (
            <IconButton color='primary' variant='solid' onClick={handlePlay}><PlayArrowRounded /></IconButton>
          )}
        </CardContent>
        {(thumbnail?.length ?? 0) > 0 &&
          <CardOverflow>
            <AspectRatio sx={{ borderRadius: 0 }}>
              <img src={thumbnail} loading="lazy" alt={name} height={200} style={{ objectFit: "cover" }} />
            </AspectRatio>
          </CardOverflow>
        }
        <Stack my={2} gap={2}>
          <Stack direction="row" gap={2} width={1}>
            <Typography width={1} level='h1'>{name}</Typography>
          </Stack>
          {timelimit &&
              <Chip sx={{ p: 0.5, px: 2 }} variant="soft" color="warning" startDecorator={<HourglassBottomRounded color="warning" fontSize="small" />}>
                {timelimit} second{timelimit !== 1 && "s"}
              </Chip>
            }
            <Chip sx={{ p: 0.5, px: 2 }} variant="soft" color="success" startDecorator={<QuestionMarkRounded color="success" fontSize="small" />}>
              {totalQuestions} question{totalQuestions !== 1 && "s"}
            </Chip>
          <Typography leve="body-sm">{description}</Typography>
        </Stack>
        <CardOverflow variant="soft">
          <Divider inset="context" />
          <CardContent orientation="horizontal">
            <Chip startDecorator={<LeaderboardRounded color="action" fontSize="small" />} sx={{ p: 0 }}>
              <Typography level="body-xs" ml={0.5}>{NUMBER_FORM.format(plays)} {width > 500 && `play${plays !== 1 && "s"}`}</Typography>
            </Chip>
            <Divider orientation="vertical" />
            <Chip startDecorator={<CommentRounded color="action" fontSize="small" />} sx={{ p: 0 }}>
              <Typography level="body-xs" ml={0.5}>{comments} {width > 500 && `comment${comments !== 1 && "s"}`}</Typography>
            </Chip>
            <Divider orientation="vertical" />
            <Chip startDecorator={<AttachFileRounded color="action" fontSize="small" />} sx={{ p: 0 }}>
              <Typography level="body-xs" ml={0.5}>{width > 500 ? `Created ${moment(created).fromNow()}` : moment(created).format('MM/DD/YY') }</Typography>
            </Chip>
            <Divider orientation="vertical" />
            <Chip startDecorator={<Visibleicon color="action" fontSize="small" />} sx={{ p: 0 }}>
              <Typography level="body-xs" ml={0.5}>{width > 500 && (Public ? "Public" : "Private")}</Typography>
            </Chip>
          </CardContent>
        </CardOverflow>
      </Card>

    </Stack>
    </Stack>
  );
}

export default React.memo(QuizPage);