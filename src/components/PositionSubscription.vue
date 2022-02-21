<template>
  <div class="row">
    <div v-if="subscription" class="flex xs6" style="font-size: smaller">
      <div v-if="subscription.positionLow" :style="lowPositionStyle">
        <va-icon
          name="arrow_drop_down"
          :color="lowPositionViolated ? 'danger' : ''"
        />
        ${{ prettyNumber(subscription.positionLow) }}
      </div>
      <div v-if="subscription.positionHigh" :style="highPositionStyle">
        <va-icon
          name="arrow_drop_up"
          :color="highPositionViolated ? 'danger' : ''"
        />
        ${{ prettyNumber(subscription.positionHigh) }}
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
      <va-button
        icon="add"
        @click="add"
        size="small"
      ></va-button>
    </div>
  </div>
  <va-modal v-model="show" no-dismiss hide-default-actions>
    <div class="row">
      <va-input
        class="flex xs12 sm8 offset--sm2 pb-2"
        label="Subscription Name"
        v-model="name"
        placeholder="Subscription Name"
      ></va-input>
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
          ><va-icon
          name="horizontal_distribute"
          @click.prevent="rebaseline"
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
    <div class="row pt-3">
      <SubscriptionFrequency
        :subscription="subscription"
        v-model="frequency"
      ></SubscriptionFrequency>
    </div>
    <va-divider dashed inset></va-divider>
    <div class="row">
      <ChannelsPicker
        :subscription="subscription"
        @channels="setChannels"
        :autoSave="false"
      ></ChannelsPicker>
    </div>
    <template #footer>
      <va-button icon="save" @click="save" size="medium" :disabled="!validSave"
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
    </template>
  </va-modal>
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

/* global defineProps, defineEmits */
const props = defineProps({
  position: { type: Position  , required: true },

});

const subscription = ref<Subscription | undefined>(undefined);
const channels = ref<UserChannel[]>([]);

onMounted(async () => {
  const sub = await props.position.fetchSubscription();
  subscription.value = sub;
  setupValues();
});

const setupValues = async (): Promise<void> => {
  const low =
    subscription.value != undefined &&
    subscription.value.positionLow !== undefined;
  const high: boolean =
    subscription.value !== undefined &&
    subscription.value.positionHigh !== undefined;
  valueChk.value = low || high;
  if (subscription.value?.positionLow)
    lowValue.value = subscription.value?.positionLow;
  else lowValue.value = roundToTwo(props.position.value);
  setLowPercent();
  if (subscription.value?.positionHigh)
    highValue.value = subscription.value?.positionHigh;
  else highValue.value = roundToTwo(props.position.value);
  setHighPercent();
  const chans = await subscription.value?.channels();
  if (chans) channels.value = chans;
  else channels.value = [];
};

const currentValue = computed((): string | undefined => {
  return `$${prettyNumber(props.position.value)}`;
});

const currentValueMessages = computed(() => {
  if (subscription.value && subscription.value.positionBaseline && allowBaseline.value) {
    const bl = roundToTwo(subscription.value.positionBaseline);
    return `Baseline was $${bl}`;
  }
  return undefined;
})

const allowBaseline = computed(() => {
  return subscription.value?.positionBaseline != undefined &&
      subscription.value?.positionBaseline != props.position.value;
})

const rebaseline = () => {
  const bl = subscription.value?.positionBaseline;
  const cur = props.position.value;
  if (!bl || !cur) {
    return;
  }
  const oldHigh = subscription.value?.positionHigh;
  const oldLow = subscription.value?.positionLow;
  if (oldHigh) {
    let newHigh = oldHigh;
    if (bl > cur) {
      newHigh =  oldHigh - oldHigh * (bl - cur) / bl;
    } else {
      newHigh =  oldHigh + oldHigh * (cur - bl) / bl;
    }
    highValue.value = roundToTwo(newHigh);
  }
  if (oldLow) {
    let newLow = oldLow;
    if (bl > cur) {
      newLow =  oldLow - oldLow * (bl - cur) / bl;
    } else {
      newLow =  oldLow + oldLow * (cur - bl) / bl;
    }
    lowValue.value = roundToTwo(newLow);
  }

}

const name = ref(
  subscription.value?.name || props.position?.name || "New Position"
);
const valueChk = ref(false);

const maxValue = ref(50);
const minValue = ref(0);
const frequency = ref<typeof UserFrequency>(subscription.value?.userFrequency || "day");

const intLowValue = ref(
  roundToTwo(subscription.value?.positionLow || props.position.value)
);
const lowValue = computed({
  get: () => intLowValue.value,
  set: (val) => {
    intLowValue.value = val;
    valueChk.value = true;
  },
});

const findLowPercent = (): number => {
  return Math.round(
    ((lowValue.value - props.position.value) / props.position.value) * 100 +
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
      props.position.value -
        ((maxValue.value - val) / 100) * props.position.value
    );
  },
});
const lowValueLabel = computed(() => {
  return maxValue.value - lowPercent.value;
});

const lowRules = computed(() => {
  return [
    (val: number) => {
      return val - roundToTwo(props.position.value) > 0.001
        ? "Must be lower than current value"
        : true;
    },
  ];
});

const intHighValue = ref(
  roundToTwo(props.position.positionHigh || props.position.value)
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
    ((intHighValue.value - props.position.value) / props.position.value) * 100
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
        ? props.position.value
        : roundToTwo(props.position.value + (val / 100) * props.position.value);
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
const newHighPositionViolated = computed((): boolean => {
  return intHighValue.value < roundToTwo(props.position.value);
});
const newLowPositionViolated = computed((): boolean => {
  return intLowValue.value > roundToTwo(props.position.value);
});

const highPositionStyle = computed(() => {
  return {
    color: highPositionViolated.value ? "red" : "",
  };
});
const positionSummary = computed((): string => {
  let res = "";
  if (!subscription.value) return res;
  const sub = subscription.value;
  if (subscription.value.positionLow) {
    res = `${res} <va-icon name="arrow_drop_down"></va-icon> $${sub.positionLow}`;
  }
  if (sub.positionHigh) {
    res = `${res} <va-icon name="arrow_drop_up" :size="16"></va-icon> $${sub.positionHigh}`;
  }
  return res;
});

const highRules = computed(() => {
  return [
    (val: number) => {
      return props.position.value - val > 0.009
        ? "Must be higher than current value"
        : true;
    },
  ];
});

const show = ref(false);
const setChannels = (chans: Array<UserChannel>) => {
  //console.log("set channels - " + chans.length);
  channels.value = chans;
};

const add = () => {
  show.value = true;
};
const edit = () => {
  show.value = true;
};
const cancel = () => {
  show.value = false;
};
const deleteSub = () => {
  subscription.value?.destroy();
  subscription.value = undefined;
};

const validSave = computed(() => {
  return (
    valueChk.value &&
    !newHighPositionViolated.value &&
    valueChk.value &&
    !newLowPositionViolated.value &&
    channels.value.length > 0
  );
});
const save = async () => {
  let sub = subscription.value;
  if (!sub) {
    sub = await props.position.makeSubscription();
  }
  sub.set("name", name.value);
  if (valueChk.value) {
    sub.positionHigh = highValue.value;
    sub.positionLow = lowValue.value;
    sub.positionBaseline = props.position.value;
  } else {
    sub.positionHigh = undefined;
    sub.positionLow = undefined;
  }
  sub.frequency = frequency.value;
  sub.setUserChannels(channels.value);
  sub = await sub.save();
  subscription.value = sub;
  show.value = false;
};
</script>

<style scoped></style>
