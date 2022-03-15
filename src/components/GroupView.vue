<template>
  <div class="row">
    <va-input label="Name" v-model="name" class="flex xs12 md6"></va-input>
    <ChannelPicker
      class="flex xs12 md6"
      label="Email"
      v-model="userChannel"
      :emailOnly="true"
    ></ChannelPicker>
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
          class="flex xs6 sm6 lg5"
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
          <strong>@</strong>
        </div>
        <va-time-input
          v-show="pickTime"
          v-model="alertTime"
          :minutesFilter="minFilter"
          ampm
          class="flex xs5 sm5 lg5"
        />
      </div>
    </div>
  </div>
  <div v-if="newGroup">
    <va-button icon="save" @click="saveNew" color="primary" :disabled="!valid"
      >Add</va-button
    >
  </div>
  <div v-else>
    <div v-if="showSubscriptions" class="row pt-3">
      <h2 @click="toggleSubList">
        Subscriptions
        <VaIcon :name="subListIconName"></VaIcon>
      </h2>
      <div v-show="subListVisible">
        <va-list>
          <draggable
            v-model="subscriptions"
            group="subscriptions"
            @start="drag = true"
            @end="drag = false"
            @change="dragChange"
            :sort="false"
            item-key="id"
          >
            <template #item="{ element }">
              <SubscriptionListItem :subscription="element" :draggable="true">
              </SubscriptionListItem>
            </template>
          </draggable>
        </va-list>
        <div v-show="subscriptions.length == 0">No Subscriptions</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Group } from "@/models/Group";
import { Subscription } from "@/models/Subscription";
import { computed, ref } from "vue";
import { GroupFrequency } from "@/notifi_types";
import draggable from "vuedraggable";
import { UserChannel } from "@/models/Channel";
import SubscriptionListItem from "@/components/SubscriptionListItem.vue";
import ChannelPicker from "@/components/ChannelPicker.vue";

/* global defineProps */
const props = defineProps({
  group: { type: Group, required: true },
  showSubscriptions: { type: Boolean, required: false, default: false },
});

const activeGroup = ref<Group>(props.group);
const subscriptions = ref<Subscription[]>([]);

const newGroup = computed(() => activeGroup.value.id == undefined);

const valid = computed((): boolean => {
  return (
    name.value != undefined &&
    name.value.length > 3 &&
    validFrequencySetting.value &&
    userChannel.value != undefined
  );
});

const validFrequencySetting = computed((): boolean => {
  return (
    (frequency.value != undefined &&
      frequency.value == GroupFrequency.realtime) ||
    (frequency.value == GroupFrequency.daily && alertTime.value != undefined) ||
    (frequency.value == GroupFrequency.weekly &&
      alertTime.value != undefined &&
      alertDay.value != undefined)
  );
});

const saveNew = async (): Promise<Group> => {
  return await activeGroup.value.save();
};

const fetchSubscriptions = async () => {
  subscriptions.value.length = 0;
  subscriptions.value.push(...(await props.group.subscriptions()));
};

if (props.showSubscriptions && !newGroup.value) {
  fetchSubscriptions();
}

const name = computed({
  get: () => activeGroup.value?.name,
  set: (value) => {
    activeGroup.value.name = value;
    if (!newGroup.value) {
      activeGroup.value.save();
    }
  },
});

const description = computed({
  get: () => activeGroup.value?.description,
  set: (value) => {
    activeGroup.value.description = value;
    if (!newGroup.value) {
      activeGroup.value.save();
    }
  },
});

const frequency = computed({
  get: () => activeGroup.value?.frequency,
  set: (value) => {
    activeGroup.value.frequency = value;
    if (!newGroup.value) {
      activeGroup.value.save();
    }
  },
});

const alertDay = computed({
  get: () => activeGroup.value?.alertDay,
  set: (value) => {
    activeGroup.value.alertDay = value;
    if (!newGroup.value) {
      activeGroup.value.save();
    }
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
    if (!newGroup.value) {
      activeGroup.value.save();
    }
  },
});

const userChannel = computed({
  get: () => {
    return activeGroup.value.userChannel;
  },
  set: (value: UserChannel) => {
    activeGroup.value.userChannel = value;
    if (!newGroup.value) {
      activeGroup.value.save();
    }
  },
});

const minFilter = (m: number) => {
  console.log(m);
  return m == 0 || m == 30;
};

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

const checkMove = (event: any) => {
  return false;
};

const dragChange = async (event: any) => {
  if (event.added) {
    event.added.element.group = activeGroup.value;
    event.added.element.save();
  }
};
</script>
