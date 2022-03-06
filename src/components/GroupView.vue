<template>
  <div class="row">
    <va-input label="Name" v-model="name" class="flex xs12 lg8"></va-input>
    <va-input
      label="Description"
      v-model="description"
      class="flex xs12 lg12"
    ></va-input>
    <div class="pl-2">
      <va-radio
        v-for="option in frequencyOptions"
        :key="option"
        v-model="frequency"
        :option="option"
      >
        {{ option }}
      </va-radio>
      <div class="row">
        <va-select
          v-show="pickDay"
          class="flex xs6 sm6 lg4"
          :options="alertDays"
          label="Alert Day"
          v-model="alertDay"
        >
        </va-select>
        <div
          v-show="pickDay || pickTime"
          class="flex xs1 pt-3"
          style="text-align: center"
        >
          @
        </div>
        <va-time-input
          v-show="pickTime"
          v-model="alertTime"
          :minutesFilter="minFilter"
          ampm
          class="flex xs5 sm4 lg3"
        />
      </div>
    </div>
  </div>
  <div v-if="showSubscriptions" class="row pt-3">
    <h2 @click="toggleSubList">
      Subscriptions
      <VaIcon :name="subListIconName"></VaIcon>
    </h2>
    <div v-show="subListVisible">
      <va-list>
        <SubscriptionListItem
          v-for="subscription in subscriptions"
          v-bind:key="subscription.id"
          :subscription="subscription"
        >
        </SubscriptionListItem>
      </va-list>
      <div v-show="subscriptions.length == 0">No Subscriptions</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Group } from "@/models/Group";
import { Subscription } from "@/models/Subscription";
import { computed, ref } from "vue";
import { GroupFrequency } from "@/notifi_types";
import SubscriptionListItem from "@/components/SubscriptionListItem.vue";

/* global defineProps */
const props = defineProps({
  group: { type: Group, required: true },
  showSubscriptions: { type: Boolean, required: false, default: false },
});

const activeGroup = ref<Group>(props.group);
const subscriptions = ref<Subscription[]>([]);

const fetchSubscriptions = async () => {
  subscriptions.value.length = 0;
  subscriptions.value.push(...(await props.group.subscriptions()));
};

if (props.showSubscriptions) {
  fetchSubscriptions();
}

const name = computed({
  get: () => activeGroup.value?.name,
  set: (value) => {
    activeGroup.value.name = value;
    activeGroup.value.save();
  },
});

const description = computed({
  get: () => activeGroup.value?.description,
  set: (value) => {
    activeGroup.value.description = value;
    activeGroup.value.save();
  },
});

const frequency = computed({
  get: () => activeGroup.value?.frequency,
  set: (value) => {
    activeGroup.value.frequency = value;
    activeGroup.value.save();
  },
});

const alertDay = computed({
  get: () => activeGroup.value?.alertDay,
  set: (value) => {
    activeGroup.value.alertDay = value;
    activeGroup.value.save();
  },
});

const alertTime = computed({
  get: () => {
    let db = activeGroup.value.alertTime;
    if (!db) db = "8:00 AM ";
    const d = new Date(`Jan 1, 1900 ${db}`);
    return d;
  },
  set: (value: Date) => {
    activeGroup.value.alertTime = value.toTimeString();
    activeGroup.value.save();
  },
});

const minFilter = (m: number) => {
 console.log(m);
 return m == 0 || m == 30
}

const alertDays = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const pickTime = computed(() => {
  return frequency.value != GroupFrequency.realtime;
});

const pickDay = computed(() => {
  return frequency.value == GroupFrequency.weekly;
});

const frequencyOptions = Object.values(GroupFrequency);

const subListVisible = ref(false);
const toggleSubList = () => {
  subListVisible.value = !subListVisible.value;
};
const subListIconName = computed(() => {
  return subListVisible.value ? "expand_more" : "expand_less";
});
</script>