<template>
  <Header></Header>
  <div class="row">
    <div class="flex xs1">
      <va-sidebar
        :minimized="minimized"
        textColor="dark"
        width="10rem"
        minimizedWidth="52px"
      >
        <va-sidebar-item @click="minimized = !minimized">
          <va-sidebar-item-content>
            <va-sidebar-item-title></va-sidebar-item-title>
            <va-icon name="menu" />
          </va-sidebar-item-content>
        </va-sidebar-item>
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
              <div>&nbsp;&nbsp;</div>
              <va-icon :name="item.icon" />
              <va-sidebar-item-title v-if="!minimized" style="height: 24px">
                {{ item.title }}
              </va-sidebar-item-title>
            </va-sidebar-item-content>
          </va-sidebar-item>
        </template>
      </va-sidebar>
    </div>
    <div class="flex xs10 ml-3">
      <router-view v-slot="{ Component }">
        <keep-alive exclude="Subscribe">
          <Suspense>
            <component :is="Component" />
            <template #fallback> Loading... </template>
          </Suspense>
        </keep-alive>
      </router-view>
    </div>
  </div>
  <Footer></Footer>
</template>

<script setup lang="ts">
import { computed, inject, ref } from "vue";
import Footer from "@/components/footer.vue";
import Header from "@/components/header.vue";
import { SidebarDescriptor } from "@/notifi_types";

const moralis: any = inject("Moralis");
const userIsManager = computed((): boolean => {
  const u = moralis.User.current();
  return u && u.get("ProtocolManager");
});

// eslint-disable-next-line no-undef
const props = defineProps({
  protocolID: { type: String, required: false },
});

const items = ref<SidebarDescriptor[]>([
  { title: "Protocols", icon: "announcement", to: "/protocols" },
  { title: "Positions", icon: "radar", to: "/positions" },
  { title: "Subscriptions", icon: "dashboard", to: "/subscriptions" },
  { title: "Subscribe", icon: "loop", to: "/subscription" },
]);

const activeRouteName = ref("");

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
  const items: SidebarDescriptor[] = [];
  if (props.protocolID != undefined && userIsManager.value) {
    items.push(
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
  return items;
});

const minimized = ref(false);
</script>

<style scoped></style>
