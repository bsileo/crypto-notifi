<template>
  <div class="row" v-if="showName">
    <va-input
      class="flex xs11 sm8 offset--sm2 pb-2"
      label="Subscription Name"
      v-model="name"
      placeholder="Subscription Name"
    ></va-input>
    <va-icon
      class="flex xs1 float-right"
      name="launch"
      @click="launch"
    ></va-icon>
  </div>
  <div class="row pb-3" v-if="showPositionInfo">
    <PositionListItem
      :position="position"
      :showSubscription="false"
    ></PositionListItem>
  </div>
  <div class="row">
    <div class="flex offset-xs1 pb-2">
      <strong>Alert if the Value is:</strong>
    </div>
  </div>
  <div class="row">
    <va-switch size="small" v-model="valueChk" class="flex xs1"></va-switch>
    <va-input
      v-model="lowValue"
      class="flex xs3"
      label="Less Than"
      :rules="lowRules"
      :error="newLowPositionViolated"
      @change="setLowPercent"
    ></va-input>
    <va-slider
      v-model="lowValuePercent"
      :track-label="lowValueLabel + '%'"
      track-label-visible
      :max="maxValue"
      :min="minValue"
      class="flex xs1"
    >
    </va-slider>

    <va-input
      v-model="currentValue"
      readonly
      class="flex xs3"
      :messages="currentValueMessages"
      label="Current Value"
    >
      <template v-if="allowBaseline" #appendInner>
        <va-popover
          color="secondary"
          placement="top"
          message="Automatically re-baseline the limits to Current Value"
          ><va-icon name="horizontal_distribute" @click.prevent="rebaseline"
        /></va-popover>
      </template>
    </va-input>
    <va-slider
      v-model="highValuePercent"
      :track-label="highValuePercent + '%'"
      track-label-visible
      :max="maxValue"
      :min="minValue"
      class="flex xs1"
    ></va-slider>
    <va-input
      v-model="highValue"
      label="Greater Than"
      class="flex xs3"
      :rules="highRules"
      :error="newHighPositionViolated"
      @change="setHighPercent"
    ></va-input>
  </div>
  <div :v-if="false" class="row pt-3">
    <SubscriptionFrequency
      :subscription="subscription"
      v-model="frequency"
    ></SubscriptionFrequency>
  </div>
  <va-divider v-if="showChannels" dashed inset></va-divider>
  <div class="row" v-if="showChannels">
    <ChannelsPicker
      :subscription="subscription"
      @channels="setChannels"
      :autoSave="false"
    ></ChannelsPicker>
  </div>
  <div v-if="showButtons">
    <va-button icon="save" @click="save" size="medium" :disabled="!validSubmit"
      >Save</va-button
    >
    <va-button
      icon="cancel"
      @click="cancel"
      size="medium"
      color="secondary"
      class="ml-1"
      >Cancel</va-button
    >
  </div>
</template>

<script setup lang="ts">
import { Position } from "@/models/Position";
import { computed, onMounted, ref } from "vue";
import { prettyNumber, roundToTwo } from "@/Utilities";
import { Subscription } from "@/models/Subscription";
import ChannelsPicker from "./ChannelsPicker.vue";
import { UserChannel } from "@/models/Channel";
import SubscriptionFrequency from "./SubscriptionFrequency.vue";
import { UserFrequency } from "@/notifi_types";
import PositionListItem from "./PositionListItem.vue";
import { useRoute, useRouter } from "vue-router";

/* global defineProps, defineEmits */
const props = defineProps({
  position: { type: Position, required: true },
  showChannels: { type: Boolean, required: false, default: true },
  showButtons: { type: Boolean, required: false, default: true },
  showName: { type: Boolean, required: false, default: true },
  showPositionInfo: { type: Boolean, required: false, default: false },
});

const emit = defineEmits(["saved", "canceled", "launched"]);
const route = useRoute();
const router = useRouter();

const subscription = ref<Subscription | undefined>(props.position.subscription);
const channels = ref<UserChannel[]>([]);
const activePosition = ref<Position>(props.position);

onMounted(async () => {
  setupValues();
});

const setupValues = async (): Promise<void> => {
  subscription.value = await activePosition.value.fetchSubscription();
  const low =
    subscription.value != undefined &&
    subscription.value.positionLow !== undefined;
  const high: boolean =
    subscription.value !== undefined &&
    subscription.value.positionHigh !== undefined;
  valueChk.value = low || high;
  if (subscription.value?.positionLow)
    lowValue.value = subscription.value?.positionLow;
  else lowValue.value = roundToTwo(activePosition.value.value);
  setLowPercent();
  if (subscription.value?.positionHigh)
    highValue.value = subscription.value?.positionHigh;
  else highValue.value = roundToTwo(activePosition.value.value);
  setHighPercent();
  const chans = await subscription.value?.channels();
  if (chans) channels.value = chans;
  else channels.value = [];
};

const currentValue = computed((): string | undefined => {
  return `$${prettyNumber(activePosition.value.value)}`;
});

const currentValueMessages = computed(() => {
  if (
    subscription.value &&
    subscription.value.positionBaseline &&
    allowBaseline.value
  ) {
    const bl = roundToTwo(subscription.value.positionBaseline);
    return `Baseline was $${bl}`;
  }
  return undefined;
});

const allowBaseline = computed(() => {
  return (
    subscription.value?.positionBaseline != undefined &&
    subscription.value?.positionBaseline != activePosition.value?.value
  );
});

const rebaseline = () => {
  const bl = subscription.value?.positionBaseline;
  const cur = activePosition.value?.value;
  if (!bl || !cur) {
    return;
  }
  const oldHigh = subscription.value?.positionHigh;
  const oldLow = subscription.value?.positionLow;
  if (oldHigh) {
    let newHigh = oldHigh;
    if (bl > cur) {
      newHigh = oldHigh - (oldHigh * (bl - cur)) / bl;
    } else {
      newHigh = oldHigh + (oldHigh * (cur - bl)) / bl;
    }
    highValue.value = roundToTwo(newHigh);
  }
  if (oldLow) {
    let newLow = oldLow;
    if (bl > cur) {
      newLow = oldLow - (oldLow * (bl - cur)) / bl;
    } else {
      newLow = oldLow + (oldLow * (cur - bl)) / bl;
    }
    lowValue.value = roundToTwo(newLow);
  }
};

const name = ref(
  subscription.value?.name || props.position?.name || "New Position"
);
const valueChk = ref(false);

const maxValue = ref(50);
const minValue = ref(0);
const frequency = ref<typeof UserFrequency>(
  subscription.value?.userFrequency || "day"
);

const intLowValue = ref(
  roundToTwo(
    subscription.value?.positionLow || activePosition.value?.value || 0
  )
);
const lowValue = computed({
  get: () => intLowValue.value,
  set: (val: number | string) => {
    intLowValue.value = parseFloat(val as string);
    valueChk.value = true;
  },
});

const findLowPercent = (): number => {
  return Math.round(
    ((lowValue.value - activePosition.value?.value) /
      activePosition.value?.value) *
      100 +
      maxValue.value
  );
};

const setLowPercent = (): void => {
  const pct = findLowPercent();
  lowPercent.value = pct;
};

const lowPercent = ref(findLowPercent());
const lowValuePercent = computed({
  get: () => lowPercent.value,
  set: (val) => {
    lowPercent.value = val;
    lowValue.value = roundToTwo(
      activePosition.value?.value -
        ((maxValue.value - val) / 100) * activePosition.value.value
    );
  },
});
const lowValueLabel = computed(() => {
  return maxValue.value - lowPercent.value;
});

const lowRules = computed(() => {
  return [
    (val: number) => {
      return val - roundToTwo(activePosition.value?.value) > 0.001
        ? "Must be lower than current value"
        : true;
    },
  ];
});

const intHighValue = ref(
  roundToTwo(
    activePosition.value?.positionHigh || activePosition.value?.value || 0
  )
);
const highValue = computed({
  get: () => intHighValue.value,
  set: (val) => {
    intHighValue.value = val;
    valueChk.value = true;
  },
});

const findHighPercent = (): number => {
  return Math.round(
    ((intHighValue.value - activePosition.value?.value) /
      activePosition.value?.value) *
      100
  );
};

const setHighPercent = (): void => {
  const val = findHighPercent();
  highPercent.value = val;
};

const highPercent = ref(findHighPercent());
const highValuePercent = computed({
  get: () => highPercent.value,
  set: (val) => {
    highPercent.value = val;
    highValue.value =
      val == 0
        ? activePosition.value.value
        : roundToTwo(
            activePosition.value.value +
              (val / 100) * activePosition.value.value
          );
  },
});

const lowPositionViolated = computed((): boolean => {
  if (
    subscription.value == undefined ||
    subscription.value.positionLow == undefined
  )
    return false;
  return subscription.value.positionLow > activePosition.value?.value;
});

const highPositionViolated = computed((): boolean => {
  if (
    subscription.value == undefined ||
    subscription.value.positionHigh == undefined
  )
    return false;
  return subscription.value.positionHigh < activePosition.value?.value;
});
const newHighPositionViolated = computed((): boolean => {
  return intHighValue.value < roundToTwo(activePosition.value?.value);
});
const newLowPositionViolated = computed((): boolean => {
  return intLowValue.value > roundToTwo(activePosition.value?.value);
});

const highRules = computed(() => {
  return [
    (val: number) => {
      return activePosition.value?.value - val > 0.009
        ? "Must be higher than current value"
        : true;
    },
  ];
});

const setChannels = (chans: Array<UserChannel>) => {
  //console.log("set channels - " + chans.length);
  channels.value = chans;
};

const cancel = () => {
  emit("canceled");
};

const validSubmit = computed(() => {
  return (
    valueChk.value &&
    !newHighPositionViolated.value &&
    valueChk.value &&
    !newLowPositionViolated.value &&
    channels.value.length > 0
  );
});

const irrigate = (sub: Subscription) => {
  if (!sub) {
    return;
  }
  if (props.showName) {
    sub.set("name", name.value);
  }
  if (valueChk.value) {
    sub.positionHigh = highValue.value;
    sub.positionLow = lowValue.value;
    sub.positionBaseline = activePosition.value?.value;
  } else {
    sub.positionHigh = undefined;
    sub.positionLow = undefined;
  }
  //sub.frequency = frequency.value;
  if (props.showChannels) {
    sub.setUserChannels(channels.value);
  }
};

const message = computed(() => {
  let msg = "";
  if (valueChk.value) {
    msg = `${msg} changes in value`;
    let addOr = false;
    if (lowValue.value) {
      msg = `${msg} below ${prettyNumber(lowValue.value)}`;
      addOr = true;
    }
    if (highValue.value) {
      if (addOr) msg = `${msg} or`;
      msg = `${msg} above ${prettyNumber(highValue.value)}`;
    }
  }
  return msg;
});

const canComplete = computed(() => {
  return true;
});

const save = async () => {
  let sub = subscription.value;
  if (!sub) {
    sub = await activePosition.value.makeSubscription();
  }
  irrigate(sub);
  sub = await sub.save();
  subscription.value = sub;
  emit("saved");
};

const launch = () => {
  const path = route.fullPath;
  router.push({
    path: `/subscription/position/${subscription.value?.id}`,
    query: { returnPath: path },
  });
  emit("launched");
};

// eslint-disable-next-line no-undef
defineExpose({ irrigate, message, validSubmit, canComplete });
</script>

<style scoped></style>
