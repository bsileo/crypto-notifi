<template>
  <va-list-item>
    <va-list-item-section avatar v-show="draggable">
      <va-icon name="drag_indicator"></va-icon>
    </va-list-item-section>
    <va-list-item-section>
      <va-list-item-label>
        <va-icon :name="subscription.typeIcon" />
        {{ subscription.name }}
      </va-list-item-label>
    </va-list-item-section>
    <va-list-item-section icon>
      <va-inner-loading :loading="pausing" :size="18">
        <va-button
          size="small"
          :icon="playPauseIcon"
          @click.prevent="togglePause()"
          :color="paused ? 'warning' : 'success'"
        />
      </va-inner-loading>
      <router-link :to="allowEdit ? subscription.url : ''">
        <va-button
          class="ml-1"
          size="small"
          icon="edit"
          :disabled="!allowEdit"
        />
      </router-link>
    </va-list-item-section>
  </va-list-item>
</template>

<script setup lang="ts">
import { Subscription } from "@/models/Subscription";
import { SubscriptionStatus } from "@/notifi_types";
import { computed } from "@vue/reactivity";
import { ref } from "vue";

/* global defineProps */
const props = defineProps({
  subscription: { type: Subscription, required: true },
  draggable: { type: Boolean, required: false, default: false },
});

const status = ref(props.subscription.status);
const pausing = ref(false);
const paused = computed(() => {
  return status.value == "paused";
});
const playPauseIcon = computed(() => {
  return paused.value ? "pause" : "play_arrow";
});
const togglePause = async (): Promise<void> => {
  pausing.value = true;
  if (paused.value) {
    status.value = SubscriptionStatus.active;
  } else {
    status.value = SubscriptionStatus.paused;
  }
  props.subscription.set("status", status.value);
  await props.subscription.save();
  pausing.value = false;
};
const allowEdit = computed((): boolean => {
  return props.subscription.subscriptionType == "Position";
});
</script>
