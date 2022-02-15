<template>
  <div class="row">
    <va-button
      v-if="subscription"
      icon="edit"
      @click="edit"
      size="small"
    ></va-button>
    <va-button
      v-if="subscription"
      icon="delete"
      @click="deleteSub"
      color="danger"
      class="ml-1"
      size="small"
    ></va-button>
    <va-button
      v-if="!subscription"
      icon="add"
      @click="add"
      size="small"
    ></va-button>
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
        label="Current Value"
      ></va-input>
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
        @change="setHighPercent"
      ></va-input>
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

<script lang="ts">
import { Position } from "@/models/Position";
import { computed, defineComponent, onMounted, ref, watchEffect } from "vue";
import { prettyNumber, roundToTwo } from "@/Utilities";
import { Subscription } from "@/models/Subscription";
import ChannelsPicker from "./ChannelsPicker.vue";
import { UserChannel } from "@/models/Channel";

export default defineComponent({
  components: {
    ChannelsPicker,
  },
  props: {
    position: { type: Position, required: true },
  },
  setup(props, { emit }) {
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

    const currentValue = computed(() => {
      return `$${prettyNumber(props.position.value)}`;
    });

    const name = ref(
      subscription.value?.name || props.position?.name || "New Position"
    );
    const valueChk = ref(false);

    const maxValue = ref(50);
    const minValue = ref(0);

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
          return val - props.position.value > 0.009
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
        ((intHighValue.value - props.position.value) / props.position.value) *
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
            ? props.position.value
            : roundToTwo(
                props.position.value + (val / 100) * props.position.value
              );
      },
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
      return channels.value.length > 0;
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
        //sub.set("positionBaseline", currentValue.value);
      } else {
        sub.positionHigh = undefined;
        sub.positionLow = undefined;
      }
      sub.setUserChannels(channels.value);
      sub = await sub.save();
      subscription.value = sub;
      show.value = false;
    };

    return {
      show,
      name,
      subscription,
      channels,
      currentValue,
      valueChk,
      lowValueLabel,
      lowValuePercent,
      intLowValue,
      lowValue,
      lowRules,
      setLowPercent,
      highValuePercent,
      intHighValue,
      highValue,
      highRules,
      setHighPercent,
      maxValue,
      minValue,
      add,
      edit,
      cancel,
      deleteSub,
      validSave,
      save,
      prettyNumber,
      setChannels,
    };
  },
});
</script>

<style scoped></style>
