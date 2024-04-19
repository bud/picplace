import React from 'react';
// import { useAuth } from '../util/UserContext';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import LoadingPage from '../LoadingPage';
import NotFoundPage from '../NotFoundPage';
import RestrictedPage from '../RestrictedPage';
import { Breadcrumbs, Button, Divider, IconButton, Link, Stack, Typography } from '@mui/joy';
import { AddRounded, ChevronRightRounded, DeleteForeverRounded, HomeRounded, ReplayRounded, SaveRounded } from '@mui/icons-material';
import EditGeneral from './EditGeneral';
import EditQuestion from './EditQuestion';
import SaveModal from './RevertModal';
import DeleteModal from './DeleteModal';
import useFetchye from '../../util/useFetchye';
import { useAuth } from '../../util/UserContext';
import RespButton from '../../util/RespButton';
// import useTempState from '../../util/useTempState';

async function urlToObject(image) {
  if (image == null) return undefined;
  const response = await fetch(image);
  // here image is url/location of image
  const blob = await response.blob();
  return new File([blob], 'image.jpg', { type: blob.type });
}

function elipse(text, length) {
  if ((text?.length ?? 0) > length) {
    return text.slice(0, length) + '...';
  } else {
    return text;
  }
}

function QuizEditPage() {
  useAuth();
  const [edited, setEdited] = React.useState(false);
  const { id } = useParams();
  const [revertModal, setRevertModal] = React.useState(false);
  const [deleteModal, setDeleteModal] = React.useState(false);
  const [inc, setInc] = React.useState(1);
  const navigate = useNavigate();

  const {
    error: quiz_error,
    loading: quiz_loading,
    response: quiz_response,
    data: quiz_data
  } = useFetchye(`/api/quiz/${id}`, {}, [inc]);

  const {
    data: quiz_questions_data
  } = useFetchye(`/api/quiz/${id}/questions`, {}, [inc]);

  const [general, setGeneral] = React.useState(quiz_data);
  const [questions, setQuestions] = React.useState(quiz_questions_data);

  React.useEffect(() => {
    setQuestions(quiz_questions_data);
    setEdited(false);
  }, [quiz_questions_data]);

  React.useEffect(() => {
    setGeneral(quiz_data);
    setEdited(false);
  }, [quiz_data]);

  const handleGeneral = React.useCallback(p => {
    console.log("GENERAL");
    setGeneral(p);
    setEdited(true);
  }, []);

  const handleQuestions = React.useCallback(p => {
    console.log("QUESTIONS");
    setQuestions(p);
    setEdited(true);
  }, []);

  console.log(questions);

  const handleAddQuestion = React.useCallback(() => {
    setQuestions(p => [...p, {
      type: 'blank',
      id: p.length,
      name: '',
      description: '',
      image: null
    }]);
    setEdited(true);
  }, []);

  const handleSave = React.useCallback(async () => {
    if (general == null || questions == null) return;
    const general_form = new FormData();
    general_form.append('name', general.name ?? '');
    general_form.append('description', general.description ?? '');
    general_form.append('timelimit', general.timelimit ?? 0);
    general_form.append('public', general.public);
    if ((general?.thumbnail?.length ?? 0) > 0) {
      general_form.append('thumbnail', await urlToObject(general.thumbnail));
    }
    const general_response = await fetch(`/api/quiz/${general.id}`, {
      method: "PUT",
      body: general_form
    });
    if (!general_response.ok) return alert("ERROR GENERAL");

    const questions_form = new FormData();
    let id = 0;
    
    const qs = await Promise.all(questions.map(async q => {
      const dupe = { ...q };
      delete dupe._id;
      delete dupe.id;
      if (dupe.image != null) {
        questions_form.append('images', await urlToObject(dupe.image));
        dupe.image = id++;
      }
      return dupe;
    }));

    console.log(questions);
    console.log(qs);

    questions_form.append('questions', JSON.stringify(qs));
    const questions_response = await fetch(`/api/quiz/${general.id}/questions`, {
      method: "PUT",
      body: questions_form
    });
    if (!questions_response.ok) return alert("ERROR QUESTIONS");
    setEdited(false);
  }, [general, questions]);

  const handleRevert = React.useCallback(() => {
    setInc(i => i + 1);
  }, []);

  const handleDelete = React.useCallback(async () => {
    const response = await fetch(`/api/quiz/${id}`, { method: "DELETE" });
    if (!response.ok) return alert("ERROR DELETEING QUIZ");
    navigate('/me/quizzes');
  }, [id, navigate]);

  if (quiz_loading) {
    console.log(1);
    return <LoadingPage />;
  } else if (quiz_response.status === 404) {
    console.log(2);
    return <NotFoundPage />;
  } else if (!quiz_response.ok) {
    console.log(3);
    return <LoadingPage error={quiz_error} />;
  } else if (quiz_data.access !== 2) {
    console.log(4)
    return <RestrictedPage />;
  } else if (general == null || questions == null) {
    console.log(5);
    return <LoadingPage />;
  }

  return (
    <Stack alignItems="center" overflow="scroll" boxSizing="border-box" width={1}>
      <Stack maxWidth={1024} gap={4} p={2} pb={4} overflow="scroll" boxSizing="border-box" width={1}>
        <Breadcrumbs separator={<ChevronRightRounded fontSize="xs" />} sx={{ p: 0 }}>
          <Link underline='none' component={RouterLink} to="/" color='neutral'>
            <HomeRounded />
          </Link>
          <Link to="/quizzes" color='neutral' component={RouterLink} fontSize="sm">My Quizzes</Link>
          <Link to={`/quiz/${id}`} color='neutral' component={RouterLink} fontSize="sm">{elipse(general.name, 10)}</Link>
          <Typography fontSize="sm" color="primary" variant="solid">&nbsp;Edit&nbsp;</Typography>
        </Breadcrumbs>
        <Stack gap={4}>
        <Stack direction='row' gap={2} alignItems="center">
          <Typography level="h1">Edit Quiz</Typography>
          <div style={{ flex: 1 }} />
          <RespButton disabled={!edited} icon={SaveRounded} onClick={handleSave} label="Save" breakpoint={500} variant="solid" color="primary" />
          <RespButton disabled={!edited} color="success" variant='outlined' icon={ReplayRounded} onClick={() => setRevertModal(true)} label="Revert" />
          <IconButton variant='outlined' color='danger' onClick={() => setDeleteModal(true)}>
            <DeleteForeverRounded />
          </IconButton>
        </Stack>
        <EditGeneral data={general} onData={handleGeneral} />
        </Stack>
      </Stack>
      <Divider orientation="horizontal" />
      <Stack maxWidth={1024} gap={4} p={2} pt={4} overflow="scroll" boxSizing="border-box" width={1}>
        {questions.map((q, i) => <EditQuestion data={q} onData={handleQuestions} key={i} index={i} />)}
        <Button size='lg' startDecorator={<AddRounded />} onClick={handleAddQuestion}>Add Blank Question</Button>
      </Stack>
      <SaveModal open={revertModal} setOpen={setRevertModal} onRevert={handleRevert} />
      <DeleteModal open={deleteModal} setOpen={setDeleteModal} onDelete={handleDelete} />
    </Stack>
  );
}

export default React.memo(QuizEditPage);