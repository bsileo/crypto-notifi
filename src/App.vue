<template>
  <div>
    <router-view />
    <Footer></Footer>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Footer from "@/components/footer.vue";

export default defineComponent({
  name: "App",
  components: {
    Footer,
  },
});
</script>

<style>
#app {
  background-color: #fff;
}
</style>
