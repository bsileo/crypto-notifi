<template>
  <div class="container gutter--md pb-3">
    <Header></Header>
    <router-view />
    <Footer></Footer>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { NotifiUser } from "@/models/NotifiUser";
import { userModule } from "@/store/user";
import { computed } from "vue";
import Footer from "@/components/footer.vue";
import Header from "@/components/header.vue";

export default defineComponent({
  name: "Home",
  components: {
    Header,
    Footer,
  },
  data() {
    return {};
  },
  provide() {
    return {
      user: computed(() => userModule.user as NotifiUser),
    };
  },
  computed: {},
  methods: {},
});
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
