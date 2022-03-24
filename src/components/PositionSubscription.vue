<template>
  <div class="row">
    <div v-if="subscription" class="flex xs6" style="font-size: smaller">
      <div v-if="subscription.positionHigh" :style="highPositionStyle">
        <va-icon
          name="arrow_drop_up"
          :color="highPositionViolated ? 'danger' : ''"
        />
        ${{ prettyNumber(subscription.positionHigh) }}
      </div>
      <div v-if="subscription.positionLow" :style="lowPositionStyle">
        <va-icon
          name="arrow_drop_down"
          :color="lowPositionViolated ? 'danger' : ''"
        />
        ${{ prettyNumber(subscription.positionLow) }}
      </div>
    </div>
    <div v-if="subscription" class="flex xs6">
      <va-button icon="edit" @click="edit" size="small"></va-button>
      <va-button
        icon="delete"
        @click="deleteSub"
        color="danger"
        class="ml-1"
        size="small"
      ></va-button>
    </div>
    <div v-if="!subscription" class="flex xs6 offset--xs6">
      <va-button icon="add" @click="add" size="small"></va-button>
    </div>
  </div>
  <va-modal v-model="show" no-dismiss hide-default-actions>
    <PositionEditor
      :position="props.position"
      :subscription="subscription"
      @saved="show = false"
      @canceled="show = false"
      @launched="show = false"
    ></PositionEditor>
  </va-modal>
</template>

<script setup lang="ts">
import { Position } from "@/models/Position";
import { computed, onMounted, ref, reactive } from "vue";
import { prettyNumber, roundToTwo } from "@/Utilities";
import { Subscription } from "@/models/Subscription";
import { UserChannel } from "@/models/Channel";
import PositionEditor from "@/components/PositionEditor.vue";

/* global defineProps */
const props = defineProps({
  position: { type: Position, required: true },
});

const subscription = ref<Subscription | undefined>(undefined);
const channels = ref<UserChannel[]>([]);

onMounted(async () => {
  const sub = await props.position.fetchSubscription();
  subscription.value = sub;
  setupValues();
});

const setupValues = async (): Promise<void> => {
  if (subscription.value?.positionLow)
    lowValue.value = subscription.value?.positionLow;
  else lowValue.value = roundToTwo(props.position.value);
  if (subscription.value?.positionHigh)
    highValue.value = subscription.value?.positionHigh;
  else highValue.value = roundToTwo(props.position.value);
  const chans = await subscription.value?.channels();
  if (chans) channels.value = chans;
  else channels.value = [];
};

const intLowValue = ref(
  roundToTwo(subscription.value?.positionLow || props.position.value)
);
const lowValue = computed({
  get: () => intLowValue.value,
  set: (val) => {
    intLowValue.value = val;
  },
});

const intHighValue = ref(
  roundToTwo(props.position.positionHigh || props.position.value)
);
const highValue = computed({
  get: () => intHighValue.value,
  set: (val) => {
    intHighValue.value = val;
  },
});

const lowPositionViolated = computed((): boolean => {
  if (
    subscription.value == undefined ||
    subscription.value.positionLow == undefined
  )
    return false;
  return subscription.value.positionLow > props.position.value;
});

const lowPositionStyle = computed(() => {
  return {
    color: lowPositionViolated.value ? "red" : "",
  };
});
const highPositionViolated = computed((): boolean => {
  if (
    subscription.value == undefined ||
    subscription.value.positionHigh == undefined
  )
    return false;
  return subscription.value.positionHigh < props.position.value;
});

const highPositionStyle = computed(() => {
  return {
    color: highPositionViolated.value ? "red" : "",
  };
});

const show = ref(false);

const add = () => {
  show.value = true;
};
const edit = () => {
  show.value = true;
};
const deleteSub = () => {
  subscription.value?.destroy();
  subscription.value = undefined;
};
</script>

<style scoped></style>
