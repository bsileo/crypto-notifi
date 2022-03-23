<template>
  <div class="flex">
    <div class="row pt-2" v-if="showFrom">
      <va-switch
        class="flex xs2 sm2 lg1 pr-3"
        color="primary"
        :disabled="!validFrom"
        v-model="chkFrom"
      />
      <div v-if="!fromMe" class="flex xs8 sm8 lg9">
        <ContractInput
          label="From Address"
          :chainPrompt="false"
          :showToken="false"
          :initialAddress="from_address"
          :addressOptions="myAddresses"
          @address="setFromAddress"
        >
        </ContractInput>
      </div>
      <va-select
        class="flex xs8 sm8 lg9"
        :options="myAddresses"
        v-if="fromMe"
        label="From Address"
        v-model="from_address"
        :success="validFrom"
      />
      <va-checkbox
        vlass="flex xs1 sm1"
        v-model="fromMe"
        checked-icon="person"
      />
    </div>
    <div class="row pt-2" v-if="showTo">
      <va-switch
        class="flex xs2 lg1 pr-3"
        color="primary"
        :disabled="!validTo"
        v-model="chkTo"
      />
      <div v-if="!toMe" class="flex xs8 lg9">
        <ContractInput
          label="To Address"
          :chainPrompt="false"
          :showToken="false"
          :initialAddress="to_address"
          :addressOptions="myAddresses"
          @address="setToAddress"
        >
        </ContractInput>
      </div>
      <va-select
        class="flex xs8 lg9"
        v-if="toMe"
        :options="myAddresses"
        label="To Address"
        v-model="to_address"
        :success="validTo"
      />
      <va-checkbox class="flex xs1" v-model="toMe" checked-icon="person" />
    </div>
    <div class="row pt-2" v-if="showValue">
      <va-switch
        class="flex xs2 lg1"
        color="primary"
        :disabled="!allowValue"
        v-model="chkValue"
      />
      <va-select
        class="flex xs3 lg4"
        label="Transaction value is"
        v-model="valueOp"
        :options="valueOperators"
      />
      <va-input class="flex xs5" label="This Value" v-model="value" />
    </div>
    <div class="row pt-2" v-if="showChain">
      <va-switch
        class="flex xs2 lg1"
        color="primary"
        :disabled="true"
        v-model="chkChain"
      />
      <div class="flex xs3">
        <ChainPicker @selected="setChain" required></ChainPicker>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject, getCurrentInstance, ref, watch, computed } from "vue";

import { userModule } from "@/store/user";
import { Subscription } from "@/models/Subscription";

import Moralis from "moralis";
import { Chain } from "@/models/Contract";
import { NotifiUser } from "@/models/NotifiUser";
import ContractInput from "./contractInput.vue";
import ChainPicker from "./ChainPicker.vue";

/* global defineProps  defineEmits */
const props = defineProps({
  subscriptionID: { type: String, required: false },
});
const emit = defineEmits(["changed"]);

const fetching = ref(false);
const activeSubscription = ref<Subscription>();
const fetchBySubscriptionID = async (subID: string): Promise<Subscription> => {
  fetching.value = true;
  const sub = await Subscription.fetch(subID);
  if (sub) {
    activeSubscription.value = sub;
    from_address.value = sub.fromAddress;
    to_address.value = sub.toAddress;
    value.value = sub.value;
    valueOp.value = sub.valueOperator;
    chain.value = sub.get("chain");
    fetching.value = false;
    return sub;
  }
  throw "Invalid Subscription ID";
};

const chain = ref<Chain>("avalanche");
const chkFrom = ref(false);
const newFrom = ref("");
const fromMe = ref(true);
const chkTo = ref(false);
const newTo = ref("");
const toMe = ref(false);
const chkValue = ref(false);
const value = ref(0);
const valueOp = ref("");
const valueOperators = ref(["=", ">", "<"]);
const chkChain = ref(true);

watch(
  value,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (newVal: number, oldVal: number): void => {
    if (newVal && parseFloat(newVal.toString())) {
      chkValue.value = true;
    }
  }
);

/*  watch(subscription,
    (newSub: Subscription, oldSub: Subscription): void => {
      subName.value = newSub.attributes.name;
      newFrom.value = newSub.attributes.fromAddress;
      newTo.value = newSub.attributes.toAddress;
    });
*/
// Should we enable the Value on/off slider?
const allowValue = computed((): boolean => {
  return value.value > 0 && valueOp.value != null;
});
// Are we allowed to enter a Value criteria for the current Subscription Type?
const showValue = computed((): boolean => {
  return true;
});
const showChain = computed((): boolean => {
  return true;
});

const showFrom = computed((): boolean => {
  return true;
});
const myAddresses = computed((): string[] => {
  const user = Moralis.User.current();
  if (user) {
    return user.get("accounts");
  }
  return [];
});
const from_address = computed({
  get: () => {
    if (newFrom.value) {
      return newFrom.value;
    }
    return "";
  },
  set: (newValue: string) => {
    newFrom.value = newValue;
    if (validFrom.value) chkFrom.value = true;
  },
});
const showTo = computed((): boolean => {
  return true;
});
const to_address = computed({
  get: () => {
    if (newTo.value) {
      return newTo.value;
    }
    return "";
  },
  set: (newValue: string) => {
    newTo.value = newValue;
    if (validTo.value) chkTo.value = true;
  },
});
const validTo = computed((): boolean => {
  return (
    to_address.value?.length == 42 && from_address.value !== to_address.value
  );
});
const validFrom = computed((): boolean => {
  return (
    from_address.value?.length == 42 && from_address.value !== to_address.value
  );
});
const validSubmit = computed((): boolean => {
  return validWalletSubmit.value;
});
const validWalletSubmit = computed((): boolean => {
  let dupAddresses = false;
  if (chkTo.value && chkFrom.value) {
    dupAddresses = to_address.value == from_address.value;
  }
  return (
    !dupAddresses &&
    (!chkTo.value || validTo.value) &&
    (!chkFrom.value || validFrom.value) &&
    (!chkValue.value || (valueOp.value != null && value.value > 0)) &&
    chain.value != undefined
  );
});
const message = computed((): string => {
  let msg = "Wallet Transactions";
  if (chkFrom.value) {
    msg = `${msg} <br/>received from <strong>${from_address.value}</strong>`;
  }
  if (chkTo.value) {
    msg = `${msg} <br/>sent to <strong>${to_address.value}</strong>`;
  }
  if (chkValue.value) {
    msg = `${msg} <br/>whose <strong>Value is ${valueOp.value} ${value.value}</strong>`;
  }
  if (chain.value != undefined && msg != "") {
    msg = `${msg} <br/>on the <strong>${chain.value} blockchain</strong>`;
  }
  return msg;
});

const userID = (): string => {
  if (Moralis.User.current()) {
    return Moralis.User.current().id;
  } else {
    console.error("UserID is unset");
    throw "UserID is unset";
  }
};
const setFromAddress = (address: string) => {
  from_address.value = address;
};
const setToAddress = (address: string) => {
  to_address.value = address;
};
const setChain = (c: Chain) => {
  chain.value = c;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const canComplete = computed((): boolean => {
  return true;
});

const irrigate = (s: Subscription): Subscription => {
  if (chkFrom.value) {
    s.set("fromAddress", from_address.value);
  }
  if (chkTo.value) {
    s.set("toAddress", to_address.value);
  }
  if (chkValue.value) {
    s.set("value", `${value.value}`);
    s.set("valueOperator", valueOp.value);
  }
  if (chkChain.value) {
    s.set("chain", chain.value);
  }
  return s;
};

if (props.subscriptionID) {
  await fetchBySubscriptionID(props.subscriptionID);
}

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
