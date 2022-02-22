<template>
  <div class="row ml-2 pb-1">
    <div v-if="availableChannels.length > 0" class="flex xs2">
      <va-button-dropdown
        right-icon
        icon="add"
        class="mr-2 mb-2"
        color="secondary"
        size="small"
      >
        <div
          v-for="channel in availableChannels"
          :key="channel.id"
          class="flex pb-1"
        >
          <va-chip
            style="font-size: x-small"
            size="small"
            color="secondary"
            :icon="channel.providerIcon"
            @click="addChannel(channel)"
          >
            {{ channel.name }}
          </va-chip>
        </div>
      </va-button-dropdown>
    </div>
    <div class="flex xs4"><strong>Channels:</strong></div>
  </div>
  <div class="layout gutter--sm">
    <div class="row ml-2">
      <div v-for="channel in channels" :key="channel.id" class="flex">
        <va-chip
          style="font-size: x-small"
          :icon="channel.providerIcon"
          size="small"
          closeable
          @update:modelValue="removeChannel(channel)"
          >{{ channel.name }}
        </va-chip>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { UserChannel } from "@/models/Channel";
import { Subscription } from "@/models/Subscription";
import { channelsModule } from "@/store/channels";
import { computed, ref, watchEffect } from "vue";

/* global defineProps, defineEmits */
const emit = defineEmits(["channels", "add", "remove"]);
const props = defineProps({
  subscription: { type: Subscription, required: false },
  autoSave: { type: Boolean, required: false, default: true },
});

const channels = ref([] as UserChannel[]);
const activeSubscription = ref<Subscription>();

watchEffect(async () => {
  if (props.subscription) {
    activeSubscription.value = props.subscription;
    channels.value = await props.subscription.channels();
  }
});

const availableChannels = computed(() => {
  const myChannels = channelsModule.myChannels;
  const chans: UserChannel[] = [];
  for (let i = 0; i < myChannels.length; i++) {
    let cand = myChannels[i];
    let existing = channels.value.find((elem) => {
      return elem.id == cand.id;
    });
    if (!existing) {
      chans.push(cand);
    }
  }
  return chans;
});

const removeChannel = async (chan: UserChannel) => {
  if (channels.value.length < 2) {
    alert("You can't remove the last channel on a subscription");
  } else {
    let text = `Are you sure you want to remove '${chan.name} from this subscription?`;
    if (confirm(text) == true) {
      if (props.autoSave && activeSubscription.value)
        await chan.removeSubscription(activeSubscription.value);
      const idx = channels.value.findIndex((c) => c.id == chan.id);
      if (idx != -1) {
        channels.value.splice(idx, 1);
        emit("remove", chan.value);
      }
      emit("channels", channels.value);
    }
  }
};
const addChannel = async (chan: UserChannel) => {
  if (props.autoSave && activeSubscription.value)
    await chan.addSubscription(activeSubscription.value);
  channels.value.push(chan);
  emit("add", chan.value);
  emit("channels", channels.value);
};
</script>
