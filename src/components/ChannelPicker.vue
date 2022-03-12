<template>
  <va-select
    :options="emailOnly ? emailChannels : userChannels"
    :label="label"
    v-model="selectedChannel"
    text-by="name"
    track-by="id"
    :messages="messages"
  ></va-select>
</template>

<script setup lang="ts">
import { UserChannel } from "@/models/Channel";
import { computed, onMounted, ref } from "vue";
import { useUserChannelsStore } from "@/store/pinia_userChannel";
import { storeToRefs } from "pinia";

// eslint-disable-next-line no-undef
const emit = defineEmits(["update:modelValue"]);
// eslint-disable-next-line no-undef
const props = defineProps({
  required: { type: Boolean, required: false, default: true },
  modelValue: { type: UserChannel, required: false },
  label: { type: String, required: false, default: "Channels" },
  emailOnly: { type: Boolean, required: false, default: false },
});
const userChannelsStore = useUserChannelsStore();
onMounted(() => {
  userChannelsStore.setupChannels();
});

const selectedChannel = computed({
  get: (): UserChannel | undefined => {
    return props.modelValue;
  },
  set: (val: UserChannel | undefined) => {
    const newVal = userChannelsStore.userChannels.find((c) => c.id == val?.id);
    emit("update:modelValue", newVal);
  },
});

const messages = props.required ? "Required" : "";
const { userChannels, emailChannels } = storeToRefs(userChannelsStore);
</script>
