<template>
  <Header></Header>
  <router-view v-slot="{ Component }">
    <keep-alive exclude="Subscribe">
      <component :is="Component" />
    </keep-alive>
  </router-view>
  <Footer></Footer>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Footer from "@/components/footer.vue";
import Header from "@/components/header.vue";

export default defineComponent({
  name: "ProtectedPages",
  components: {
    Header,
    Footer,
  },
});
</script>

<style scoped></style>
