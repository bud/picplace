import { Breadcrumbs, Button, CircularProgress, Divider, IconButton, Link, Stack, Typography } from '@mui/joy';
import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import QuizItem from '../util/QuizItem';
import { AddRounded, ChevronRightRounded, HomeRounded } from '@mui/icons-material';
import { useAuth } from '../util/UserContext';
import RestrictedPage from './RestrictedPage';
import useFetchye from '../util/useFetchye';
import { useWindowSize } from '@uidotdev/usehooks';

function MyQuizzesPage() {
  const [user, promptLogin] = useAuth();
  const navigate = useNavigate();
  const { error, loading, data } = useFetchye(`/api/quiz?data=all&user=${user?.id}`, {}, [user?.id]);
  const { width } = useWindowSize();

  const handleAddQuiz = React.useCallback(async () => {
    if (user == null) return;
    const response = await fetch("/api/quiz", { method: "POST" });
    if (!response.ok) return alert(await response.text());
    const { id } = await response.json();
    navigate(`/quiz/${id}/edit`);
  }, [navigate, user]);

  let inner = null;

  if (loading) {
    inner = <CircularProgress />;
  } else if (error) {
    inner = <Typography>Error: {error.message}</Typography>
  } else if (data.length === 0) {
    inner = <Typography>No results found.</Typography>;
  } else {
    inner = data.map(e => <QuizItem {...e} Id={e.id} key={e} />);
  }

  React.useEffect(() => {
    if (user !== null) return;
    promptLogin();
  }, [user, promptLogin]);

  if (user == null) {
    return <RestrictedPage />;
  }

  return (
    <Stack alignItems="center" overflow="scroll" boxSizing="border-box" width={1} height={1}>
      <Stack maxWidth={1024} gap={4} p={2} overflow="scroll" boxSizing="border-box" width={1} height={1}>
        <Stack gap={2}>
          <Breadcrumbs separator={<ChevronRightRounded fontSize="xs" />} sx={{ p: 0 }}>
            <Link underline='none' component={RouterLink} to="/" color='neutral'>
              <HomeRounded />
            </Link>
            <Link component={RouterLink} to="/me" color='neutral'>
              <Typography fontSize="sm">Me</Typography>
            </Link>
            <Typography fontSize="sm" color="primary" variant="solid">&nbsp;My Quizzes&nbsp;</Typography>
          </Breadcrumbs>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography level="h1">My Quizzes</Typography>
            { width > 500 ? (
              <Button startDecorator={<AddRounded />} onClick={handleAddQuiz}>Add Quiz</Button>
            ) : (
              <IconButton color="primary" variant="solid" onClick={handleAddQuiz}><AddRounded /></IconButton>
            )}
          </Stack>
        </Stack>
      </Stack>
      <Divider orientation='horizontal' inset='context' />
      <Stack maxWidth={1024} gap={4} p={2} width={1} overflow="scroll" boxSizing="border-box" height={1}>
        {inner}
      </Stack>
    </Stack>
  );
}

export default React.memo(MyQuizzesPage);