import React from 'react';
import { Sheet } from '@mui/joy';
import Navbar from './util/Navbar';
import { Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ExplorePage from './pages/ExplorePage';
import UserPage from './pages/UserPage';
import UserEditPage from './pages/UserEditPage';
import PlayViewPage from './pages/PlayViewPage';
import UserContext from './util/UserContext';
import LoginModal from './util/LoginModal';
import LogoutModal from './util/LogoutModal';
import ReportModal from './util/ReportModal';
import NotFoundPage from './pages/NotFoundPage';
import QuizPage from './pages/QuizPage';
import QuizEditPage from './pages/QuizEditPage';
import RegisterModal from './util/RegisterModal';
import MeRouter from './util/MeRouter';
import ReportContext from './util/ReportContext';
import ReportPage from './pages/ReportPage';
import MyQuizzesPage from './pages/MyQuizzesPage';
import PlayEditPage from './pages/PlayEditPage';

/*----------------------------------------------------------------------------*/

function App() {
  const [loginModal, setLoginModal] = React.useState(false);
  const [logoutModal, setLogoutModal] = React.useState(false);
  const [registerModal, setRegisterModal] = React.useState(false);
  const [reportModal, setReportModal] = React.useState(false);
  const [reportType, setReportType] = React.useState();
  const [reportID, setReportID] = React.useState();
  const [id, setID] = React.useState(undefined);
  const [user, setUser] = React.useState(undefined);

  React.useEffect(() => {
    if (id === null) {
      setUser(null);
    } else {
      void (async () => {
        const response = await fetch("/api/me");
        if (!response.ok) {
          setUser(null);
          return;
        }
        setUser(await response.json());
      })();
    }
  }, [id]);

  const handleLogin = React.useCallback(async (username, password) => {
    const data = new FormData();
    data.append("username", username);
    data.append("password", password);

    const response = await fetch("/api/session", {
      method: "POST",
      body: data
    });

    if (!response.ok) {
      try {
        const error = JSON.parse(await response.text());
        return [false, error];
      } catch (err) {
        return [false, { error: "Internal error." }];
      }
    }

    const { id } = await response.json();
    setID(id);

    return [true, id];
  }, []);

  const handleRegister = React.useCallback(async (username, password) => {
    const data = new FormData();
    data.append("username", username);
    data.append("password", password);
    data.append("login", true);

    const response = await fetch("/api/user", {
      method: "POST",
      body: data
    });

    if (!response.ok) {
      try {
        const error = JSON.parse(await response.text());
        return [false, error];
      } catch (err) {
        return [false, { error: "Internal error." }];
      }
    }

    const { id } = await response.json();
    console.log(id);
    setID(id);

    return [true, id];
  }, []);

  const handleLogout = React.useCallback(async () => {
    const response = await fetch("/api/session", { method: "DELETE" });

    if (!response.ok) {
      try {
        const error = JSON.parse(await response.text());
        return [false, error];
      } catch (err) {
        return [false, { error: "Internal error." }];
      }
    }
    setID(null);

    return [true, null]
  }, []);

  const handleReport = React.useCallback(async (type, id, reason) => {
    const response = await fetch("/api/report", {
      headers: { "Content-Type": "application/json" },
      method: "POST",
      body: JSON.stringify({ type, id, reason }),
    });

    if (!response.ok) {
      try {
        const error = JSON.parse(await response.text());
        return [false, error];
      } catch (err) {
        return [false, { error: "Internal error." }];
      }
    }
    return [true, null];
  }, []);

  const promptLogin = React.useCallback(() => {
    setLoginModal(true);
  }, []);

  const promptRegister = React.useCallback(() => {
    setRegisterModal(true);
  }, []);

  const promptLogout = React.useCallback(() => {
    setLogoutModal(true);
  }, []);

  const promptReport = React.useCallback((type, id) => {
    console.log(user);
    if (user == null) {
      setLoginModal(true);
    } else {
      setReportModal(true);
      setReportType(type);
      setReportID(id);
    }
  }, [user]);

  const Register2Login = React.useCallback(() => {
    setRegisterModal(false);
    setLoginModal(true);
  }, []);

  const Login2Register = React.useCallback(() => {
    setRegisterModal(true);
    setLoginModal(false);
  }, [])
  
  return (
    <UserContext.Provider value={[user, promptLogin, promptLogout, promptRegister]}>
      <ReportContext.Provider value={promptReport}>
        <Navbar />
        <Sheet sx={{ overflow: 'hidden', minHeight: "100vh" }}>
          <Routes>
            <Route exact path="/" element={<HomePage />} />
            <Route path="/me/*" element={<MeRouter />} />
            <Route path="/quiz/:id" element={<QuizPage />} />
            <Route path="/quiz/:id/edit" element={<QuizEditPage />} />
            <Route path="/user/:id/quizzes" element={<MyQuizzesPage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/report" element={<ReportPage />} />
            <Route path="/user/:id" element={<UserPage />} />
            <Route path="/user/:id/edit" element={<UserEditPage />} />
            <Route path="/play/:id" element={<PlayViewPage />} />
            <Route path="/play/:id/edit" element={<PlayEditPage />} />
            <Route path='*' element={<NotFoundPage />}/>
          </Routes>
        </Sheet>
        
        <LoginModal doLogin={handleLogin} doRegister={Login2Register} open={loginModal} setOpen={setLoginModal}/>
        <RegisterModal doRegister={handleRegister} doLogin={Register2Login} open={registerModal} setOpen={setRegisterModal}/>
        <LogoutModal doLogout={handleLogout} open={logoutModal} setOpen={setLogoutModal}/>
        <ReportModal open={reportModal} setOpen={setReportModal} type={reportType} id={reportID} doReport={handleReport} />
      </ReportContext.Provider>
    </UserContext.Provider>
  );
}

export default React.memo(App);