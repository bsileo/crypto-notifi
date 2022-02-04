<template>
  <div class="flex pl-2 pt-3">
    <div class="row">
      <h3>Membership Level</h3>
    </div>
    <div class="row">
      <p>
        Your account is currently on the <strong>{{ level }}</strong> Level. You hold <strong>{{tokens}}</strong> Notifi tokens.
      </p>
      <p class="pt-3">
        To increase levels,
        <va-button @click="openSwap" size="small" color="primary"
          >Swap</va-button
        >
        Avalanche tokens for Notifi tokens and keep them in your wallet.
      </p>
    </div>
    <div class="row">
      <UserWallets></UserWallets>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, inject } from "vue";
import Moralis from "moralis";
import { NotifiUser, UserLevel } from "@/models/NotifiUser";
import UserWallets from "@/components/UserWallets.vue";
import { userModule } from "@/store/user";

export default defineComponent({
  name: "Account",
  components: { UserWallets },
  setup() {
    const user: NotifiUser | undefined = inject("user");
    return { user };
  },
  data() {
    return {
      level: "Free" as UserLevel,
      tokens: 0,
    };
  },
  mounted() {
    this.fetchUserInfo();
  },
  computed: {},
  methods: {
    openSwap(): void {
      window.open("https://app.pangolin.exchange/#/swap");
    },
    async fetchUserInfo(): Promise<void> {
      if (this.user) {
        this.level = userModule.currentLevel;
        this.tokens = userModule.NotifiTokens;
      }
    },
  },
});
</script>

<style scoped></style>
