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
    <va-input
      class="flex sm4"
      label="Search Names"
      v-model="search"
    ></va-input>
    <div class="flex sm6">
      <ProtocolSelector
        :simpleList="true"
        :simpleMulti="true"
        @selection="setSearchProtocols"
      ></ProtocolSelector>
    </div>
  </div>
  <div class="layout gutter--md">
    <div class="row">
      <div
        class="flex sm6 md4 lg4"
        v-for="subscription in subscriptions"
        v-bind:key="subscription.id"
      >
        <SubscriptionCard :subscription="subscription"></SubscriptionCard>
      </div>
    </div>
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
import { subscriptionsModule } from "@/store/subscription";
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
    const columns = [
      { key: "id", label: "", sortable: false },
      { key: "name", label: "Name", sortable: true },
      { key: "subscriptionDescriptor", label: "Type", sortable: true },
      { key: "channelNames", label: "Channels", sortable: false },
      { key: "description", label: "Description", sortable: false },
    ];
    const subs: Subscription[] = [];
    return {
      validation: null,
      columns: columns,
      selected: subs,
      showSubscribe: false,
      search: "",
      searchProtocols: [] as Protocol[],
    };
  },
  mounted() {
    //this.fetchSubscriptions();
  },
  emits: ["subscribe"],
  computed: {
    subscriptions(): Subscription[] {
      let subs = subscriptionsModule.mySubscriptions;
      subs = subs.filter((s) => {
        const idx = s.name.indexOf(this.search);
        return idx != -1;
      });
      if (this.searchProtocols.length > 0) {
        const prots = this.searchProtocols.map((e) => e.name);
        subs = subs.filter((s) => {
          return prots.includes(s.get("protocol"));
        });
      }
      return subs;
    },
    selectedSubscription(): Subscription | null {
      if (this.selected.length == 0) return null;
      return this.selected[0].subscription;
    },
    allowEdit(): boolean {
      return this.selected.length == 1;
    },
    allowRemove(): boolean {
      return this.selected.length > 0;
    },
    allowAdd(): boolean {
      return true;
    }
  },
  methods: {
    setSearchProtocols(prots: Protocol[]): void {
      console.log(prots);
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
  },
});
</script>

<style scoped>
.top-right {
  position: absolute;
  right: 0;
}
</style>
