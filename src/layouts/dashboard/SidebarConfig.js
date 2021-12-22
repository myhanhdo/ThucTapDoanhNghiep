// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// components
import SvgIconStyle from '../../components/SvgIconStyle';

// ----------------------------------------------------------------------

const getIcon = (name) => (
  <SvgIconStyle src={`/static/icons/navbar/${name}.svg`} sx={{ width: '100%', height: '100%' }} />
);

const ICONS = {
  cart: getIcon('ic_cart'),
  user: getIcon('ic_user'),
  banking: getIcon('ic_banking'),
  dashboard: getIcon('ic_dashboard'),
  booking: getIcon('ic_booking'),
  brand: getIcon('ic_brand')
};

const sidebarConfig = [
  // GENERAL
  // ----------------------------------------------------------------------
  {
    subheader: 'general',
    items: [
      {
        title: 'app',
        path: PATH_DASHBOARD.general.app,
        icon: ICONS.dashboard
      }
    ]
  },

  // MANAGEMENT
  // ----------------------------------------------------------------------
  {
    subheader: 'management',
    items: [
      // MANAGEMENT : USER
      {
        title: 'user',
        path: PATH_DASHBOARD.user.root,
        icon: ICONS.user,
        children: [
          { title: 'list', path: PATH_DASHBOARD.user.list },
          { title: 'create', path: PATH_DASHBOARD.user.newUser },
          { title: 'edit', path: PATH_DASHBOARD.user.editById }
        ]
      },

      // MANAGEMENT : E-COMMERCE
      {
        title: 'e-commerce',
        path: PATH_DASHBOARD.eCommerce.root,
        icon: ICONS.cart,
        children: [
          { title: 'list', path: PATH_DASHBOARD.eCommerce.list },
          { title: 'create', path: PATH_DASHBOARD.eCommerce.newProduct },
          { title: 'edit', path: PATH_DASHBOARD.eCommerce.editById }
        ]
      },

      // MANAGEMENT : BRAND
      {
        title: 'brand',
        path: PATH_DASHBOARD.brand.root,
        icon: ICONS.brand,
        children: [
          { title: 'list', path: PATH_DASHBOARD.brand.list },
          { title: 'create', path: PATH_DASHBOARD.brand.newBrand },
          { title: 'edit', path: PATH_DASHBOARD.brand.editById }
        ]
      }
    ]
  }
];

export default sidebarConfig;
