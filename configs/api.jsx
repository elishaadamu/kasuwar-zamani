import axios from "axios";

// Set withCredentials to true for all requests globally
axios.defaults.withCredentials = true;

// Add a response interceptor
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== "undefined") {
        const currentPath = window.location.pathname;
        // Avoid redirect loop if already on a signin page or the home page
        if (
          currentPath !== "/" &&
          currentPath !== "/signin" &&
          currentPath !== "/vendor-signin" &&
          currentPath !== "/delivery-signin"
        ) {
          localStorage.removeItem("user");
          window.location.href = "/";
        } else {
          // On home/signin pages, just clear the stored user data silently
          localStorage.removeItem("user");
        }
      }
    }
    return Promise.reject(error);
  }
);


export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000",
  ENDPOINTS: {
    AUTH: {
      SIGNUP: "/auth/register",
      SIGNIN: "/auth/login",
      LOGOUT: "/auth/logout",
    },
    ACCOUNT: {
      CREATE: "/account/create/",
      GET: "/account/",
      walletBalance: "/wallet/",
      allWalletTransactions: "/wallet/",
    },
    ORDER: {
      GET_ALL: "/order/user/",
      GET_SELLER_ORDERS: "/orders/seller",
      UPDATE_STATUS: "/orders/status",
      CREATE: "/order/create",
    },
    PROFILE: {
      UPDATE: "/user/update/",
      GET: "/user/profile",
      UPDATE_USER: "/user/update",
      DELETE: "/user/delete/",
      SHIPPING: "/profile/shipping",
    },
    SECURITY: {
      SET_PIN: "/wallet/setPin",
      UPDATE_PIN: "/wallet/changePin",
      CHANGE_PASSWORD: "/security/change-password",
      RESET_PASSWORD: "/security/reset-password",
    },
    USER: {
      DELETE: "/user/delete/",
    },
    CUSTOMER: {
      SIGNIN: "/customer/login",
    },
    VENDOR: {
      SIGNIN: "/vendor/login",
      GET_ALL: "/vendor/stats/",
      UPDATE_IMAGES: "/vendor/update-images/",
    },
    PRODUCT: {
      ADD: "/product/",
      GET_SELLER_PRODUCTS: "/product/my-products/",
      GET_PRODUCT: "/product",
      GET_SINGLE_PRODUCT: "/product/", // Append product ID
      UPDATE: "/product/",
      DELETE: "/product/",
    },
    CATEGORY: {
      GET_ALL: "/category",
    },
    RATING: {
      ADD: "/rating",
      GET_BY_VENDOR: "/rating/", // Append vendorId
      DELETE: "/rating/", // Append vendorId/userId
    },
    DELIVERY: {
      CREATE: "/delivery/create-delivery-man",
      LOGIN: "/delivery/login",
      UPDATE: "/delivery/delivery-man",
      CREATE_WALLET: "/wallet/create-wallet/",
      REQUEST_DELIVERY: "/delivery-request/create/",
      GET_USER_REQUESTS: "/delivery-request/all-user-requests/", // append userId
      PAY_DELIVERY: "/delivery-request/pay/",
      GET_DELIVERY: "/delivery-request/my-requests/",
      ACCEPT_DELIVERY: "/delivery-request/delivery-man-accept/",
      REJECT_DELIVERY: "/delivery-request/delivery-man-reject/",
    },
    DELIVERY_WITHDRAWAL: {
      CREATE: "/withdrawal", // POST with userId in payload
      GET_BY_USER: "/withdrawal/", // append userId
    },
    SUPPORT: {
      CREATE_TICKET: "/support/tickets",
      GET_TICKETS: "/support/tickets",
      GET_TICKET: "/support/tickets/",
    },
    MESSAGES: {
      GET_ALL: "/messages",
      SEND: "/messages/send",
      MARK_READ: "/messages/read/",
      DELETE: "/messages/",
    },
    FUNDING_HISTORY: {
      GET: "/wallet/",
    },
    REFERRAL: {
      GET_COMMISSIONS: "/referral/commissions/", // append userId
      GET_PROGRESS: "/referral/progress/", // append userId
    },
    SUBSCRIPTION: {
      SUBSCRIBE: "/sub/subscribe", // POST with { vendorId, planId }
      CHECK_STATUS: "/sub/check-status/", // append vendorId
      GET_DETAILS: "/sub/vendor-subscription/", // append vendorId
      GET_ALL: "/subscribe",
      GET_SINGLE: "/subscribe/plan/", // /subscribe/plan/{planId}
      GET_BY_PACKAGE: "/subscribe/plan-package/", // /subscribe/plan-package/{package}
    },
    BANNERS: {
      GET_ALL: "/banner",
    },
    CATEGORY: {
      GET_ALL: "/category/",
    },
    COUPON: {
      CREATE: "/coupons/create",
      GET_ALL: "/coupons/", // append creatorId
      UPDATE: "/coupons/", // append couponId
      DELETE: "/coupons/", // append couponId
      VALIDATE: "/coupons/validate",
    },
    FOLLOW: {
      FOLLOW_VENDOR: "/follow", // POST with { followerId, followingId }
      GET_FOLLOWING: "/follow/followings/", // append userId
      GET_FOLLOWERS: "/follow/my-followers/", // append vendorId
      CHECK_FOLLOW: "/follow/check", // POST with { followerId, followingId }
    },
    POS: {
      GET_ORDERS: "/order/user/", // GET user POS orders GET_ALL: "/order/user/",
      PAY: "/pos/pay/", // POST with { pin }, append posOrderId
    },
  },
  SHIPPING_FEE: {
    GET_ALL: "/shipping-fee/all",
  },
};

export const apiUrl = (endpoint) => `${API_CONFIG.BASE_URL}${endpoint}`;
