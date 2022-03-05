<template>
  <div class="row">
    <va-input label="Name" v-model="name" class="flex xs12 md2"></va-input>
    <va-input
      label="Description"
      v-model="description"
      class="flex xs12 md8"
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
    </div>
  </div>
  <div class="row">
    <div
      class="flex xs12 sm6 md6 lg4 xl3 pb-3"
      v-for="subscription in subscriptions"
      v-bind:key="subscription.id"
    >
      <SubscriptionCard
        :subscription="subscription"
        :showGroup="false"
      ></SubscriptionCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Group } from "@/models/Group";
import SubscriptionCard from "@/components/Subscription.vue";
import { Subscription } from "@/models/Subscription";
import { computed, reactive, ref } from "vue";
import { GroupFrequency } from "@/notifi_types";

/* global defineProps */
const props = defineProps({
  group: { type: Group, required: true },
});

const activeGroup = ref<Group>(props.group);
const subscriptions = ref<Subscription[]>(await props.group.subscriptions());

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

const frequencyOptions = Object.values(GroupFrequency);
</script>
