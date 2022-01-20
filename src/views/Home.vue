<template>
  <div class="container p-3 gutter--md">
    <va-navbar color="primary" shape class="mb-2">
      <template #left>
        <va-navbar-item>
          <va-image class="logo" alt="logo" src="/logo.png">
            <template #error> Logo </template>
          </va-image>
        </va-navbar-item>
      </template>
      <template #center>
        <va-navbar-item></va-navbar-item>
      </template>
      <template #right>
        <va-navbar-item>
          <va-button color="danger" class="float-end" @click.prevent="logout">
            Logout
          </va-button>
          <va-switch
            true-inner-label="Manager"
            false-inner-label="User"
            true-value="manager"
            false-value="user"
            color="warning"
            class="flex float-end pl-2"
            v-model="userMode"
          >
          </va-switch>
          <va-button
            color="secondary"
            class="flex float-end pl-2"
            @click.prevent="showChannels = true"
          >
            My Channels
          </va-button>
        </va-navbar-item>
      </template>
    </va-navbar>
    <div v-if="showSubscriptions" class="row pb-3">
      <div class="flex sm12">
        <Subscriptions @subscribe="doSubscribe"></Subscriptions>
      </div>
    </div>
    <div v-if="false" class="row" style="max-height: 50%">
      <div class="flex md12 sm12">
        <va-collapse
          header="Transactions"
          color="primary"
          v-model="showTransactions"
        >
          <va-card gradient>
            <Transactions
              :showTX="this.showTransactions"
              @subscribe="doSubscribe"
            >
            </Transactions>
          </va-card>
        </va-collapse>
      </div>
    </div>
    <va-modal v-model="showChannels" title="Configure your Channels">
      <slot>
        <Channels></Channels>
      </slot>
    </va-modal>
    <va-modal
      fullscreen
      hide-default-actions
      v-model="showSubscribe"
      title="Setup a new Subscription"
    >
      <slot>
        <Subscribe
          :transaction="subscribeTx"
          @saved="showSubscribe = false"
        ></Subscribe>
      </slot>
    </va-modal>
    <div v-if="showManager">
      <ProtocolManager></ProtocolManager>
    </div>
  </div>
</template>

<script lang="ts">
import Moralis from "moralis/types";
import { defineComponent } from "vue";
import { UserModel } from "@/models/User";
import { userModule } from "@/store/user";
import Channels from "@/components/channels.vue";
import Subscriptions from "@/components/subscriptions.vue";
import Subscribe from "@/components/subscribe.vue";
import Transactions from "@/components/transactions.vue";
import ProtocolManager from "@/components/ProtocolManager.vue";
import { computed } from "vue";

let tx: Moralis.TransactionResult | null = null;

export default defineComponent({
  name: "Home",
  components: {
    Channels,
    Subscriptions,
    Transactions,
    Subscribe,
    ProtocolManager,
  },
  data() {
    return {
      userMode: "user" as "user" | "manager",
      subscribeTx: tx,
      showTransactions: false,
      showCategories: true,
      showSubscribe: false,
      showChannels: false,
    };
  },
  provide() {
    return {
      user: computed(() => userModule.user as UserModel),
    };
  },
  computed: {
    showSubscriptions(): boolean {
      return this.userMode == "user";
    },
    showManager(): boolean {
      return this.userMode == "manager";
    },
    user(): UserModel {
      return userModule.user as UserModel;
    },
  },
  methods: {
    async fromWei(value: string): Promise<number> {
      return this.$moralis.Units.FromWei(value, 18);
    },
    async logout(): Promise<void> {
      await this.$moralis.User.logOut();
      this.$router.push({ name: "Login" });
    },
    async doSubscribe(tx: Moralis.TransactionResult | null) {
      if (tx) {
        this.subscribeTx = tx;
      }
      this.showSubscribe = true;
    },
  },
});
</script>

<style scoped>
.logo {
  height: 50px;
  width: 80px;
}
</style>
