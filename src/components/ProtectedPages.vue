<template>
  <div class="app-layout">
    <Header></Header>
    <div class="app-layout__content">
      <div
        class="app-layout__sidebar-wrapper"
        :class="{ minimized: isSidebarMinimized }"
      >
        <div v-if="isFullScreenSidebar" class="d-flex justify--end">
          <va-button
            class="px-4 py-4"
            icon="close"
            flat
            color="dark"
            @click="onCloseSidebarButtonClick"
          />
        </div>
        <va-sidebar
          :minimized="minimized"
          textColor="dark"
          :width="sidebarWidth"
          :minimizedWidth="sidebarMinimizedWidth"
        >
          <template v-for="item in items" :key="item.to">
            <va-sidebar-item
              :active="isRouteActive(item)"
              @click="setRouteActive(item)"
              :to="item.to"
              :text-color="item.text_color"
            >
              <va-sidebar-item-content>
                <va-icon :name="item.icon" />
                <va-sidebar-item-title v-if="!minimized" style="height: 24px">
                  {{ item.title }}
                </va-sidebar-item-title>
              </va-sidebar-item-content>
            </va-sidebar-item>
          </template>
          <template v-for="item in managerItems" :key="item.to">
            <va-sidebar-item
              :active="isRouteActive(item)"
              @click="setRouteActive(item)"
              :to="item.to"
              :text-color="item.text_color"
            >
              <va-sidebar-item-content>
                <div v-show="!minimized">&nbsp;&nbsp;</div>
                <va-icon :name="item.icon" />
                <va-sidebar-item-title v-if="!minimized" style="height: 24px">
                  {{ item.title }}
                </va-sidebar-item-title>
              </va-sidebar-item-content>
            </va-sidebar-item>
          </template>
          <va-sidebar-item to="#" @click.prevent="logout" text-color="danger">
            <va-sidebar-item-content>
              <va-icon name="logout" color="danger" />
              <va-sidebar-item-title
                text-color="danger"
                v-show="!minimized"
                style="height: 24px"
                >Logout</va-sidebar-item-title
              >
            </va-sidebar-item-content>
          </va-sidebar-item>
        </va-sidebar>
      </div>
      <div class="app-layout__page">
        <div class="layout fluid gutter--md">
          <router-view v-slot="{ Component }">
            <keep-alive>
              <Suspense :key="$route.fullPath">
                <component :is="Component" :key="$route.fullPath" />
                <template #fallback> Loading... </template>
              </Suspense>
            </keep-alive>
          </router-view>
        </div>
      </div>
    </div>
  </div>
  <Footer></Footer>
</template>

<script setup lang="ts">
import { computed, inject, onBeforeUnmount, onMounted, ref } from "vue";
import Footer from "@/components/footer.vue";
import Header from "@/components/header.vue";
import { SidebarDescriptor } from "@/notifi_types";
import { onBeforeRouteUpdate, useRoute, useRouter } from "vue-router";
import { appModule } from "@/store/app";

const router = useRouter();
const moralis: any = inject("Moralis");
const userIsManager = computed((): boolean => {
  const u = moralis.User.current();
  return u && u.get("ProtocolManager");
});

// eslint-disable-next-line no-undef
const props = defineProps({
  protocolID: { type: String, required: false },
  subscriptionID: { type: String, required: false },
  typeName: { type: String, required: false },
});

const items = ref<SidebarDescriptor[]>([
  { title: "Protocols", icon: "announcement", to: "/protocols" },
  { title: "Positions", icon: "radar", to: "/positions" },
  { title: "Subscriptions", icon: "dashboard", to: "/subscriptions" },
  { title: "Subscribe", icon: "loop", to: "/subscription" },
  { title: "My Account", icon: "manage_accounts", to: "/my_account" },
  { title: "My Channels", icon: "import_contacts", to: "/my_channels" },
]);

const route = useRoute();
const activeRouteName = ref(route.path);

const isRouteActive = (item: SidebarDescriptor) => {
  return activeRouteName.value === item.to;
};
const setRouteActive = (item: SidebarDescriptor) => {
  activeRouteName.value = item.to;
};

if (userIsManager.value) {
  const manager: SidebarDescriptor = {
    title: "Manager",
    icon: "admin_panel_settings",
    to: "/manager/select",
    text_color: "warning",
  };
  items.value.push(manager);
}

const managerItems = computed(() => {
  const mItems: SidebarDescriptor[] = [];
  if (props.protocolID != undefined && userIsManager.value) {
    mItems.push(
      ...[
        {
          title: "Send",
          icon: "notifications",
          to: `/manager/${props.protocolID}/send`,
          text_color: "warning",
        },
        {
          title: "Settings",
          icon: "settings",
          to: `/manager/${props.protocolID}/settings`,
          text_color: "warning",
        },
        {
          title: "Subscription",
          icon: "point_of_sale",
          to: `/manager/${props.protocolID}/subscription`,
          text_color: "warning",
        },
        {
          title: "Categories",
          icon: "tune",
          to: `/manager/${props.protocolID}/categories`,
          text_color: "warning",
        },
        {
          title: "History",
          icon: "view_list",
          to: `/manager/${props.protocolID}/history`,
          text_color: "warning",
        },
        {
          title: "Contracts",
          icon: "alt_route",
          to: `/manager/${props.protocolID}/contracts`,
          text_color: "warning",
        },
      ]
    );
  }
  return mItems;
});

const mobileBreakPointPX = 640;
const tabletBreakPointPX = 768;

const sidebarWidth = ref("14rem");
const sidebarMinimizedWidth = ref<undefined | string | number>(undefined);

const isMobile = ref(false);
const isTablet = ref(false);
const isSidebarMinimized = computed(() => appModule.isSidebarMinimized);
const checkIsTablet = () => window.innerWidth <= tabletBreakPointPX;
const checkIsMobile = () => window.innerWidth <= mobileBreakPointPX;

const onResize = () => {
  appModule.SidebarMinimized(checkIsTablet());

  isMobile.value = checkIsMobile();
  isTablet.value = checkIsTablet();
  sidebarMinimizedWidth.value = isMobile.value ? 0 : "4rem";
  sidebarWidth.value = isTablet.value ? "100%" : "16rem";
};

onMounted(() => {
  window.addEventListener("resize", onResize);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", onResize);
});

onBeforeRouteUpdate(() => {
  if (checkIsTablet()) {
    // Collapse sidebar after route change for Mobile
    appModule.SidebarMinimized(true);
  }
});

onResize();

const isFullScreenSidebar = computed(
  () => isTablet.value && !isSidebarMinimized.value
);

const onCloseSidebarButtonClick = () => {
  appModule.SidebarMinimized(true);
};

const minimized = computed({
  get: () => appModule.isSidebarMinimized,
  set: (value) => appModule.SidebarMinimized(value),
});

const logout = async () => {
  moralis.User.logOut();
  router.push({ name: "Login" });
};

moralis.onAccountChanged(async (account: string) => {
  const confirmed = confirm("Link this address to your account?");
  if (confirmed) {
    await moralis.link(account);
  }
});
</script>

<style lang="scss">
$mobileBreakPointPX: 640px;
$tabletBreakPointPX: 768px;

.app-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
  &__navbar {
    min-height: 4rem;
  }

  &__content {
    display: flex;
    height: calc(100vh - 4rem);
    flex: 1;

    @media screen and (max-width: $tabletBreakPointPX) {
      height: calc(100vh - 6.5rem);
    }

    .app-layout__sidebar-wrapper {
      position: relative;
      height: 100%;
      background: var(--va-white);

      @media screen and (max-width: $tabletBreakPointPX) {
        &:not(.minimized) {
          width: 100%;
          height: 100%;
          position: fixed;
          top: 0;
          z-index: 999;
        }

        .va-sidebar:not(.va-sidebar--minimized) {
          // Z-index fix for preventing overflow for close button
          z-index: -1;
          .va-sidebar__menu {
            padding: 0;
          }
        }
      }
    }
  }
  &__page {
    flex-grow: 2;
    overflow-y: scroll;
  }
}
</style>
