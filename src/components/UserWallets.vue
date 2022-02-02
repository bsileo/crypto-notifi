<template>
  <div class="flex pl-2 pt-3">
    <div class="row">
      <h3>{{ title }}</h3>
    </div>
    <div class="row pb-2" v-for="wallet in wallets" :key="wallet">
      <div class="flex sm6">
        {{ wallet }}
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
  components: {},
  props: {
    primary: { type: Boolean, required: false, default: false },
  },
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

  computed: {
    title(): string {
      return this.primary ? "Wallet:" : "Wallets:";
    },
  },
  methods: {
    async fetchUserInfo(): Promise<void> {
      if (this.user) {
        if (this.primary) {
          const wal = this.user.get("accounts");
          this.wallets = [wal[0]];
        } else {
          this.wallets = this.user.get("accounts");
        }
      }
    },
  },
});
</script>

<style scoped></style>
