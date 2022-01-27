<template>
  <div class="container">
    <va-data-table :loading="loading" :items="items"> </va-data-table>
  </div>
</template>

<script lang="ts">
import { Protocol, SummaryItem } from "@/models/Protocol";
import { defineComponent } from "vue";

export default defineComponent({
  name: "ProtocolSubscriptionSummary",
  components: {},
  emits: [],
  props: {
    protocol: { type: Protocol, required: false },
  },
  data() {
    return {
      items: [] as SummaryItem[],
      loading: false as boolean,
    };
  },
  watch: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protocol(newP: Protocol, oldP: Protocol): void {
      this.fetchItems();
    },
  },
  computed: {},
  methods: {
    async fetchItems(): Promise<void> {
      if (this.protocol) {
        this.loading = true;
        this.items = [];
        this.items = await this.protocol.subscriptionSummary();
        this.loading = false;
      }
    },
  },
});
</script>
