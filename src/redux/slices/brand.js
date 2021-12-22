import { sum, map, filter, uniqBy, reject } from 'lodash';
import { createSlice } from '@reduxjs/toolkit';
// utils
import axios from '../../utils/axios';

// ----------------------------------------------------------------------

const initialState = {
  isLoading: false,
  error: false,
  brands: [],
  brand: null,
  sortBy: null,
  filters: {
    gender: [],
    category: 'All',
    colors: [],
    priceRange: '',
    rating: ''
  },
  checkout: {
    activeStep: 0,
    cart: [],
    subtotal: 0,
    total: 0,
    discount: 0,
    shipping: 0,
    billing: null
  }
};

const slice = createSlice({
  name: 'brand',
  initialState,
  reducers: {
    // START LOADING
    startLoading(state) {
      state.isLoading = true;
    },

    // HAS ERROR
    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },

    // GET BRANDS
    getBrandsSuccess(state, action) {
      state.isLoading = false;
      state.brands = action.payload;
    },

    // GET BRAND
    getBrandSuccess(state, action) {
      state.isLoading = false;
      state.brand = action.payload;
    },

    // DELETE BRAND
    deleteBrand(state, action) {
      state.brands = reject(state.brands, { id: action.payload });
    },

    //  SORT & FILTER BRANDS
    sortByBrands(state, action) {
      state.sortBy = action.payload;
    },

    filterBrands(state, action) {
      state.filters.gender = action.payload.gender;
      state.filters.category = action.payload.category;
      state.filters.colors = action.payload.colors;
      state.filters.priceRange = action.payload.priceRange;
      state.filters.rating = action.payload.rating;
    },

    // CHECKOUT
    getCart(state, action) {
      const cart = action.payload;

      const subtotal = sum(cart.map((brand) => brand.price * brand.quantity));
      const discount = cart.length === 0 ? 0 : state.checkout.discount;
      const shipping = cart.length === 0 ? 0 : state.checkout.shipping;
      const billing = cart.length === 0 ? null : state.checkout.billing;

      state.checkout.cart = cart;
      state.checkout.discount = discount;
      state.checkout.shipping = shipping;
      state.checkout.billing = billing;
      state.checkout.subtotal = subtotal;
      state.checkout.total = subtotal - discount;
    },

    addCart(state, action) {
      const brand = action.payload;
      const isEmptyCart = state.checkout.cart.length === 0;

      if (isEmptyCart) {
        state.checkout.cart = [...state.checkout.cart, brand];
      } else {
        state.checkout.cart = map(state.checkout.cart, (_brand) => {
          const isExisted = _brand.id === brand.id;
          if (isExisted) {
            return {
              ..._brand,
              quantity: _brand.quantity + 1
            };
          }
          return _brand;
        });
      }
      state.checkout.cart = uniqBy([...state.checkout.cart, brand], 'id');
    },

    deleteCart(state, action) {
      const updateCart = filter(state.checkout.cart, (item) => item.id !== action.payload);

      state.checkout.cart = updateCart;
    },

    resetCart(state) {
      state.checkout.activeStep = 0;
      state.checkout.cart = [];
      state.checkout.total = 0;
      state.checkout.subtotal = 0;
      state.checkout.discount = 0;
      state.checkout.shipping = 0;
      state.checkout.billing = null;
    },

    onBackStep(state) {
      state.checkout.activeStep -= 1;
    },

    onNextStep(state) {
      state.checkout.activeStep += 1;
    },

    onGotoStep(state, action) {
      const goToStep = action.payload;
      state.checkout.activeStep = goToStep;
    },

    increaseQuantity(state, action) {
      const brandId = action.payload;
      const updateCart = map(state.checkout.cart, (brand) => {
        if (brand.id === brandId) {
          return {
            ...brand,
            quantity: brand.quantity + 1
          };
        }
        return brand;
      });

      state.checkout.cart = updateCart;
    },

    decreaseQuantity(state, action) {
      const brandId = action.payload;
      const updateCart = map(state.checkout.cart, (brand) => {
        if (brand.id === brandId) {
          return {
            ...brand,
            quantity: brand.quantity - 1
          };
        }
        return brand;
      });

      state.checkout.cart = updateCart;
    },

    createBilling(state, action) {
      state.checkout.billing = action.payload;
    },

    applyDiscount(state, action) {
      const discount = action.payload;
      state.checkout.discount = discount;
      state.checkout.total = state.checkout.subtotal - discount;
    },

    applyShipping(state, action) {
      const shipping = action.payload;
      state.checkout.shipping = shipping;
      state.checkout.total = state.checkout.subtotal - state.checkout.discount + shipping;
    },

    // POST BRAND
    postBrandSuccess(state, action) {
      state.isLoading = false;
    }
  }
});

// Reducer
export default slice.reducer;

// Actions
export const {
  getCart,
  addCart,
  resetCart,
  onGotoStep,
  onBackStep,
  onNextStep,
  deleteCart,
  deleteBrand,
  createBilling,
  applyShipping,
  applyDiscount,
  filterBrands,
  sortByBrands,
  increaseQuantity,
  decreaseQuantity
} = slice.actions;

// ----------------------------------------------------------------------
// Lấy danh sách brands
export function getBrands() {
  return async (dispatch) => {
    const body = {
      advancedSearch: {
        fields: ['id'],
        keyword: ''
      },
      keyword: '',
      pageNumber: 1,
      pageSize: 1000,
      orderBy: ['id']
    };

    dispatch(slice.actions.startLoading());
    try {
      const response = await axios.post('/v1/brands/search', body);
      dispatch(slice.actions.getBrandsSuccess(response.data.data));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

// ----------------------------------------------------------------------

export function getBrand(name) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await axios.get('/api/brands/brand', {
        params: { name }
      });
      dispatch(slice.actions.getBrandSuccess(response.data.brand));
    } catch (error) {
      console.error(error);
      dispatch(slice.actions.hasError(error));
    }
  };
}

// ----------------------------------------------------------------------

export function postBrand(newBrand, myCallBack) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await axios.post('/v1/brands', newBrand);
      dispatch(slice.actions.postBrandSuccess());
      myCallBack({ isSuccess: true, errorString: '' });
    } catch (error) {
      dispatch(slice.actions.hasError(error.exception));
      myCallBack({ isSuccess: false, errorString: error.exception });
    }
  };
}
