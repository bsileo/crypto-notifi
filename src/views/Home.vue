<template>
  <div class="container gutter--md pb-3">
    <Header>
      <template #right>
        <va-navbar-item>
          <va-button-dropdown
            id="menu"
            color="dark"
            label="My Account"
            class="float-end"
            size="medium"
            :flat="true"
            :outline="false"
          >
            <va-card color="background" square :bordered="true">
              <va-card-actions align="between" :vertical="true">
                <va-button color="primary" @click.prevent="showAccount = true">
                  My Account
                </va-button>
                <va-button color="primary" @click.prevent="showChannels = true">
                  My Channels
                </va-button>
                <va-button color="danger" @click.prevent="logout">
                  Logout
                </va-button>
              </va-card-actions>
            </va-card>
          </va-button-dropdown>
          <div v-if="userIsManager" class="flex float-end pl-2">
            <va-switch
              true-inner-label="Manager"
              false-inner-label="User"
              true-value="manager"
              false-value="user"
              :color="userMode == 'manager' ? 'danger' : 'success'"
              size="large"
              v-model="userMode"
            >
            </va-switch>
          </div>
          <div v-if="userMode != 'manager'" class="flex float-end pl-2">
            <va-button-toggle
              color="secondary"
              toggle-color="warning"
              v-model="mode"
              :options="modeOptions"
            />
          </div>
        </va-navbar-item>
      </template>
    </Header>
    <div v-show="showSubscriptions" class="row pb-3">
      <div class="flex sm12">
        <Subscriptions @subscribe="doSubscribe"></Subscriptions>
      </div>
    </div>
    <div v-show="showProtocols">
      <ProtocolSelector
        :showSearch="true"
        :showVote="true"
        :showSubscribe="true"
        :showUserInfo="false"
        :allowSelect="false"
        :showStatus="true"
        @subscribe="protocolSubscribe"
      >
      </ProtocolSelector>
    </div>
    <div v-show="showSubscribe">
      <Subscribe
        :transaction="subscribeTx"
        :protocol="subscribeProtocol"
        @saved="subscriptionSaved"
        @cancel="cancelSubscribe"
      ></Subscribe>
    </div>
    <div v-if="showManager">
      <ProtocolManager></ProtocolManager>
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
import ProtocolSelector from "@/components/ProtocolSelector.vue";
import Account from "@/components/Account.vue";
import Header from "@/components/header.vue";
import { computed } from "vue";
import { channelsModule } from "@/store/channels";
import { Protocol } from "@/models/Protocol";

let tx: Moralis.TransactionResult | null = null;

enum DisplayMode {
  "protocols" = "Protocols",
  "subscriptions" = "Subscriptions",
  "subscribe" = "Subscribe",
}

export default defineComponent({
  name: "Home",
  components: {
    Channels,
    Subscriptions,
    Transactions,
    Subscribe,
    Account,
    ProtocolManager,
    ProtocolSelector,
    Header,
  },
  data() {
    return {
      userMode: "user" as "user" | "manager",
      subscribeTx: tx,
      subscribeProtocol: undefined as Protocol | undefined,
      showTransactions: false,
      showChannels: false,
      showAccount: false,
      mode: DisplayMode.subscriptions as DisplayMode,
      modeOptions: [
        { value: DisplayMode.subscriptions, label: "Subscriptions" },
        { value: DisplayMode.protocols, label: "Protocols" },
      ],
    };
  },
  provide() {
    return {
      user: computed(() => userModule.user as NotifiUser),
    };
  },
  computed: {
    showProtocols(): boolean {
      return this.userMode == "user" && this.mode == DisplayMode.protocols;
    },
    showSubscribe(): boolean {
      return (
        this.userMode == "user" &&
        this.mode == DisplayMode.subscribe &&
        channelsModule.myChannels.length > 0
      );
    },
    showSubscriptions(): boolean {
      return (
        this.userMode == "user" &&
        this.mode == DisplayMode.subscriptions &&
        channelsModule.myChannels.length > 0
      );
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
    protocolSubscribe(aProtocol: Protocol) {
      this.subscribeProtocol = aProtocol;
      this.mode = DisplayMode.subscribe;
    },
    async doSubscribe(tx: Moralis.TransactionResult | null) {
      if (tx) {
        this.subscribeTx = tx;
      }
      this.mode = DisplayMode.subscribe;
    },
    subscriptionSaved() {
      this.mode = DisplayMode.subscriptions;
    },
    cancelSubscribe() {
      this.mode = DisplayMode.subscriptions;
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
div {
  --va-dropdown-content-background: var(--va-background);
}
.va-modal__inner {
  max-width: 95%;
}
</style>
