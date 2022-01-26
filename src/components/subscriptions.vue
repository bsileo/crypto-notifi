<template>
  <va-alert color="primary" title="My Subscriptions" center class="mb-1">
    <div class="top-right">
      <va-popover message="Add a new Subscription">
        <va-button
          @click.prevent="this.$emit('subscribe')"
          icon-right="add"
          size="small"
          class="mr-4"
          color="success"
          :disabled="!allowAdd"
        >
        </va-button>
      </va-popover>
    </div>
  </va-alert>
  <div class="row pb-1">
    <va-input class="flex sm4" label="Search Names" v-model="search"></va-input>
    <div class="flex sm6">
      <ProtocolSelector
        :simpleList="true"
        :simpleMulti="true"
        @selection="setSearchProtocols"
      ></ProtocolSelector>
    </div>
    <va-button icon="refresh" color="secondary" @click="refresh"></va-button>
  </div>
  <div class="layout gutter--sm">
    <va-inner-loading :loading="subscriptionsLoading" :size="60">
      <div class="row">
        <div
          class="flex sm6 md4 lg3"
          v-for="subscription in subscriptions"
          v-bind:key="subscription.id"
        >
          <SubscriptionCard :subscription="subscription"></SubscriptionCard>
        </div>
      </div>
    </va-inner-loading>
  </div>
  <va-modal
    fullscreen
    hide-default-actions
    v-model="showSubscribe"
    title="Update this Subscription"
  >
    <slot>
      <Subscribe
        :subscription="selectedSubscription"
        @saved="showSubscribe = false"
      ></Subscribe>
    </slot>
  </va-modal>
</template>

<script lang="ts">
import Moralis from "moralis";
import { defineComponent } from "vue";
import { Subscription } from "@/models/Subscription";
import Subscribe from "@/components/subscribe.vue";
import SubscriptionCard from "./Subscription.vue";
import ProtocolSelector from "./ProtocolSelector.vue";
import { Protocol } from "@/models/Protocol";

export default defineComponent({
  name: "Subscriptions",
  components: { Subscribe, SubscriptionCard, ProtocolSelector },
  props: {
    showAdd: Boolean,
  },
  data() {
    return {
      validation: null,
      showSubscribe: false,
      intSearch: "",
      searchProtocols: [] as Protocol[],
      rawSubscriptions: [] as Subscription[],
      queryLimit: 25,
      subscriptionsLoading: false,
    };
  },
  async mounted() {
    this.fetchSubscriptions();
  },
  emits: ["subscribe"],
  computed: {
    subscriptions(): Subscription[] {
      let subs = this.rawSubscriptions;
      /* Done inthe quesry now
      subs = subs.filter((s) => {
        const idx = s.name.indexOf(this.search);
        return idx != -1;
      });*/
      if (this.searchProtocols.length > 0) {
        const prots = this.searchProtocols.map((e) => e.name);
        subs = subs.filter((s) => {
          return prots.includes(s.protocol.name);
        });
      }
      return subs;
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
      return true;
    },
  },
  methods: {
    setSearchProtocols(prots: Protocol[]): void {
      this.searchProtocols = prots;
    },
    edit(id: string): void {
      console.log(`Edit ${id}`);
      this.showSubscribe = true;
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
      this.subscriptionsLoading = true;
      const query = new Moralis.Query(Subscription);
      if (this.search) {
        query.matches("name", this.search);
      }
      query.limit(this.queryLimit);
      query.skip(this.rawSubscriptions.length);
      let subs = await query.find();
      this.rawSubscriptions.push(...subs);
      this.subscriptionsLoading = false;
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
