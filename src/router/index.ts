import { DisplayMode } from "@/notifi_types";
import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import Login from "@/views/Login.vue";
const Positions = () =>
  import(/* webpackChunkName: "group-user" */ "@/views/Positions.vue");
const Subscriptions = () =>
  import(/* webpackChunkName: "group-user" */ "@/views/Subscriptions.vue");
const Protocols = () =>
  import(/* webpackChunkName: "group-user" */ "@/views/Protocols.vue");
const Subscribe = () =>
  import(/* webpackChunkName: "group-user" */ "@/components/subscribe.vue");
const ManagerSelect = () =>
  import(/* webpackChunkName: "group-manager" */ "@/views/ManagerSelect.vue");
const ProtocolManager = () =>
  import(/* webpackChunkName: "group-manager" */ "@/views/ProtocolManager.vue");

import ProtectedPages from "@/components/ProtectedPages.vue";
import RouterGuard from "./router.guard";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/login",
    name: "Login",
    component: Login,
    beforeEnter: RouterGuard.Login,
  },
  {
    path: "/",
    name: "ProtectedPages",
    component: ProtectedPages,
    beforeEnter: RouterGuard.App,
    children: [
      {
        path: "/",
        name: "Home",
        redirect: { name: DisplayMode.positions },
      },
      {
        path: "/positions",
        name: DisplayMode.positions,
        component: Positions,
      },
      {
        path: "/subscriptions",
        name: DisplayMode.subscriptions,
        component: Subscriptions,
      },
      {
        path: "/protocols",
        name: DisplayMode.protocols,
        component: Protocols,
      },
      {
        path: "/subscribe",
        name: "Subscribe",
        component: Subscribe,
      },
      {
        path: "manager/select",
        name: "ManageSelectProtocol",
        component: ManagerSelect,
        meta: { manager: true}
      },
      {
        path: "protocol/:id",
        name: "ManageProtocol",
        component: ProtocolManager,
        props: true,
        meta: { manager: true}
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
