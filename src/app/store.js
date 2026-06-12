import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import storesReducer from '../features/stores/storeSlice';
import dashboardReducer from '../features/dashboard/dashboardSlice';
import ordersReducer from '../features/orders/ordersSlice';
import productsReducer from '../features/products/productsSlice';
import customersReducer from '../features/customers/customersSlice';
import discountsReducer from '../features/discounts/discountsSlice';
import themesReducer from '../features/themes/themesSlice';
import analyticsReducer from '../features/analytics/analyticsSlice';
import settingsReducer from '../features/settings/settingsSlice';
import subscriptionsReducer from '../features/subscriptions/subscriptionSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    stores: storesReducer,
    dashboard: dashboardReducer,
    orders: ordersReducer,
    products: productsReducer,
    customers: customersReducer,
    discounts: discountsReducer,
    themes: themesReducer,
    analytics: analyticsReducer,
    settings: settingsReducer,
    subscriptions: subscriptionsReducer,
  },
});
