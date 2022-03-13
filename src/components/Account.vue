<template>
  <div class="flex pl-2 pt-3">
    <div class="row">
      <h3>Membership Level</h3>
    </div>
    <div class="row">
      <p>
        Your account is currently on the
        <strong>{{ userStore.currentLevel }}</strong> Level. You hold
        <strong>{{ userStore.NotifiTokens }}</strong> Notifi tokens.
      </p>
      <p class="pt-3">
        To enable access to more items below
        <va-button @click="openSwap" size="small" color="primary"
          >Swap</va-button
        >
        Avalanche tokens for Notifi tokens and keep them in your wallet.
      </p>
    </div>
    <div class="row">
      <UserWallets></UserWallets>
    </div>
    <div class="row">
      <h1>Cost Summary:</h1>
    </div>
    <div class="row userCostsSummary">
      <UserCostsSummary :balance="userStore.NotifiTokens"></UserCostsSummary>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import UserWallets from "@/components/UserWallets.vue";
import UserCostsSummary from "@/components/UserCostsSummary.vue";
import { useUserStore } from "@/store/pinia_user";

const userStore = useUserStore();

onMounted(() => {
  userStore.fetchUserTokens();
});

const openSwap = (): void => {
  window.open("https://app.pangolin.exchange/#/swap");
};
</script>

<style scoped>
.userCostsSummary {
  max-height: 60vh;
  overflow-y: scroll;
}
</style>
