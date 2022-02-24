<template>
  <va-data-table hoverable :items="items" :loading="loading" :columns="columns">
    <template #cell(relatedItem)="{ source: relatedItem }"
      ><va-chip :to="itemPath(relatedItem)">{{
        relatedItem.className
      }}</va-chip>
    </template>
    <template #cell(tokenCost)="{ source: tokenCost }">
      <span class="table-cost-col">{{ tokenCost }}</span>
    </template>
    <template #cell(status)="{ rowIndex, value }">
      <va-popover color="danger" message="Item will be deactived - add Notifi">
        <va-icon
          color="danger"
          :size="20"
          v-show="overCostIndex(rowIndex)"
          name="warning_amber"
        ></va-icon>
      </va-popover>
      <span :class="{ 'over-cost': overCostIndex(rowIndex) }">{{ value }}</span>
    </template>
    <template #cell(runningTotal)="{ source, value, rowIndex }">
      <span class="table-cost-col" :class="{ 'over-cost': overCost(source) }">{{
        value
      }}</span>
      <va-icon
        v-show="false"
        name="arrow_drop_up"
        size="small"
        @click="moveUp(rowIndex)"
      ></va-icon>
      <va-icon
        v-show="false"
        name="arrow_drop_down"
        size="small"
        @click="moveDown(rowIndex)"
      ></va-icon>
    </template>
    <template #colgroup>
      <col span="3" />
      <col class="table-cost-col" />
    </template>
    <template #bodyAppend>
      <tr v-show="items.length > 0" class="table-example--slots slots-body">
        <td colspan="3" style="text-align: right" class="pr-3">
          <strong>Total</strong>
        </td>
        <td colspan="1" style="text-align: center">
          <strong>{{ total }}</strong>
        </td>
        <td colspan="1"></td>
      </tr>
    </template>
  </va-data-table>
</template>

<script setup lang="ts">
import { NotifiUser } from "@/models/NotifiUser";
import { SummaryItemLink, UserSummaryItem } from "@/notifi_types";
import { load } from "dotenv";
import Moralis from "moralis";
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
const route = useRoute();

/* global defineProps, defineEmits */
const props = defineProps({
  balance: { type: Number, required: true },
});

//const user: NotifiUser | undefined = inject("NotifiUser");
const initialItems = [] as UserSummaryItem[];
const items = ref<UserSummaryItem[]>(initialItems);
const loading = ref(true);
const columns = ref([
  { key: "status" },
  { key: "detail" },
  { key: "name" },
  { key: "tokenCost", alignHead: "center", align: "center", sortable: "false" },
  {
    key: "runningTotal",
    alignHead: "center",
    align: "center",
    sortable: "false",
  },
  { key: "relatedItem" },
]);

const fetchItems = async () => {
  const us = Moralis.User.current();
  loading.value = true;
  if (us) {
    const u = new NotifiUser({ id: us.id });
    const newItems = await u.getCostSummaryItems();
    items.value.length = 0;
    items.value.push(...newItems);
    prioritySort();
    updateTotals();
  }
  loading.value = false;
};

const sorter = (first: UserSummaryItem, second: UserSummaryItem): number => {
  // Channels always go before other cost Types
  if (first.type == "Channel" && second.type != "Channel") return -1;
  if (second.type == "Channel" && first.type != "Channel") return 1;
  if (second.type == "Channel" && first.type == "Channel") {
    // Sort by the cheapest channels first. Free Channels are always enabled this way.
    return first.tokenCost - second.tokenCost;
  }
  // Finally, sort by Priority for Subscriptions so users can adjust if needed.
  return (first.costPriority || 0) - (second.costPriority || 0);
};

const prioritySort = () => {
  items.value.sort(sorter);
};

const updateTotals = () => {
  let cost = 0;
  for (let i = 0; i < items.value.length; i++) {
    const item: UserSummaryItem = items.value[i];
    cost = cost + item.tokenCost;
    item.runningTotal = cost;
    if (cost > props.balance) {
      item.status = "Over Balance";
      item.color = "danger";
    }
  }
};

const total = computed((): number => {
  let sum = 0;
  items.value.forEach((i) => {
    sum = sum + i.tokenCost;
  });
  return sum;
});

const overCost = (source: any) => {
  return source > props.balance;
};
const overCostIndex = (idx: number): boolean => {
  const rec = items.value[idx];
  return (rec.runningTotal || 0) > props.balance;
};
const moveDown = (idx: number): void => {
  const rec: UserSummaryItem = items.value[idx];
  rec.costPriority = (rec.costPriority || 0) - 1;
  prioritySort();
};
const moveUp = (idx: number): void => {
  const rec = items.value[idx];
  rec.costPriority = (rec.costPriority || 0) + 1;
  prioritySort();
};

onMounted(async () => {
  await fetchItems();
});

const itemPath = (relatedItem: SummaryItemLink) => {
  const returnPath = route.path;
  return `${relatedItem.url}?returnPath=${returnPath}`;
};
</script>

<style scoped>
.table-cost-col {
  text-align: center;
}
.over-cost {
  color: var(--va-danger);
}
</style>
