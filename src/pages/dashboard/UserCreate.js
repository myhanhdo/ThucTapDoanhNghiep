import { useEffect } from 'react';
import { paramCase } from 'change-case';
import { useLocation } from 'react-router-dom';

// material
import { Container } from '@mui/material';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { getUserList } from '../../redux/slices/user';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// hooks
import useSettings from '../../hooks/useSettings';
// components
import Page from '../../components/Page';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import UserNewForm from '../../components/_dashboard/user/UserNewForm';

// ----------------------------------------------------------------------

export default function UserCreate() {
  const { themeStretch } = useSettings();
  const dispatch = useDispatch();
  const { pathname } = useLocation();
  // const { userName } = useParams();
  const ArrPath = pathname.split('/');
  const userName = ArrPath[3];
  const { userList } = useSelector((state) => state.user);
  const isEdit = pathname.includes('edit');
  const currentUser = userList.find((user) => paramCase(user.userName) === userName);

  useEffect(() => {
    dispatch(getUserList());
  }, [dispatch]);

  return (
    <Page title="User: Create a new user | R2S-UI">
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <HeaderBreadcrumbs
          heading={!isEdit ? 'Create a new user' : 'Edit user'}
          links={[
            { name: 'Dashboard', href: PATH_DASHBOARD.root },
            { name: 'User', href: PATH_DASHBOARD.user.root },
            { name: !isEdit ? 'New user' : userName }
          ]}
        />

        <UserNewForm isEdit={isEdit} currentUser={currentUser} />
      </Container>
    </Page>
  );
}
