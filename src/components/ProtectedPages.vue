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
        <template v-for="item in items" :key="item.to">
          <va-sidebar-item :active="item.active" :to="item.to">
            <va-sidebar-item-content>
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
          <component :is="Component" />
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

const moralis: any = inject("Moralis");
const userIsManager = computed((): boolean => {
  const u = moralis.User.current();
  return u && u.get("ProtocolManager");
});

const items = ref([
  { title: "Protocols", icon: "announcement", to: "/protocols" },
  { title: "Positions", icon: "radar", to: "/positions" },
  { title: "Subscriptions", icon: "dashboard", to: "/subscriptions" },
  { title: "Subscribe", icon: "loop", to: "/subscription" },
]);

if (userIsManager.value) {
  const manager = [
    { title: "Manager", icon: "admin_panel_settings", to: "/manager/select" },
  ];
  items.value.push(...manager);
}

const minimized = ref(false);
</script>

<style scoped></style>
