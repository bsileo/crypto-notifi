<template>
  <div class="pl-4">
    <PositionEditor
      ref="editor"
      :position="position"
      :showChannels="false"
      :showButtons="false"
      :showPositionInfo="true"
      :showName="false"
    ></PositionEditor>
  </div>
</template>

<script setup lang="ts">
import PositionEditor from "./PositionEditor.vue";
import { Subscription } from "@/models/Subscription";
import { Protocol } from "@/models/Protocol";
import { computed, ref } from "vue";
import { Position } from "@/models/Position";

// eslint-disable-next-line no-undef
const props = defineProps({
  subscriptionID: { type: String, required: false },
});
// eslint-disable-next-line no-undef
const emit = defineEmits(["changed"]);

const subscription = ref<Subscription>();
const position = ref<Position>();
const editor = ref<PositionEditor>(null);

const fetchBySubscriptionID = async (subID: string): Promise<Subscription> => {
  const sub = await Subscription.fetch(subID);
  if (subID) {
    const prot: Protocol = sub.protocol;
    await prot.fetch();
    const pos = await prot.getPosition(
      sub.contractChain,
      sub.contractAddress,
      sub.positionStatus
    );
    if (!pos) throw "Orphan Subscription - No Position Found";
    subscription.value = sub;
    position.value = pos;
    return sub;
  }
  throw "Invalid Subscription ID";
};
if (props.subscriptionID) {
  await fetchBySubscriptionID(props.subscriptionID);
} else {
  console.log("No SUBID need to handle NEW case");
  position.value = new Position({}, new Protocol());
}

const irrigate = (s: Subscription): void => {
  if (editor.value) {
    editor.value.irrigate(s);
  }
};

const message = computed((): string => {
  const info = editor.value.message;
  return info;
});

const validSubmit = computed((): boolean => {
  return editor.value.validSubmit;
});

const canComplete = computed((): boolean => {
  return editor.value.canComplete;
});

// eslint-disable-next-line no-undef
defineExpose({ irrigate, message, validSubmit, canComplete });
</script>

<style scoped>
div.active {
  background-color: rgb(197 47 47);
}
.protocolCards {
  max-height: 30em;
  overflow-y: scroll;
  overflow-x: clip;
}
</style>
