import { DisplayMode } from "@/notifi_types";
import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import Login from "@/views/Login.vue";
const Positions = () =>
  import(/* webpackChunkName: "group-user" */ "@/views/Positions.vue");
const Subscriptions = () =>
  import(/* webpackChunkName: "group-user" */ "@/views/Subscriptions.vue");

const Protocols = () =>
  import(/* webpackChunkName: "group-user" */ "@/views/Protocols.vue");

const MyAccount = () =>
  import(/* webpackChunkName: "group-user" */ "@/views/MyAccount.vue");

const MyChannels = () =>
  import(/* webpackChunkName: "group-user" */ "@/views/MyChannels.vue");

const Subscription = () =>
  import(/* webpackChunkName: "group-user" */ "@/views/Subscription.vue");

const Subscribe = () =>
  import(/* webpackChunkName: "group-user" */ "@/components/subscribe.vue");

const EmailConfirm = () =>
  import(/* webpackChunkName: "email" */ "@/views/EmailConfirm.vue");
const Groups = () =>
  import(/* webpackChunkName: "group-user" */ "@/views/Groups.vue");
const Manager = () =>
  import(/* webpackChunkName: "group-manager" */ "@/views/Manager.vue");
const ManagerSelect = () =>
  import(/* webpackChunkName: "group-manager" */ "@/views/ManagerSelect.vue");
const ManagerSummary = () =>
  import(/* webpackChunkName: "group-manager" */ "@/views/ManagerSummary.vue");
const ManagerSend = () =>
  import(/* webpackChunkName: "group-manager" */ "@/views/ManagerSend.vue");
const ManagerSettings = () =>
  import(/* webpackChunkName: "group-manager" */ "@/views/ManagerSettings.vue");
const ManagerSubscription = () =>
  import(
    /* webpackChunkName: "group-manager" */ "@/views/ManagerSubscription.vue"
  );
const ManagerCategories = () =>
  import(
    /* webpackChunkName: "group-manager" */ "@/views/ManagerCategories.vue"
  );
const ManagerHistory = () =>
  import(/* webpackChunkName: "group-manager" */ "@/views/ManagerHistory.vue");
const ManagerContracts = () =>
  import(
    /* webpackChunkName: "group-manager" */ "@/views/ManagerContracts.vue"
  );

const AlertView = () =>
  import(
    /* webpackChunkName: "group-user" */ "@/views/AlertView.vue"
  );


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
    path: "/email_confirm",
    name: "Confirm",
    component: EmailConfirm,
  },
  {
    path: "/",
    name: "ProtectedPages",
    component: ProtectedPages,
    props: true,
    beforeEnter: RouterGuard.App,
    children: [
      {
        path: "/",
        name: "Home",
        beforeEnter: RouterGuard.returningUser,
        redirect: { name: DisplayMode.protocols },
      },
      {
        path: "/positions",
        name: DisplayMode.positions,
        component: Positions,
      },
      {
        path: "/groups",
        name: "Groups",
        component: Groups,
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
        path: "/my_account",
        name: "My Account",
        component: MyAccount,
      },
      {
        path: "/my_channels",
        name: "My Channels",
        component: MyChannels,
      },
      {
        path: "/my_channels/:channelID",
        name: "My Channel",
        component: MyChannels,
      },
      {
        path: "/subscription",
        name: "Subscription",
        component: Subscription,
        redirect: "/subscription/new",
        sensitive: true,
        props: true,
        children: [
          {
            path: ":typeName/:subscriptionID",
            name: "SubscriptionEditor",
            component: Subscribe,
            props: true,
          },
          {
            path: ":typeName?",
            name: "SubscriptionNew",
            component: Subscribe,
            props: true,
          },
        ],
      },
      {
        path: "/alert/:alertID",
        name: "AlertView",
        component: AlertView,
        props: true,
      },
      {
        path: "/manager",
        name: "Manager",
        redirect: "/manager/select",
        component: Manager,
        sensitive: true,
        props: true,
        meta: { manager: true },
        children: [
          {
            path: "select",
            name: "ManageSelect",
            component: ManagerSelect,
            meta: { manager: true },
          },
          {
            path: ":protocolID",
            name: "Manager",
            props: true,
            component: ManagerSummary,
            meta: { manager: true },
          },
          {
            path: ":protocolID/send",
            name: "ManagerSend",
            props: true,
            component: ManagerSend,
            meta: { manager: true },
          },
          {
            path: ":protocolID/settings",
            name: "ManagerSettings",
            props: true,
            component: ManagerSettings,
            meta: { manager: true },
          },
          {
            path: ":protocolID/subscription",
            name: "ManagerSubscription",
            props: true,
            component: ManagerSubscription,
            meta: { manager: true },
          },
          {
            path: ":protocolID/categories",
            name: "ManageCategories",
            props: true,
            component: ManagerCategories,
            meta: { manager: true },
          },
          {
            path: ":protocolID/history",
            name: "ManageSubscription",
            props: true,
            component: ManagerHistory,
            meta: { manager: true },
          },
          {
            path: ":protocolID/contracts",
            name: "ManageContracts",
            props: true,
            component: ManagerContracts,
            meta: { manager: true },
          },
        ],
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
