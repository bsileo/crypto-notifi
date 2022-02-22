<template>
  <div class="flex">
    <div class="row pl-4 pt-2 pb-3 gutter--xs2 gutter--md4">
      <div v-show="subType == undefined" class="pb-3">
        <h1>Select a Subscription Type to Create:</h1>
      </div>
      <va-card
        class="flex sm3 mr-2"
        v-for="type in subTypes"
        v-bind:key="type"
        v-show="(subType == 'new' && type != 'Position') || type == subType"
        href="#"
        :color="subType == type ? '#DDD' : '#FFF'"
        :stripe="true"
        :stripe-color="subType == type ? 'info' : 'dark'"
        @click.prevent="selectType(type)"
      >
        <va-card-title>
          <va-icon :name="typeIcon(type)"></va-icon>
          {{ type }}
        </va-card-title>
        <va-card-content>
          {{ typeContent(type) }}
        </va-card-content>
      </va-card>
      <div v-if="subType != `new`" class="flex xs1">
        <va-button
          @click="clear"
          size="small"
          color="secondary"
          icon="clear"
          class="float-right"
        ></va-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { SubscriptionTypes, SubscriptionTypesName, SubscriptionTypesSymbol } from "@/notifi_types";

/* global defineProps, defineEmits */
const props = defineProps(["modelValue"]);
const emit = defineEmits(["update:modelValue"]);

type SubTypeNames = SubscriptionTypesName | "new";

const subTypes = ref<typeof SubscriptionTypes>(SubscriptionTypes);
const subType = ref<SubTypeNames>(props.modelValue as SubscriptionTypesName);

const clear = (): void => {
  subType.value = "new";
  emit("update:modelValue", "new");
};

const selectType = (t: SubTypeNames): void => {
  subType.value = t;
  emit("update:modelValue", t);
};

const showSubtype = (t: SubTypeNames) => {
  if (subType.value == "new") return t != SubscriptionTypes.position;
  return subType.value == t;
};

// returns the current user or raises an error if none
const typeIcon = (t: SubscriptionTypesName): string => {
  if (t == SubscriptionTypes.wallet) {
    return "account_balance_wallet";
  } else if (t == SubscriptionTypes.protocol) {
    return "announcement";
  } else if (t == SubscriptionTypes.contract) {
    return "gavel";
  }
  return "";
};
const typeContent = (t: SubscriptionTypesName): string => {
  if (t == SubscriptionTypes.wallet) {
    return "Alerts for transactions that occur in your wallet(s).";
  } else if (t == SubscriptionTypes.protocol) {
    return "Ad Hoc updates and information from your Protocols";
  } else if (t == SubscriptionTypes.contract) {
    return "Smart contract alerts for Events which occur on chain";
  } else if (t == SubscriptionTypes.position) {
    return "Alerts for changes in a current Position";
  }
  return "";
};
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
