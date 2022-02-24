<template>
  <router-view />
</template>

<script lang="ts">
import Moralis from "moralis";
import { computed, defineComponent } from "vue";
import { NotifiUser } from "./models/NotifiUser";
import { userModule } from "./store/user";

export default defineComponent({
  name: "App",
  components: {},
  provide() {
    return {
      user: computed(() => userModule.user as NotifiUser),
      NotifiUser: computed(() => {
        const us = Moralis.User.current();
        if (us) {
          const u = new NotifiUser({ id: us.id });
          return u;
        }
        return undefined;
      }),
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
