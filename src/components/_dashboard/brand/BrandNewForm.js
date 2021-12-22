import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import { Form, FormikProvider, useFormik } from 'formik';
// material
import { LoadingButton } from '@mui/lab';
import { Card, Grid, Stack, TextField, Box } from '@mui/material';
import { useDispatch } from 'react-redux';
// routes
import { PATH_DASHBOARD } from '../../../routes/paths';
import { postBrand } from '../../../redux/slices/brand';

// ----------------------------------------------------------------------

BrandNewForm.propTypes = {
  isEdit: PropTypes.bool,
  currentBrand: PropTypes.object
};

export default function BrandNewForm({ isEdit, currentBrand }) {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();

  const NewBrandSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    description: Yup.string().required('Description is required')
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: currentBrand?.name || '',
      description: currentBrand?.description || ''
    },
    validationSchema: NewBrandSchema,
    onSubmit: async (values, { setSubmitting, resetForm, setErrors }) => {
      // if (isEdit) {
      //   // EDIT BRAND
      //   console.log('EDIT BRAND', values);
      //   resetForm();
      // } else {
      //   // ADD BRAND
      //   console.log('CREATE BRAND', values);
      //   resetForm();
      // }
      function excuteAfterSubmit({ isSuccess, errorString }) {
        setSubmitting(false);
        if (isSuccess) {
          resetForm();
          enqueueSnackbar('Create success', { variant: 'success' });
          navigate(PATH_DASHBOARD.brand.list);
        } else {
          if (!errorString) errorString = 'Error but can not find out error string!';
          enqueueSnackbar(errorString, { variant: 'error' });
          setErrors(errorString);
        }
      }

      try {
        await dispatch(postBrand(values, excuteAfterSubmit));
      } catch (error) {
        console.error(error);
        setSubmitting(false);
        setErrors(error);
      }
    }
  });

  const { errors, touched, handleSubmit, isSubmitting, getFieldProps } = formik;

  return (
    <FormikProvider value={formik}>
      <Form noValidate autoComplete="off" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card sx={{ p: 3 }}>
              <Stack spacing={3}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                  <TextField
                    fullWidth
                    label="Brand Name"
                    {...getFieldProps('name')}
                    error={Boolean(touched.name && errors.name)}
                    helperText={touched.name && errors.name}
                  />
                  <TextField
                    fullWidth
                    label="Description"
                    {...getFieldProps('description')}
                    error={Boolean(touched.description && errors.description)}
                    helperText={touched.description && errors.description}
                  />
                </Stack>
              </Stack>
              <Box sx={{ width: 200, height: 100, mt: 3 }}>
                <LoadingButton type="submit" fullWidth variant="contained" size="large" loading={isSubmitting}>
                  {!isEdit ? 'Create Brand' : 'Save Changes'}
                </LoadingButton>
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Form>
    </FormikProvider>
  );
}
