<template>
  <div class="container gutter--md pb-3">
    <Header></Header>
    <router-view />
    <Footer></Footer>
  </div>
</template>

<script setup lang="ts">
import { provide } from "vue";
import { useUserStore } from "@/store/pinia_user";
import Footer from "@/components/footer.vue";
import Header from "@/components/header.vue";

const userStore = useUserStore();
provide("user", userStore.user);
</script>

<style scoped>
.logo {
  height: 50px;
  width: 80px;
}
.title {
  font-size: 2em;
  font-weight: bold;
  align-self: center;
  font-family: "Material Icons";
}
div {
  --va-dropdown-content-background: var(--va-background);
}
.va-modal__inner {
  max-width: 95%;
}
</style>
