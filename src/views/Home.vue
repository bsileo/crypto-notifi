<template>
  <div class="container p-3 gutter--md">
    <div class="row pb-4">
      <div class="flex md4">
        <img
          alt="logo"
          src="https://app.snowball.network/_next/image?url=%2Fassets%2Fimages%2Flogo-dark-label.svg&w=640&q=75"
        />
        <h3>Logged In as {{ user.id }}</h3>
      </div>
      <div class="flex md8 float-end">
        <va-button color="danger" class="float-end" @click.prevent="logout">
          Logout
        </va-button>
        <va-button
          color="warning"
          class="flex float-end"
          @click.prevent="showAlerter = true"
        >
          Send Alert
        </va-button>
      </div>
    </div>
    <div class="row" style="max-height: 35%; align-items: stretch">
      <div class="flex md9 sm12">
        <Subscriptions @subscribe="doSubscribe"></Subscriptions>
      </div>
      <div class="flex md3 sm12">
        <va-card color="primary" gradient style="align-items: stretch">
          <va-card-title>My Channels</va-card-title>
          <va-card-content>
            <Channels></Channels>
          </va-card-content>
        </va-card>
      </div>
    </div>
    <div class="row p-3" style="max-height: 60%">
      <div class="flex md12 sm12">
        <va-collapse
          header="Transactions"
          style="width=200px;"
          v-model="showTransactions"
        >
          <va-card color="primary" gradient>
            <Transactions
              :showTX="this.showTransactions"
              @subscribe="doSubscribe"
            >
            </Transactions>
          </va-card>
        </va-collapse>
      </div>
    </div>
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
    <va-modal hide-default-actions size="large" v-model="showAlerter">
      <template #header>
        <h2>Send a new Alert</h2>
      </template>
      <slot>
        <Alerter></Alerter>
      </slot>
    </va-modal>
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
import Alerter from "@/components/alerter.vue";
import { computed } from "vue";

let tx: Moralis.TransactionResult | null = null;

export default defineComponent({
  name: "Home",
  components: { Channels, Subscriptions, Transactions, Subscribe, Alerter },
  data() {
    return {
      showSubscribe: false,
      subscribeTx: tx,
      showAlerter: false,
      showTransactions: false,
    };
  },
  provide() {
    return {
      user: computed(() => userModule.user as UserModel),
    };
  },
  computed: {
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
