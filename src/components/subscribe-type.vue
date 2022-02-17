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
        v-show="subType == undefined || subType == type"
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
      <div v-if="subType" class="flex xs1">
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

<script lang="ts">
import { defineComponent, ref } from "vue";

import { SubscriptionTypes } from "@/models/Subscription";

export default defineComponent({
  name: "SubscribeType",
  components: {},
  props: {},
  emits: ["select"],
  setup(props, { emit }) {
    const subType = ref<SubscriptionTypes | undefined>(undefined);
    const subTypes = ref<Record<string, SubscriptionTypes>>({
      protocol: SubscriptionTypes.protocol,
      wallet: SubscriptionTypes.wallet,
      contract: SubscriptionTypes.contract,
    });

    const clear = (): void => {
      subType.value = undefined;
      emit("select", undefined);
    };

    const selectType = (t: SubscriptionTypes): void => {
      subType.value = t;
      emit("select", t);
    };

    return {
      subType,
      subTypes,
      clear,
      selectType,
    };
  },
  methods: {
    // returns the current user or raises an error if none
    typeIcon(t: SubscriptionTypes): string {
      if (t == SubscriptionTypes.wallet) {
        return "account_balance_wallet";
      } else if (t == SubscriptionTypes.protocol) {
        return "announcement";
      } else if (t == SubscriptionTypes.contract) {
        return "gavel";
      }
      return "";
    },
    typeContent(t: SubscriptionTypes): string {
      if (t == SubscriptionTypes.wallet) {
        return "Alerts for transactions that occur in your wallet(s).";
      } else if (t == SubscriptionTypes.protocol) {
        return "Ad Hoc updates and information from your Protocols";
      } else if (t == SubscriptionTypes.contract) {
        return "Smart contract alerts for Events which occur on chain";
      }
      return "";
    },
  },
});
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
