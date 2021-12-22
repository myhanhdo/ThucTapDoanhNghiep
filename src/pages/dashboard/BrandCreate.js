import { useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
// material
import { Container } from '@mui/material';
// redux
import { useDispatch } from '../../redux/store';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// hooks
import useSettings from '../../hooks/useSettings';
// components
import Page from '../../components/Page';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import BrandNewForm from '../../components/_dashboard/brand/BrandNewForm';

// ----------------------------------------------------------------------

export default function BrandCreate() {
  const { themeStretch } = useSettings();
  const dispatch = useDispatch();
  const { pathname } = useLocation();
  const { brandName } = useParams();
  const isEdit = pathname.includes('edit');

  console.log(brandName);

  useEffect(() => {}, [dispatch]);

  return (
    <Page title="Ecommerce: Create a new brand | R2S-UI">
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <HeaderBreadcrumbs
          heading={!isEdit ? 'Create a new brand' : 'Edit brand'}
          links={[
            { name: 'Dashboard', href: PATH_DASHBOARD.root },
            {
              name: 'Brand',
              href: PATH_DASHBOARD.eCommerce.root
            },
            { name: !isEdit ? 'New brand' : brandName }
          ]}
        />

        <BrandNewForm isEdit={isEdit} />
      </Container>
    </Page>
  );
}
