<template>
  <div>
    <va-data-table
      :items="alerts"
      v-model:sort-by="sortBy"
      v-model:sorting-order="sortingOrder"
      striped
      :columns="alertColumns"
    >
      <template #header(shortDateTime)>Date</template>
      <template #header(content)>Content</template>
      <template #cell(shortDateTime)="{ source: shortDateTime }">
        <col class="dateCol" />
        {{ shortDateTime }}
      </template>
      <template #cell(type)="{ source: type }">
        {{ type }}
      </template>
      <template #cell(content)="{ source: content }">
        <div style="width: 50%">{{ content }}</div>
      </template>
      <template #bodyAppend>
        <tr>
          <td colspan="8" class="table-example--pagination">
            <va-pagination
              v-model="currentPage"
              input
              hide-on-single-page
              :total="total"
              :page-size="pageSize"
            />
          </td>
        </tr>
      </template>
    </va-data-table>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { Protocol } from "@/models/Protocol";
import { AlertHistory } from "@/models/AlertHistory";
import Moralis from "moralis";

// eslint-disable-next-line no-undef
const props = defineProps({
  protocol: { type: Protocol, required: true },
});

const sortBy = ref("shortDateTime");
const sortingOrder = ref<"asc" | "desc">("desc");
const total = ref(0);
const page = ref(1);
const pageSize = ref(15);

const currentPage = computed({
  get(): number {
    return page.value;
  },
  set(p: number) {
    page.value = p;
    refresh();
  },
});

const alertColumns = ref([
  { key: "shortDateTime", label: "Date", sortable: true },
  { key: "status", label: "Status", sortable: true },
  { key: "subscriptionTypeName", label: "Type", sortable: true },
  { key: "content", label: "Content", sortable: true },
]);

const alerts = ref<AlertHistory[]>([]);
const query = new Moralis.Query(AlertHistory);
if (props.protocol) {
  query.equalTo("Protocol", props.protocol);
}

const refresh = async (): Promise<void> => {
  total.value = await query.count();
  query.limit(pageSize.value);
  query.skip(currentPage.value);
  const newAlerts = await query.find();
  alerts.value.length = 0;
  alerts.value.push(...newAlerts);
};
const subscription = await query.subscribe();

subscription.on("create", (a: AlertHistory) => {
  alerts.value.push(a);
});
// eslint-disable-next-line @typescript-eslint/no-unused-vars
subscription.on("update", (a: AlertHistory) => {
  const index = alerts.value.findIndex((e) => e.id == a.id);
  if (index > -1) {
    alerts.value.splice(index, 1, a);
  }
});
subscription.on("enter", (a: AlertHistory) => {
  alerts.value.push(a);
});
subscription.on("leave", (a: AlertHistory) => {
  const index = alerts.value.findIndex((e) => e.id == a.id);
  if (index > -1) {
    alerts.value.splice(index, 1);
  }
});
subscription.on("delete", (a: AlertHistory) => {
  const index = alerts.value.findIndex((e) => e.id == a.id);
  if (index > -1) {
    alerts.value.splice(index, 1);
  }
});
await refresh();
</script>

<style scoped></style>
