<template>
  <router-view />
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import { NotifiUser } from "./models/NotifiUser";
import { userModule } from "./store/user";

export default defineComponent({
  name: "App",
  components: { },
  provide() {
    return {
      user: computed(() => userModule.user as NotifiUser),
    };
  },

});
</script>

<style>
#app {
  background-color: #fff;
  overflow-x: clip;
}
</style>
