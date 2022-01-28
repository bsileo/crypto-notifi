<template>
  <div class="container gutter--md pb-3">
    <Header>
      <template #right>
        <va-navbar-item>
          <va-button-dropdown
            color="secondary"
            label="Account"
            class="float-end"
            size="medium"
          >
            <div style="background-color: secondary" class="container menu">
              <div class="row pb-3 pt-2">
                <va-button color="primary" @click.prevent="showAccount = true">
                  My Account
                </va-button>
              </div>
              <div class="row pb-3">
                <va-button color="primary" @click.prevent="showChannels = true">
                  My Channels
                </va-button>
              </div>
              <div class="row pb-2">
                <va-button color="danger" @click.prevent="logout">
                  Logout
                </va-button>
              </div>
            </div>
          </va-button-dropdown>
          <div class="flex float-end pl-2">
            <va-switch
              true-inner-label="Manager"
              false-inner-label="User"
              true-value="manager"
              false-value="user"
              color="secondary"
              size="large"
              v-model="userMode"
              v-if="userIsManager"
            >
            </va-switch>
          </div>
        </va-navbar-item>
      </template>
    </Header>
    <div v-if="showSubscriptions" class="row pb-3">
      <div class="flex sm12">
        <Subscriptions @subscribe="doSubscribe"></Subscriptions>
      </div>
    </div>
    <div v-if="showNewUser" class="row pt-5">
      <div class="flex sm12" style="text-align: center">
        <h2>
          Welcome to Crypto Notifi. The first step is to setup one or more
          channels where you will recieve alerts.
        </h2>
        <h2 class="pt-3">
          Click the
          <va-button color="secondary" @click.prevent="showChannels = true">
            My Channels
          </va-button>
          button to get started.
        </h2>
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
    <va-modal v-model="showAccount" title="Manage my Account">
      <slot>
        <Account></Account>
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
import { NotifiUser } from "@/models/NotifiUser";
import { userModule } from "@/store/user";
import Channels from "@/components/channels.vue";
import Subscriptions from "@/components/subscriptions.vue";
import Subscribe from "@/components/subscribe.vue";
import Transactions from "@/components/transactions.vue";
import ProtocolManager from "@/components/ProtocolManager.vue";
import Account from "@/components/Account.vue";
import Header from "@/components/header.vue";
import { computed } from "vue";
import { channelsModule } from "@/store/channels";

let tx: Moralis.TransactionResult | null = null;

export default defineComponent({
  name: "Home",
  components: {
    Channels,
    Subscriptions,
    Transactions,
    Subscribe,
    Account,
    ProtocolManager,
    Header,
  },
  data() {
    return {
      userMode: "user" as "user" | "manager",
      subscribeTx: tx,
      showTransactions: false,
      showCategories: true,
      showSubscribe: false,
      showChannels: false,
      showAccount: false,
    };
  },
  provide() {
    return {
      user: computed(() => userModule.user as NotifiUser),
    };
  },
  computed: {
    showSubscriptions(): boolean {
      return this.userMode == "user" && channelsModule.myChannels.length > 0;
    },
    showNewUser(): boolean {
      return this.userMode == "user" && channelsModule.myChannels.length == 0;
    },
    showManager(): boolean {
      return this.userMode == "manager";
    },
    user(): NotifiUser {
      return userModule.user as NotifiUser;
    },
    userIsManager(): boolean {
      return this.user.get("ProtocolManager");
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
.title {
  font-size: 2em;
  font-weight: bold;
  align-self: center;
  font-family: "Material Icons";
}
</style>
