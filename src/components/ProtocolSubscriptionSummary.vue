<template>
  <div class="container">
    <va-data-table :loading="loading" :items="items"> </va-data-table>
  </div>
</template>

<script setup lang="ts">
import { Protocol } from "@/models/Protocol";
import { SummaryItem } from "@/notifi_types";
import { ref } from "vue";

const items = ref<SummaryItem[]>([]);
const loading = ref(false);

// eslint-disable-next-line no-undef
const props = defineProps({
  protocol: { type: Protocol, required: false },
});
const activeProtocol = ref(props.protocol || new Protocol());

const fetchItems = async (): Promise<void> => {
  if (activeProtocol.value) {
    loading.value = true;
    const newItems = await activeProtocol.value.subscriptionSummary();
    items.value.length = 0;
    items.value.push(...newItems);
    loading.value = false;
  }
};
await fetchItems();
</script>
