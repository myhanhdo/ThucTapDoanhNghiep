import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';

import { Form, FormikProvider, useFormik } from 'formik';
// material
import { LoadingButton } from '@mui/lab';
import {
  Box,
  Card,
  Grid,
  Stack,
  Switch,
  TextField,
  Typography,
  FormHelperText,
  FormControlLabel,
  useMediaQuery
} from '@mui/material';
import { startLoading, createUserSuccess } from '../../../redux/slices/user';

// utils
import axios from '../../../utils/axios';

import { fData } from '../../../utils/formatNumber';

// routes
import { PATH_DASHBOARD } from '../../../routes/paths';
//
import Label from '../../Label';
import { UploadAvatar } from '../../upload';
// ----------------------------------------------------------------------

UserNewForm.propTypes = {
  isEdit: PropTypes.bool,
  currentUser: PropTypes.object
};

export default function UserNewForm({ isEdit, currentUser }) {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.up('sm'));

  const dispatch = useDispatch();
  const token = localStorage.getItem('accessToken');

  const NewUserSchema = Yup.object().shape({
    firstName: Yup.string().required('First Name is required'),
    lastName: Yup.string().required('Last Name is required'),
    userName: Yup.string().required('User Name is required'),
    // password: Yup.string().required('Password  is required'),
    // confirmPassword: Yup.string().required('Confirm Password  is required'),
    password: isEdit ? null : Yup.string().required('Password  is required'),
    confirmPassword: isEdit ? null : Yup.string().required('Confirm Password  is required'),
    email: Yup.string().required('Email is required'),
    phoneNumber: Yup.string().required('Phone number is required'),
    imageUrl: Yup.mixed().required('Avatar is required')
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      imageUrl: currentUser?.imageUrl || '',
      firstName: currentUser?.firstName || '',
      lastName: currentUser?.lastName || '',
      userName: currentUser?.userName || '',
      password: currentUser?.password || '',
      confirmPassword: currentUser?.confirmPassword || '',
      email: currentUser?.email || '',
      phoneNumber: currentUser?.phoneNumber || ''
    },
    validationSchema: NewUserSchema,
    onSubmit: async (values, { setSubmitting, resetForm, setErrors }) => {
      dispatch(startLoading());
      console.log(setSubmitting, resetForm, setErrors);
      if (isEdit) {
        // EDIT USER Ở ĐÂY
        const userInfo = {
          userId: currentUser.id,
          ...values
        };
        console.log(userInfo);

        const response = await axios.put('/identity/profile', userInfo, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (response.status === 200) {
          enqueueSnackbar('Update success success', { variant: 'success' });
          navigate(PATH_DASHBOARD.user.list);
        }
      } else {
        // NHẬN TOKEN VÀ VALUE FORM => TẠO USER MỚI

        try {
          const { name, extension, base64: data } = values.imageUrl;
          const { ...others } = values;
          const userInfo = {
            ...others,
            image: {
              name,
              extension,
              data
            }
          };

          const response = await axios.post('/identity/register', userInfo, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          if (response.status === 200) {
            dispatch(createUserSuccess());
            enqueueSnackbar('Create success', { variant: 'success' });
            navigate(PATH_DASHBOARD.user.list);
          }
        } catch (error) {
          enqueueSnackbar(`${error.title || error.exception}`, { variant: 'error' });
          console.log(error);
        }
      }
    }
  });

  const { errors, values, touched, handleSubmit, isSubmitting, setFieldValue, getFieldProps } = formik;

  function getBase64(file) {
    return new Promise((resolve) => {
      let baseURL = '';
      // Make new FileReader
      const reader = new FileReader();

      // Convert the file to base64 text
      reader.readAsDataURL(file);

      // on reader load somthing...
      reader.onload = () => {
        // Make a fileInfo Object

        baseURL = reader.result;
        resolve(baseURL);
      };
    });
  }

  const handleDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        getBase64(file)
          .then((result) => {
            file.base64 = result;

            const name = file.name.split('.')[0];
            const extension = `.${file.type.split('/')[1]}`;

            setFieldValue('imageUrl', {
              ...file,
              name,
              extension,
              preview: URL.createObjectURL(file)
            });
          })
          .catch((err) => {
            console.log(err);
          });
      }
    },
    [setFieldValue]
  );

  return (
    <FormikProvider value={formik}>
      <Form autoComplete="off" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card sx={{ py: 10, px: 3 }}>
              {isEdit && (
                <Label
                  color={values.status !== 'active' ? 'error' : 'success'}
                  sx={{ textTransform: 'uppercase', position: 'absolute', top: 24, right: 24 }}
                >
                  {values.status}
                </Label>
              )}

              <Box sx={{ mb: 5 }}>
                <UploadAvatar
                  accept="image/*"
                  file={values.imageUrl}
                  maxSize={3145728}
                  onDrop={handleDrop}
                  error={Boolean(touched.imageUrl && errors.imageUrl)}
                  caption={
                    <Typography
                      variant="caption"
                      sx={{
                        mt: 2,
                        mx: 'auto',
                        display: 'block',
                        textAlign: 'center',
                        color: 'text.secondary'
                      }}
                    >
                      Allowed *.jpeg, *.jpg, *.png, *.gif
                      <br /> max size of {fData(3145728)}
                    </Typography>
                  }
                />
                <FormHelperText error sx={{ px: 2, textAlign: 'center' }}>
                  {touched.imageUrl && errors.imageUrl}
                </FormHelperText>
              </Box>

              {isEdit && (
                <FormControlLabel
                  labelPlacement="start"
                  control={
                    <Switch
                      onChange={(event) => setFieldValue('status', event.target.checked ? 'banned' : 'active')}
                      checked={values.status !== 'active'}
                    />
                  }
                  label={
                    <>
                      <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                        Banned
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Apply disable account
                      </Typography>
                    </>
                  }
                  sx={{ mx: 0, mb: 3, width: 1, justifyContent: 'space-between' }}
                />
              )}

              <FormControlLabel
                labelPlacement="start"
                control={<Switch {...getFieldProps('isVerified')} checked={values.isVerified} />}
                label={
                  <>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                      Email Verified
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Disabling this will automatically send the user a verification email
                    </Typography>
                  </>
                }
                sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
              />
            </Card>
          </Grid>

          <Grid item xs={12} md={8}>
            <Card sx={{ p: 3 }}>
              <Stack spacing={3}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                  <TextField
                    fullWidth
                    label="First Name"
                    {...getFieldProps('firstName')}
                    error={Boolean(touched.firstName && errors.firstName)}
                    helperText={touched.firstName && errors.firstName}
                  />
                  <TextField
                    fullWidth
                    label="Last Name"
                    {...getFieldProps('lastName')}
                    error={Boolean(touched.lastName && errors.lastName)}
                    helperText={touched.lastName && errors.lastName}
                  />
                </Stack>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                  {!isEdit && (
                    <TextField
                      fullWidth
                      label="User Name"
                      {...getFieldProps('userName')}
                      error={Boolean(touched.userName && errors.userName)}
                      helperText={touched.userName && errors.userName}
                    />
                  )}
                  <TextField
                    fullWidth
                    label="Email"
                    {...getFieldProps('email')}
                    error={Boolean(touched.email && errors.email)}
                    helperText={touched.email && errors.email}
                  />
                </Stack>

                {!isEdit && (
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                    <TextField
                      fullWidth
                      type="password"
                      label="Password"
                      {...getFieldProps('password')}
                      error={Boolean(touched.password && errors.password)}
                      helperText={touched.password && errors.password}
                    />
                    <TextField
                      fullWidth
                      type="password"
                      label="Confirm Password"
                      {...getFieldProps('confirmPassword')}
                      error={Boolean(touched.confirmPassword && errors.confirmPassword)}
                      helperText={touched.confirmPassword && errors.confirmPassword}
                    />
                  </Stack>
                )}
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 3, sm: 2 }}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    {...getFieldProps('phoneNumber')}
                    error={Boolean(touched.phoneNumber && errors.phoneNumber)}
                    helperText={touched.phoneNumber && errors.phoneNumber}
                  />
                  {/* Ẩn text filed */}
                  {matches ? <TextField style={{ opacity: 0, pointerEvents: 'none' }} fullWidth /> : null}
                </Stack>

                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                  <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                    {!isEdit ? 'Create User' : 'Save Changes'}
                  </LoadingButton>
                </Box>
              </Stack>
            </Card>
          </Grid>
        </Grid>
      </Form>
    </FormikProvider>
  );
}
