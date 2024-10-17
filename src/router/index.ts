import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import NotFoundView from "@/components/common/NotFoundView.vue";
import { getProperty } from "@/utils/environment";
import MainView from "@/components/MainView.vue";
import { isAuthenticated } from "@/utils/token-utils";
import IndexView from "@/components/login/IndexView.vue";

const DEFAULT_TITLE = getProperty("APP_NAME");
const DEFUALT_URL = getProperty("BASE_URL");

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Login",
    component: IndexView,
    meta: { requiresAuth: false },
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    component: MainView,
  },
  {
    path: "/:pathMatch(.*)*",
    component: NotFoundView,
    meta: { title: "Not Found!", requiresAuth: false },
  },
];

const router = createRouter({
  history: createWebHistory(DEFUALT_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { top: 0 };
  },
});

router.beforeEach((to, from, next) => {
  document.title = (to.meta.title as string) || DEFAULT_TITLE;

  const requiresAuth = to.matched.some(
    (record) => record.meta.requiresAuth !== false
  );

  if (requiresAuth && !isAuthenticated()) {
    alert("인증이 필요한 페이지입니다.");
    return next({ name: "Login" });
  }

  if (to.name === "Login" && isAuthenticated()) {
    return next({ name: "Dashboard" });
  }

  next();
});

export default router;
