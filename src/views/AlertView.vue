<template>
  <div v-if="showPlain">{{ contentPlain }}</div>
  <div v-if="contentRich" v-html="contentRich"></div>
</template>

<script setup lang="ts">
import { AlertHistory } from "@/models/AlertHistory";
import { computed, ref } from "vue";

/* global defineProps */
const props = defineProps({
  alertID: { type: String, required: true },
});
const contentPlain = computed(() => {
  return alertHistory.value?.content;
});
const showPlain = computed(() => contentRich.value == undefined)
const contentRich = computed(() => {
  return alertHistory.value?.richContent;
});
const alertHistory = ref<AlertHistory>();

const fetchAlertHistory = async () => {
  alertHistory.value = await AlertHistory.fetchByAlertID(props.alertID);
};

fetchAlertHistory();
</script>

<style scoped></style>
