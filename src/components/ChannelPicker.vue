<template>
  <va-select
    :options="channels"
    :label="label"
    v-model="selectedChannel"
    text-by="name"
    track-by="id"
    :messages="messages"
  ></va-select>
</template>

<script setup lang="ts">
import { UserChannel } from "@/models/Channel";
import { computed, ref } from "vue";
import { channelsModule } from "@/store/channels";

// eslint-disable-next-line no-undef
const emit = defineEmits(["update:modelValue"]);
// eslint-disable-next-line no-undef
const props = defineProps({
  required: { type: Boolean, required: false, default: true },
  modelValue: { type: UserChannel, required: false },
  label: { type: String, required: false, default: "Channels" },
  emailOnly: { type: Boolean, required: false, default: false },
});

const selectedChannel = computed({
  get: (): UserChannel | undefined => {
    return props.modelValue;
  },
  set: (val: UserChannel | undefined) => {
    const newVal = channels.value.find((c) => c.id == val?.id);
    emit("update:modelValue", newVal);
  },
});

const messages = props.required ? "Required" : "";
const channels = computed(() => channelsModule.emailChannels);
</script>
