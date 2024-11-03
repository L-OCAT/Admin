import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import NotFoundView from "@/components/common/NotFoundView.vue";
import MainView from "@/components/MainView.vue";
import IndexView from "@/components/IndexView.vue";
import { getProperty } from "@/utils/environment";

export const BASE_URL = getProperty("BASE_URL");

const routes: Array<RouteRecordRaw> = [
  {
    path: "/login",
    name: "IndexView",
    component: IndexView,
    meta: { requiresAuth: false },
  },
  {
    path: "/",
    name: "MainView",
    component: MainView,
  },
  {
    path: "/:pathMatch(.*)*",
    component: NotFoundView,
    meta: { title: "Not Found!", requiresAuth: false },
  },
];

const router = createRouter({
  history: createWebHistory(BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { top: 0 };
  },
});

export default router;
