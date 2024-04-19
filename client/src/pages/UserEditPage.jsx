import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Stack, Input, Avatar, Divider, FormLabel } from '@mui/joy';
import { SaveRounded, DeleteForeverRounded, ArrowBackIosNewRounded } from '@mui/icons-material';
import LoadingPage from './LoadingPage';
import NotFoundPage from './NotFoundPage';
import useFetchye from '../util/useFetchye';
import { useAuth } from '../util/UserContext';

const UserEditPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [user] = useAuth();
  const {
    data: userData,
    loading,
    response,
    error,
  } = useFetchye(`/api/user/${id}`, {}, [id]);
  
  const [description, setDescription] = useState('');
  const [profilePic, setProfilePic] = useState(null);
  const [file, setFile] = useState(null); // new state for file
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (userData && isInitialMount.current) {
      setDescription(userData.description || '');
      setProfilePic(userData.profile || '');
      isInitialMount.current = false;
    }
  }, [userData]);

  if (loading) return <LoadingPage />;
  if (!response.ok || error) return <NotFoundPage />;
  if (userData && (userData.id !== user.id && !user.admin)) return <NotFoundPage message="Unauthorized access" />;

  const handleSaveChanges = async () => {
    const formData = new FormData();
    if (description) formData.append('description', description);
    if (file) formData.append('profile', file);

    const response = await fetch(`/api/user/${id}`, {
      method: 'PUT',
      body: formData,
    });

    if (!response.ok) {
      alert('Failed to update profile');
    } else {
      navigate(`/user/${id}`);
    }
  };

  const handleDeleteAccount = async () => {
    const confirm = window.confirm('Are you sure you want to delete your account? This action cannot be undone.');
    if (confirm) {
      const response = await fetch(`/api/user/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        alert('Failed to delete account');
      } else {
        navigate('/');
      }
    }
  };

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
      setProfilePic(URL.createObjectURL(event.target.files[0]));
    }
  };

  return (
    <Stack gap={2} alignItems="center">
      <Button startDecorator={<ArrowBackIosNewRounded />} onClick={() => navigate('/me')}>Back</Button>
      <Avatar src={profilePic} alt="Profile Picture" sx={{ width: 100, height: 100 }} />
      <FormLabel htmlFor="profile-pic">Profile Picture</FormLabel>
      <Input
        id="profile-pic"
        type="file"
        onChange={handleFileChange}
        fullWidth
      />
      <FormLabel htmlFor="description">Description</FormLabel>
      <Input
        id="description"
        multiline
        minRows={3}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        fullWidth
      />
      <Divider flexItem />
      <Button variant="solid" startDecorator={<SaveRounded />} onClick={handleSaveChanges}>Save Changes</Button>
      <Button variant="outlined" color="danger" startDecorator={<DeleteForeverRounded />} onClick={handleDeleteAccount}>Delete Account</Button>
    </Stack>
  );
};

export default UserEditPage;
