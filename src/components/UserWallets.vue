<template>
  <div class="flex pl-2 pt-3">
    <div class="row">
      <h3>Wallets</h3>
    </div>
    <div class="row pb-2" v-for="wallet in wallets" :key="wallet">
      <div class="flex sm6">
        {{ wallet }}
      </div>
      <div class="flex sm2">
        <va-button icon="delete" size="small"></va-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, inject, ref } from "vue";
import Moralis from "moralis";
import { NotifiUser, UserLevel } from "@/models/NotifiUser";

export default defineComponent({
  name: "UserWallets",
  components: {  },
  setup() {
    const user: NotifiUser | undefined = inject("user");
    const wallets = ref<string[]>([]);
    return { user, wallets };
  },
  data() {
    return {};
  },
  mounted() {
    this.fetchUserInfo();
  },

  computed: {},
  methods: {
    async fetchUserInfo(): Promise<void> {
      if (this.user) {
        this.wallets = this.user.get("accounts");
      }
    },
  },
});
</script>

<style scoped></style>
