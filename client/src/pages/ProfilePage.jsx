import React, {  } from 'react';
import { TextField, Typography } from '@mui/joy';
import useFetchye from '../util/useFetchye';
import { useParams } from 'react-router-dom';
import LoadingPage from './LoadingPage';
import NotFoundPage from './NotFoundPage';

function ProfilePage() {
  const { id } = useParams();

  const { error, loading, response, data } = useFetchye(`/api/user/${id}`, {}, []);

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
  } = data;

  return (
    <div style={{ fontFamily: 'Noto Sans, sans-serif', padding: '20px' }}>
      <h1>Profile</h1>
      <div>
        <TextField
          label="Username"
          variant="outlined"
          value={username}
          disabled
          fullWidth
        />
        <TextField
          label="Description"
          variant="outlined"
          multiline
          rows={4}
          value={description}
          disabled
          fullWidth
          style={{ marginTop: '20px' }}
        />
        <Typography>Followers: {totalFollowers}</Typography>
        <Typography>Quizzes: {totalQuizzes}</Typography>
      </div>
      {/* <Button
        variant="contained"
        color="secondary"
        onClick={promptLogout}
        style={{ marginTop: '20px' }}
      >
        Logout
      </Button> */}
    </div>
  );
}

export default ProfilePage;
