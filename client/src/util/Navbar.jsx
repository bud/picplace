import { AddRounded, ExploreRounded, DoorFrontRounded, ShowChartRounded, PersonRounded, MoreVertRounded, LogoutRounded, RuleFolderRounded, EditRounded, FlagRounded } from '@mui/icons-material';
import { Button, Divider, Dropdown, IconButton, ListDivider, ListItemDecorator, Menu, MenuButton, MenuItem, Sheet, Stack, Typography } from '@mui/joy';
import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from './UserContext';
import { Avatar } from '@mui/joy';
import Logo from '../res/logo4x.png';
import { useWindowSize } from '@uidotdev/usehooks';

/*----------------------------------------------------------------------------*/

function NavProfile({ user = {}, onLogout: handleLogout }) {
  const navigate = useNavigate();

  return (
    <Dropdown>
      <MenuButton
        slots={{ root: Avatar }}
        slotProps={{ root: { alt: user.name, src: user.profile, size: "md" } }}>
          <MoreVertRounded/>
        </MenuButton>
      <Menu placement="bottom-end">
        <MenuItem variant="plain" onClick={() => navigate(`/me`)}>
          <ListItemDecorator>
            <PersonRounded />
          </ListItemDecorator>
          View Profile
        </MenuItem>
        <MenuItem variant="plain" color="primary" onClick={() => navigate(`/me/edit`)}>
          <ListItemDecorator>
            <EditRounded />
          </ListItemDecorator>
          Edit Profile
        </MenuItem>
        <ListDivider />
        <MenuItem variant="plain" onClick={() => navigate(`/me/quizzes`)}>
          <ListItemDecorator>
            <RuleFolderRounded />
          </ListItemDecorator>
          My Quizzes
        </MenuItem>
        <ListDivider />
        <MenuItem variant="plain" color="error" onClick={handleLogout}>
          <ListItemDecorator>
            <LogoutRounded />
          </ListItemDecorator>
          Log Out
        </MenuItem>
      </Menu>
    </Dropdown>
  );
}

/*----------------------------------------------------------------------------*/

function NavBar() {
  const [user, promptLogin, promptLogout, promptRegister] = useAuth();
  const navigate = useNavigate();
  const { width } = useWindowSize();

  const handleAddQuiz = React.useCallback(async () => {
    if (user == null) return;
    const response = await fetch("/api/quiz", { method: "POST" });
    if (!response.ok) return alert(await response.text());
    const { id } = await response.json();
    navigate(`/quiz/${id}/edit`);
  }, [navigate, user]);

  let inner;

  if (width > 850) {
    inner = (
      <Stack gap={2} direction="row" flex={1} px={1} py={1}>
        <RouterLink to="/" style={{ textDecoration: "none" }}>
          <Stack direction="row" justifyContent="center" alignItems="center" gap={1} pr={3}>
            <img src={Logo} alt="PicPlace logo." width={36} height={36} />
            <Typography level="h4" fontFamily="Luckiest Guy" fontSize={24} sx={{transform: "translateY(4px)"}}>PicPlace</Typography>
          </Stack>
        </RouterLink>
        <Button color="primary" startDecorator={<ExploreRounded />} variant="outlined" onClick={() => navigate(`/explore`)}>Explore</Button>
        <Button color="warning" startDecorator={<ShowChartRounded />} variant="outlined" onClick={() => navigate(`/trending`)}>Trending</Button>
        <div style={{ flex: 1 }} />
        { user?.admin &&
          <Button color="danger" variant="outlined" startDecorator={<FlagRounded />} onClick={() => navigate(`/report`)}>Reports</Button>
        }
        <Button color="success" variant="outlined" startDecorator={<AddRounded />} onClick={handleAddQuiz}>New Quiz</Button>
        <Divider orientation="vertical" inset="none" />
        { user == null ? (
          <Stack direction="row" gap={1}>
            <Button color="neutral" variant="solid" startDecorator={<DoorFrontRounded />} onClick={promptLogin}>Sign In</Button>
            <Button color="neutral" variant="plain" onClick={promptRegister}>Register</Button>
          </Stack>
        ) : (
          <NavProfile onLogout={promptLogout} user={user}/>
        ) }
      </Stack>
    );
  } else if (width > 500) {
    inner = (
      <Stack gap={2} direction="row" flex={1}>
        <RouterLink to="/" style={{ textDecoration: "none" }}>
          <Stack direction="row" justifyContent="center" alignItems="center" gap={1} pr={3}>
            <img src={Logo} alt="PicPlace logo." width={36} height={36} />
            <Typography level="h4" fontFamily="Luckiest Guy" fontSize={24} sx={{transform: "translateY(4px)"}}>PicPlace</Typography>
          </Stack>
        </RouterLink>
        <IconButton color="primary" variant="outlined" onClick={() => navigate(`/explore`)}><ExploreRounded /></IconButton>
        <IconButton color="warning" variant="outlined" onClick={() => navigate(`/trending`)}><ShowChartRounded /></IconButton>
        <div style={{ flex: 1 }} />
        { user?.admin &&
          <IconButton color="danger" variant="outlined" onClick={() => navigate(`/report`)}><FlagRounded /></IconButton>
        }
        <IconButton color="success" variant="outlined" onClick={handleAddQuiz}><AddRounded /></IconButton>
        <Divider orientation="vertical" inset="none" />
        { user == null ? (
          <Stack direction="row" gap={1}>
            <IconButton color="neutral" variant="solid" onClick={promptLogin}><DoorFrontRounded /></IconButton>
            <IconButton color="neutral" variant="plain" onClick={promptRegister}><PersonRounded/></IconButton>
          </Stack>
        ) : (
          <NavProfile onLogout={promptLogout} user={user}/>
        ) }
      </Stack>
    );
  } else {
    inner = (
      <Stack gap={2} direction="row" flex={1}>
        <RouterLink to="/" style={{ textDecoration: "none" }}>
          <Stack direction="row" justifyContent="center" alignItems="center" gap={1}>
            <img src={Logo} alt="PicPlace logo." width={36} height={36} />
            <Typography level="h4" fontFamily="Luckiest Guy" fontSize={24} sx={{transform: "translateY(4px)"}}>PicPlace</Typography>
          </Stack>
        </RouterLink>
        <div style={{ flex: 1 }} />
        <Dropdown>
          <MenuButton
            slots={{ root: IconButton }}
            slotProps={{ root: { variant: 'soft', color: 'neutral' } }}>
              <MoreVertRounded/>
            </MenuButton>
          <Menu placement="bottom">
            <MenuItem variant="plain" color="primary" onClick={() => navigate(`/explore`)}>
              <ListItemDecorator>
                <ExploreRounded />
              </ListItemDecorator>
              Discover
            </MenuItem>
            { user?.admin &&
              <MenuItem variant="plain" color="danger" onClick={() => navigate(`/report`)}>
                <ListItemDecorator>
                  <FlagRounded />
                </ListItemDecorator>
                Reports
              </MenuItem>
            }
            <ListDivider />
            <MenuItem variant="plain" color="success" onClick={handleAddQuiz}>
              <ListItemDecorator>
                <AddRounded />
              </ListItemDecorator>
              New Quiz
            </MenuItem>
          </Menu>
        </Dropdown>
        <Divider orientation="vertical" inset="none" />
        { user == null ? (
          <Stack direction="row" gap={1}>
            <IconButton color="neutral" variant="solid" onClick={promptLogin}><DoorFrontRounded /></IconButton>
          </Stack>
        ) : (
          <NavProfile onLogout={promptLogout} user={user}/>
        ) }
      </Stack>
    );
  }

  return (
    <Sheet direction="row" gap={3} sx={{ width: 1, p: 2, boxSizing: "border-box", position: 'sticky', top: 0, zIndex: 100, alignItems: 'center', justifyContent: 'center', display: 'flex' }}>
      {inner}
    </Sheet>
  );
}

export default React.memo(NavBar);