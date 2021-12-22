import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import { useCallback, useEffect } from 'react';
import { Form, FormikProvider, useFormik } from 'formik';
// material
import { styled } from '@mui/material/styles';
import { LoadingButton } from '@mui/lab';
import {
  Card,
  Grid,
  Stack,
  Select,
  TextField,
  InputLabel,
  Typography,
  FormControl,
  FormHelperText
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
// routes
import { PATH_DASHBOARD } from '../../../routes/paths';
//
import { QuillEditor } from '../../editor';
import { UploadMultiFile } from '../../upload';
import { postProduct } from '../../../redux/slices/product';
import { getBrands } from '../../../redux/slices/brand';

const convertBase64 = (file) =>
  new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.readAsDataURL(file);
    fileReader.onload = () => {
      resolve(fileReader.result);
    };
    fileReader.onerror = (error) => {
      reject(error);
    };
  });

const imageJSONForm = async (imageFile) => {
  const imagePath = imageFile.path.split('.');
  return {
    name: imagePath[0],
    extension: `.${imagePath[1]}`,
    data: await convertBase64(imageFile)
  };
};

// ----------------------------------------------------------------------

const BRAND_OPTIONS = [
  { id: '00040000-ac17-0242-d10c-08d9a8dfa1ce', name: 'Luu-dev Brand', description: 'This brand vip!' },
  { id: '11140000-ac17-0242-d10c-08d9a8dfa1ce', name: 'Error test', description: 'Error!' }
];

const LabelStyle = styled(Typography)(({ theme }) => ({
  ...theme.typography.subtitle2,
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(1)
}));

// ----------------------------------------------------------------------

ProductNewForm.propTypes = {
  isEdit: PropTypes.bool,
  currentProduct: PropTypes.object
};

export default function ProductNewForm({ isEdit, currentProduct }) {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();
  const brandList = useSelector((state) => state.brand.brands);
  useEffect(() => {
    dispatch(getBrands());

    // GET BRANDS
  }, [dispatch]);
  console.log(brandList);
  const NewProductSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    description: Yup.string().required('Description is required'),
    image: Yup.array().min(1, 'Image is required').max(1, 'Just allow 1 image'),
    rate: Yup.number().required('Rating is required')
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: currentProduct?.name || '',
      description: currentProduct?.description || '',
      image: currentProduct?.image || [],
      rate: currentProduct?.rate || '',
      brandId: currentProduct?.brand.id || BRAND_OPTIONS[0].id
    },
    validationSchema: NewProductSchema,
    onSubmit: async (values, { setSubmitting, resetForm, setErrors }) => {
      function excuteAfterSubmit({ isSuccess, errorString }) {
        setSubmitting(false);
        if (isSuccess) {
          resetForm();
          enqueueSnackbar('Create success', { variant: 'success' });
          navigate(PATH_DASHBOARD.eCommerce.list);
        } else {
          if (!errorString) errorString = 'Error but can not find out error string!';
          enqueueSnackbar(errorString, { variant: 'error' });
          setErrors(errorString);
        }
      }

      try {
        await dispatch(postProduct({ ...values, image: await imageJSONForm(values.image[0]) }, excuteAfterSubmit));
      } catch (error) {
        console.error(error);
        setSubmitting(false);
        setErrors(error);
      }
    }
  });

  const { errors, values, touched, handleSubmit, isSubmitting, setFieldValue, getFieldProps } = formik;

  const handleDrop = useCallback(
    (acceptedFiles) => {
      setFieldValue(
        'image',
        acceptedFiles.map((file) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file)
          })
        )
      );
    },
    [setFieldValue]
  );

  const handleRemoveAll = () => {
    setFieldValue('image', []);
  };

  const handleRemove = (file) => {
    const filteredItems = values.images.filter((_file) => _file !== file);
    setFieldValue('image', filteredItems);
  };

  return (
    <FormikProvider value={formik}>
      <Form noValidate autoComplete="off" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card sx={{ p: 3 }}>
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="Product Name"
                  {...getFieldProps('name')}
                  error={Boolean(touched.name && errors.name)}
                  helperText={touched.name && errors.name}
                />

                <div>
                  <LabelStyle>Description</LabelStyle>
                  <QuillEditor
                    simple
                    id="product-description"
                    value={values.description}
                    onChange={(val) => setFieldValue('description', val)}
                    error={Boolean(touched.description && errors.description)}
                  />
                  {touched.description && errors.description && (
                    <FormHelperText error sx={{ px: 2 }}>
                      {touched.description && errors.description}
                    </FormHelperText>
                  )}
                </div>

                <div>
                  <LabelStyle>Add Images</LabelStyle>
                  <UploadMultiFile
                    showPreview
                    maxSize={3145728}
                    accept="image/*"
                    files={values.image}
                    onDrop={handleDrop}
                    onRemove={handleRemove}
                    onRemoveAll={handleRemoveAll}
                    error={Boolean(touched.image && errors.image)}
                  />
                  {touched.image && errors.image && (
                    <FormHelperText error sx={{ px: 2 }}>
                      {touched.image && errors.image}
                    </FormHelperText>
                  )}
                </div>
              </Stack>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Stack spacing={3}>
              <Card sx={{ p: 3 }}>
                <Stack spacing={3}>
                  <TextField
                    InputProps={{
                      type: 'number'
                    }}
                    fullWidth
                    label="Rating"
                    {...getFieldProps('rate')}
                    error={Boolean(touched.rate && errors.rate)}
                    helperText={touched.rate && errors.rate}
                  />

                  <FormControl fullWidth>
                    <InputLabel>Brand</InputLabel>
                    <Select label="" native {...getFieldProps('brandId')} value={values.brandId}>
                      {brandList.map((brand) => (
                        <option key={brand.id} value={brand.id}>
                          {brand.name}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>
              </Card>

              <LoadingButton type="submit" fullWidth variant="contained" size="large" loading={isSubmitting}>
                {!isEdit ? 'Create Product' : 'Save Changes'}
              </LoadingButton>
            </Stack>
          </Grid>
        </Grid>
      </Form>
    </FormikProvider>
  );
}
