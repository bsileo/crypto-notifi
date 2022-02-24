<template>
  <div class="flex pl-2 pt-3">
    <div class="row">
      <h3>Membership Level</h3>
    </div>
    <div class="row">
      <p>
        Your account is currently on the <strong>{{ level }}</strong> Level. You
        hold <strong>{{ tokens }}</strong> Notifi tokens.
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
      <UserCostsSummary :balance="tokens"></UserCostsSummary>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject, onMounted, ref } from "vue";
import { NotifiUser, UserLevel } from "@/models/NotifiUser";
import UserWallets from "@/components/UserWallets.vue";
import { userModule } from "@/store/user";
import UserCostsSummary from "@/components/UserCostsSummary.vue";

const user: NotifiUser | undefined = inject("user");
const level = ref<UserLevel>(UserLevel.Free);
const tokens = ref(0);

onMounted(() => {
  fetchUserInfo();
});

const openSwap = (): void => {
  window.open("https://app.pangolin.exchange/#/swap");
};

const fetchUserInfo = async (): Promise<void> => {
  if (user) {
    level.value = userModule.currentLevel;
    tokens.value = userModule.NotifiTokens;
  }
};
</script>

<style scoped>
.userCostsSummary {
  max-height: 60vh;
  overflow-y: scroll;
}
</style>
