import React from 'react';
import { useAuth } from './UserContext';
import { useParams, useNavigate } from 'react-router-dom';
import RestrictedPage from '../pages/RestrictedPage';
import LoadingPage from '../pages/LoadingPage';

function MeRouter() {
  const navigate = useNavigate();
  const { "*": route } = useParams();
  const [user, promptLogin] = useAuth();

  React.useEffect(() => {
    if (user === null) {
      promptLogin();
    } else if (user === undefined) {
      
    } else {
      console.log(`/user/${user.id}/${route}`);
      navigate(`/user/${user.id}/${route}`);
    }
  }, [user, promptLogin, route, navigate]);

  if (user === undefined) {
    return <LoadingPage />;
  }if (user == null) {
    return <RestrictedPage />;
  } else {
    return <LoadingPage />;
  }
}

export default React.memo(MeRouter);