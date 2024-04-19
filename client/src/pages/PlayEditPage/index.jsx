import { ChevronRightRounded, HomeRounded } from '@mui/icons-material';
import { Breadcrumbs, Button, Chip, DialogContent, DialogTitle, Divider, Link, Modal, ModalDialog, Stack, Step, Stepper, Typography } from '@mui/joy';
import React from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import useFetchye from '../../util/useFetchye';
import LoadingPage from '../LoadingPage';
import RestrictedPage from '../RestrictedPage';
import NotFoundPage from '../NotFoundPage';
import QuestionPlay from './QuestionPlay';

function elipse(text, length) {
  if ((text?.length ?? 0) > length) {
    return text.slice(0, length) + '...';
  } else {
    return text;
  }
}

async function urlToObject(image) {
  if (image == null) return undefined;
  const response = await fetch(image);
  // here image is url/location of image
  const blob = await response.blob();
  return new File([blob], 'image.jpg', { type: blob.type });
}

function PlayEditPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [question, setQuestion] = React.useState(0);
  const [guesses, setGuesses] = React.useState([]);
  const [timer, setTimer] = React.useState(null);
  const timerTimeout = React.useRef(null);

  const {
    loading: play_loading,
    response: play_response,
    data: play
  } = useFetchye(`/api/play/${id}`, {}, [id]);

  const {
    loading: quiz_loading,
    response: quiz_response,
    data: quiz
  } = useFetchye(`/api/quiz/${play?.quiz}`, {}, [play?.quiz]);

  React.useEffect(() => {
    const [start, timelimit, current] = [+new Date(play?.start), quiz?.timelimit, +new Date()];
    if (timelimit == null) {
      setTimer(null);
    } else {
      const left = Math.floor(timelimit - (current - start) / 1000);
      setTimer(left);
      clearTimeout(timerTimeout.current);
      timerTimeout.current = setInterval(() => setTimer(t => t - 1), 1000);
    }

  }, [play?.start, quiz?.timelimit])

  const {
    loading: questions_loading,
    response: questions_response,
    data: questions_data
  } = useFetchye(`/api/play/${id}/questions`, {}, [id]);

  const { questions } = questions_data ?? {};
  const submitting = questions?.length === question;
  const { name, description, image } = questions?.[question] ?? {};

  React.useEffect(() => {
    setGuesses(play?.guesses);
  }, [play?.guesses]);

  const handleGuess = React.useCallback(async guess => {
    const next = [...guesses];
    if (guess != null) next[question] = guess;

    let iID = 0;

    console.log(next);

    const form = new FormData();
    const json = await Promise.all(next.map(async q => {
      if (q == null || Object.keys(q).length === 0) return null;
      const dupe = { ...q };
      delete dupe._id;
      delete dupe.id;
      if (dupe.type === 'match' && dupe.match != null) {
        form.append('images', await urlToObject(dupe.match));
        dupe.match = iID++;
      }
      return dupe;
    }));

    form.append('guesses', JSON.stringify(json));

    if (question === questions.length) {
      form.append('final', true);
    }

    const response = await fetch(`/api/play/${id}/guesses`, {
      method: "PUT",
      body: form,
    });

    if (!response.ok) {
      return console.log(await response.text());
    }

    if (question !== questions.length) {
      setGuesses(next);
      setQuestion(q => q + 1);
    } else {
      navigate(`/play/${id}`);
    }
  }, [question, guesses, id, questions?.length, navigate]);

  if (play_loading || quiz_loading || questions_loading) {
    return <LoadingPage />;
  } else if (play_response.status === 403 || quiz_response.status === 403 || questions_response.status === 403) {
    return <RestrictedPage />;
  } else if (!play_response.ok || !quiz_response.ok || !questions_response.ok) {
    return <NotFoundPage />;
  }

  const timesUp = timer != null && timer < 0;

  return (
    <Stack alignItems="center" overflow="scroll" boxSizing="border-box" maxWidth={1} pb={10}>
      <Stack maxWidth={1024} gap={4} p={2} pb={0} mb={-0.25} boxSizing="border-box" width={1}>
        <Stack gap={2}>
          <Breadcrumbs separator={<ChevronRightRounded fontSize="xs" />} sx={{ p: 0 }}>
            <Link underline='none' component={RouterLink} to="/" color='neutral'>
              <HomeRounded />
            </Link>
            <Link to="/quizzes" color='neutral' component={RouterLink} fontSize="sm">Quizzes</Link>
            <Link to={`/quiz/${quiz.id}`} color='neutral' component={RouterLink} fontSize="sm">{elipse(quiz.name, 10)}</Link>
            <Typography fontSize="sm" color="primary" variant="solid">&nbsp;Play&nbsp;</Typography>
          </Breadcrumbs>
          <Stack direction="row" justifyContent="space-between">
            <Typography level="h1">{submitting ? 'Ready to submit?' : `Question ${question + 1}`}</Typography>
            {timer != null &&
              <Chip sx={{ p: 0, px: 2 }} variant="outlined" color="warning" size='lg'>
                {timer > 0 ? `${timer}s` : "Time's Up!"}
              </Chip>
            }
          </Stack>
        </Stack>
      </Stack>
      <Stack width={1} maxWidth={1} mt={1} overflow="scroll">
        <Stepper sx={{ width: (questions.length + 1) * 100, p: 2 }}>
          {questions.map((_, i) => (
            <Step key={i} indicator={
              <Chip variant={i === question ? "solid" : "outlined"} onClick={() => setQuestion(i)} color={i === question ? "primary" : "neutral"}>{i + 1}</Chip>
            }></Step>
          ))}
          <Step indicator={
            <Chip variant={submitting ? "solid" : "soft"} color="success" size='lg' onClick={() => setQuestion(questions.length)}>Submit</Chip>
          }></Step>
        </Stepper>
      </Stack>
      { !submitting ? (
        <>
          <Stack maxWidth={1024} gap={2} p={2} pb={2} boxSizing="border-box" width={1}>
          {image &&
            <img alt="Yeah." src={image} style={{ borderRadius: 8, boxShadow: "0px 4px 0px 0px #0001" }} />
          }
          <Typography level='h4' component="pre" overflow="hidden" whiteSpace="nowrap" textOverflow="ellipsis">{name}</Typography>
          <Typography sx={{ hyphens: 'auto', textAlign: 'justify' }}>{description}</Typography>
        </Stack>
        <Divider />
        <Stack maxWidth={1024} gap={2} p={2} pb={0} mt={2} boxSizing="border-box" width={1}>
          <QuestionPlay question={questions?.[question]} guess={guesses[question]} onGuess={handleGuess} />
        </Stack>
        </>
      ) : (
        <>
        <Stack maxWidth={1024} gap={2} p={2} pb={2} boxSizing="border-box" width={1}>
          <Typography level='h4' component="pre" overflow="hidden" whiteSpace="nowrap" textOverflow="ellipsis">You have finished the quiz!</Typography>
          <Typography sx={{ hyphens: 'auto', textAlign: 'justify' }}>You can choose to submit now, or view your continue working</Typography>
        </Stack>
        <Divider />
        <Stack maxWidth={1024} gap={2} p={2} pb={0} mt={2} boxSizing="border-box" width={1}>
        <Button type="button" color="primary" variant='solid' fullWidth size='lg' onClick={() => handleGuess()}>Submit</Button>
        </Stack>
        </>
      ) }
      <Modal open={timesUp || play.isScored}>
        <ModalDialog sx={{ p: 3, width: 400 }}>
          <DialogTitle level='h1'>Time is Up!</DialogTitle>
          <DialogContent>Let us see how you did.</DialogContent>
          <Button type="button" color="primary" variant='solid' fullWidth size='lg' onClick={() => navigate(`/play/${id}`)}>Show me my score</Button>
        </ModalDialog>
      </Modal>
    </Stack>
  )
}

export default React.memo(PlayEditPage);
