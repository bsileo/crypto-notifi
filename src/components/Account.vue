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
        native tokens for Notifi tokens and keep the in your wallet.
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, inject } from "vue";
import Moralis from "moralis";
import { NotifiUser, UserLevel } from "@/models/NotifiUser";

export default defineComponent({
  name: "Account",
  components: {},
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
  updated() {
    this.fetchUserInfo();
  },
  computed: {},
  methods: {
    async fetchUserInfo(): Promise<void> {
      if (this.user) {
        this.level = this.user.currentLevel();
        this.tokens = this.user.tokenBalance();
      }
    },
  },
});
</script>

<style scoped></style>
