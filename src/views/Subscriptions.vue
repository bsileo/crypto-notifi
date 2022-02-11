<template>
  <div v-if="!showNoSubscriptions" class="row pb-1 pt-1">
    <va-input class="flex xs5" label="Search Names" v-model="search"></va-input>
    <div class="flex xs5">
      <ProtocolSelector
        :simpleList="true"
        :simpleMulti="true"
        @selection="setSearchProtocols"
      ></ProtocolSelector>
    </div>
    <div class="flex xs2">
      <va-button icon="refresh" color="secondary" @click="refresh"></va-button>
      <va-popover message="Add a new Subscription">
        <va-button
          @click.prevent="addSubscription"
          icon-right="add"
          size="medium"
          class="ml-4"
          color="success"
          :disabled="!allowAdd"
        >
        </va-button>
      </va-popover>
    </div>
  </div>
  <div class="layout gutter--sm">
    <va-inner-loading :loading="subscriptionsLoading" :size="60">
      <div class="row">
        <div
          class="flex xs12 sm6 md6 lg4 xl3"
          v-for="subscription in subscriptions"
          v-bind:key="subscription.id"
        >
          <SubscriptionCard :subscription="subscription"></SubscriptionCard>
        </div>
      </div>
    </va-inner-loading>
    <div v-if="showNoChannels" class="pt-3">
      <div class="flex sm12" style="text-align: center">
        <h2>
          Welcome to Crypto Notifi. The first step is to setup one or more
          channels where you will recieve alerts.
        </h2>
        <h2 class="pt-3">
          You can access
          <va-button color="primary" @click.prevent="showChannels">
            My Channels
          </va-button>
          under the My Account menu above.
        </h2>
      </div>
    </div>
    <div v-if="showNoSubscriptions" class="pt-3">
      <h2>
        Welcome to Crypto Notifi! You have not created any subscriptions yet,
        but once you do they will appear here for easy maintenance and review.
      </h2>
      <h2>
        To get started, click the Add Button to create your first subscription!
        <va-button
          @click.prevent="addSubscription"
          icon-right="add"
          size="large"
          color="success"
          :disabled="!allowAdd"
        >
        </va-button>
      </h2>
    </div>
  </div>
</template>

<script lang="ts">
import Moralis from "moralis";
import { defineComponent } from "vue";
import { Subscription } from "@/models/Subscription";
import SubscriptionCard from "@/components/Subscription.vue";
import ProtocolSelector from "@/components/ProtocolSelector.vue";
import { Protocol } from "@/models/Protocol";
import { userModule } from "@/store/user";
import { channelsModule } from "@/store/channels";

export default defineComponent({
  name: "Subscriptions",
  components: { SubscriptionCard, ProtocolSelector },
  emits: ["showChannels"],
  props: {
    showAdd: Boolean,
  },
  data() {
    return {
      validation: null,
      intSearch: "",
      searchProtocols: [] as Protocol[],
      rawSubscriptions: [] as Subscription[],
      queryLimit: 25,
      subscriptionsLoading: false,
      rawCount: 0,
    };
  },
  async created() {
    this.fetchSubscriptions();
  },
  computed: {
    subscriptions(): Subscription[] {
      let subs = this.rawSubscriptions;
      if (this.searchProtocols.length > 0) {
        const prots = this.searchProtocols.map((e) => e.name);
        subs = subs.filter((s) => {
          return prots.includes(s.protocol.name);
        });
      }
      return subs;
    },
    showNoChannels(): boolean {
      return (
        !this.subscriptionsLoading && channelsModule.MYCHANNELS.length == 0
      );
    },
    showNoSubscriptions(): boolean {
      return (
        !this.showNoChannels &&
        this.rawCount == 0 &&
        this.rawSubscriptions.length == 0 &&
        !this.subscriptionsLoading
      );
    },
    search: {
      get(): string {
        return this.intSearch;
      },
      set(newVal: string) {
        this.intSearch = newVal;
        this.rawSubscriptions.length = 0;
        this.fetchSubscriptions();
      },
    },
    allowAdd(): boolean {
      return channelsModule.myChannels.length > 0;
    },
  },
  methods: {
    addSubscription(): void {
      this.$router.push({ name: "Subscribe" });
    },
    showChannels(): void {
      this.$emit("showChannels");
    },
    setSearchProtocols(prots: Protocol[]): void {
      this.searchProtocols = prots;
    },
    edit(id: string): void {
      console.log(`Edit ${id}`);
      this.$router.push({ name: "Subscribe", params: { id: id } });
    },
    remove(id: string): void {
      console.log(`remove ${id}`);
      const query = new Moralis.Query("Subscription");
      query.get(id).then((s: { destroy: () => Promise<unknown> }) => {
        s.destroy().then((oldS) => {
          console.log(`Success remove ${oldS}`);
        });
      });
    },
    refresh() {
      this.rawSubscriptions.length = 0;
      this.fetchSubscriptions();
    },
    async appendSubscriptions(): Promise<void> {
      //console.log("Append");
      this.fetchSubscriptions();
    },
    async fetchSubscriptions(): Promise<void> {
      if (!userModule.user) return;
      this.subscriptionsLoading = true;
      const query = new Moralis.Query(Subscription);
      query.equalTo("userID", userModule.user?.id);
      this.rawCount = await query.count();
      if (this.search) {
        query.matches("name", this.search);
      }
      query.limit(this.queryLimit);
      query.skip(this.rawSubscriptions.length);
      query.include("contractActivity");
      query.include("contract");
      query.include("GeneralSubType");
      let subs = await query.find();
      this.subscribe(query);
      this.rawSubscriptions.push(...subs);
      this.subscriptionsLoading = false;
    },
    async subscribe(query: any) {
      const subscription = await query.subscribe();
      subscription.on("create", (sub: Subscription) => {
        this.rawSubscriptions.push(sub);
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      subscription.on("update", (sub: Subscription) => {
        const index = this.rawSubscriptions.findIndex((e) => e.id == sub.id);
        if (index > -1) {
          this.rawSubscriptions.splice(index, 1, sub);
        }
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      subscription.on("enter", (sub: Subscription) => {
        // console.log("object entered");
        this.rawSubscriptions.push(sub);
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      subscription.on("leave", (sub: Subscription) => {
        const index = this.rawSubscriptions.findIndex((e) => e.id == sub.id);
        if (index > -1) {
          this.rawSubscriptions.splice(index, 1);
        }
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      subscription.on("delete", (sub: Subscription) => {
        const index = this.rawSubscriptions.findIndex((e) => e.id == sub.id);
        if (index > -1) {
          this.rawSubscriptions.splice(index, 1);
        }
      });
      subscription.on("close", () => {
        console.log("Subscriptions subscription closed");
      });
    },
  },
});
</script>

<style scoped>
.top-right {
  position: absolute;
  right: 0;
}
</style>
