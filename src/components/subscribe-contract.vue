<template>
  <div class="pl-4">
    <div v-show="!selectedProtocol" class="row">
      <div class="pb-3">
        <h1>Select a Protocol:</h1>
      </div>
      <ProtocolSelector
        :showSearch="true"
        :showUserInfo="true"
        @selection="selectProtocol"
      ></ProtocolSelector>
    </div>
    <div v-if="selectedProtocol" class="row">
      <ProtocolInfo
        :protocol="selectedProtocol"
        :selected="false"
        :showVote="false"
        :showUserInfo="true"
        :showFavorites="true"
        :allowSelect="false"
        :showSubscribe="false"
        displayMode="narrow"
      >
      </ProtocolInfo>
      <div class="flex xs1">
        <va-button
          @click="clearProtocol"
          size="small"
          color="secondary"
          icon="clear"
          class="float-right"
        ></va-button>
      </div>
    </div>
  </div>
  <va-divider inset />
  <div v-if="protocolNoContracts" class="flex row pt-2">
    <div class="flex xs12 sm8 md6">
      <va-card :bordered="false">
        <va-card-title>Vote for this Protocol!</va-card-title>
        <va-card-content>
          This protocol has not joined up with Notifi yet. Click to Vote and
          help encourage them to enroll their Contract Events!
        </va-card-content>
        <va-card-actions>
          <va-popover
            color="primary"
            message="Request support for this Protocol on Notifi"
          >
            <va-button size="large" @click="voteFor(protocol)">Vote</va-button>
          </va-popover>
        </va-card-actions>
      </va-card>
    </div>
  </div>
  <div v-show="showCompletion">
    <div class="row pt-2">
      <va-select
        class="flex sm6"
        label="Contract Name"
        v-model="contractID"
        :options="contracts"
        :track-by="(option) => option.id"
        value-by="id"
        text-by="description"
        searchable
        :rules="[validContract || 'Select a contract']"
      />
      <va-select
        class="flex sm4"
        label="Contract Activity"
        v-model="contractActivityID"
        :options="contractActivities"
        track-by="id"
        value-by="id"
        :text-by="(option) => option.nameAndLevel"
        searchable
      />
    </div>
    <div class="row pt-2">
      <div class="flex sm-3"></div>
      <div class="flex sm-9 mb-2 justify-self--end">
        <va-alert
          :border-color="activityAllowed ? 'success' : 'danger'"
          border="top"
        >
          <template v-slot:icon>
            <va-icon
              :name="activityAllowed ? 'psychology' : 'error'"
              :color="activityAllowed ? 'info' : 'danger'"
            ></va-icon>
          </template>
          <template v-slot:title>Activity:</template>
          <template v-slot:default
            ><span v-html="activityDescription"></span
          ></template>
        </va-alert>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";

import { Subscription } from "@/models/Subscription";
import { Protocol } from "@/models/Protocol";
import { ContractActivity } from "@/models/ContractActivity";

import { contractsModule } from "@/store/contracts";
import { Contract } from "@/models/Contract";
import ProtocolSelector from "./ProtocolSelector.vue";
import ProtocolInfo from "./ProtocolInfo.vue";
import { useRoute } from "vue-router";

/* global defineProps  defineEmits */
const props = defineProps({
  subscription: { type: Subscription, required: false },
  protocol: { type: Protocol, required: false },
  subscriptionID: { type: String, required: false },
});
const emit = defineEmits(["changed"]);
const route = useRoute();

const fetchBySubscriptionID = async (subID: string): Promise<Subscription> => {
  const sub = await Subscription.fetch(subID);
  if (sub) {
    activeSubscription.value = sub;
    const prot: Protocol = sub.protocol;
    await prot.fetch();
    selectedProtocol.value = prot;
    contractID.value = sub.contract.id;
    contractActivityID.value = sub.contractActivity.id;
    await fetchContractActivities();
    fetching.value = false;
    return sub;
  }
  throw "Invalid Subscription ID";
};

const fetching = ref(false);
const activeSubscription = ref<Subscription>();

const contractID = ref<string | undefined>();
const contractActivityID = ref<string | undefined>();
const intSelectedProtocol = ref<Protocol | undefined>(props.protocol);

const contractActivities = ref<Array<ContractActivity>>([]);

const clearProtocol = () => {
  selectedProtocol.value = undefined;
};
const selectProtocol = (prot: Protocol) => {
  selectedProtocol.value = prot;
};
const selectedProtocol = computed({
  get(): Protocol | undefined {
    return intSelectedProtocol.value;
  },
  set(val: Protocol | undefined) {
    intSelectedProtocol.value = val;
  },
});
const voteFor = async (): Promise<void> => {
  if (!selectedProtocol.value) return undefined;
  await selectedProtocol.value.siteVote();
  //this.$forceUpdate();
};

watch(selectedProtocol, (): void => {
  contractID.value = "";
  contractActivityID.value = "";
});

watch(contractID, () => {
  fetchContractActivities();
});

const selectedContract = computed((): Contract | undefined => {
  return contracts.value.find((e) => e.id == contractID.value);
});

const selectedContractActivity = computed((): ContractActivity | undefined => {
  const ca = contractActivities.value.find(
    (e) => e.id == contractActivityID.value
  );
  if (!ca) return undefined;
  return ca;
});

const activityDescription = computed((): string => {
  const act = selectedContractActivity.value;
  if (!act) return "";
  let res = act.description;
  if (!activityAllowed.value) {
    const prot = selectedProtocol.value;
    const actTokens = prot?.goldQuantity;
    const symbol = prot?.symbol;
    const bal = prot?.getWalletBalance();
    res =
      res +
      `<br/><br/>Warning: Requires protocol level <strong>${act.level}</strong>.  Stake at least ${actTokens} tokens in ${symbol} to subscribe to this activity. Your wallet holds ${bal}`;
  }
  return res;
});

// True if the current user is allowed to subscribe to the selected ContractActivity
const activityAllowed = computed((): boolean => {
  const act = selectedContractActivity.value;
  const prot = selectedProtocol.value;
  if (!prot || !act) {
    return false;
  }
  return prot.userSubscriptionAllowed(act);
});

const validContract = computed((): boolean => {
  return true;
});
const protocolNoContracts = computed((): boolean => {
  if (selectedProtocol.value) return contracts.value.length == 0;
  return false;
});

const showCompletion = computed((): boolean => {
  return selectedProtocol.value != undefined && contracts.value.length > 0;
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const canComplete = computed((): boolean => {
  return selectedProtocol.value != undefined && contracts.value.length > 0;
});

const contracts = computed((): Contract[] => {
  if (selectedProtocol.value) {
    return contractsModule.allContracts.filter(
      (c) => c.get("protocol").id == selectedProtocol.value?.id
    );
  }
  return [];
});
const validSubmit = computed((): boolean => {
  return validContractSubmit.value;
});

const validContractSubmit = computed((): boolean => {
  return (
    selectedContract.value != undefined &&
    selectedContractActivity.value != undefined &&
    activityAllowed.value
  );
});

const message = computed((): string => {
  let msg = "";
  if (selectedProtocol.value) {
    msg = `the <strong>${selectedProtocol.value.name} Protocol</strong>`;
  }
  msg = `${msg} which trigger on`;
  if (selectedContractActivity.value?.type == "Transaction") {
    msg = `${msg} <strong>Transactions</strong>`;
  } else {
    msg = `${msg} <strong>${selectedContractActivity.value?.name}</strong>`;
  }
  if (selectedContract.value) {
    msg = `${msg} for the contract <strong>${selectedContract.value.description}</strong>`;
    msg = `${msg} on the <strong>${selectedContract.value.chain} blockchain</strong>`;
  }
  return msg;
});

const fetchContractActivities = async (): Promise<void> => {
  const res: ContractActivity[] = [];
  const ci = selectedContract.value;
  let curFound = false;
  if (ci) {
    const actsRel = ci.relation("ContractActivities");
    const acts: ContractActivity[] = await actsRel.query().find();
    for (let i = 0; i < acts.length; i = i + 1) {
      res.push(acts[i]);
      if (acts[i].id == contractActivityID.value) curFound = true;
    }
  }
  if (!curFound) contractActivityID.value = undefined;
  contractActivities.value = res;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const irrigate = (s: Subscription): void => {
  if (selectedProtocol.value != undefined) {
    s.protocol = selectedProtocol.value;
  }
  if (selectedContract.value) {
    s.set("contract", selectedContract.value);
    s.set("contractAddress", selectedContract.value.address);
    s.set("contractChain", selectedContract.value.get("chain"));
  }
  if (selectedContractActivity.value) {
    s.set("contractActivity", selectedContractActivity.value);
  }
};

if (route.query.protocolID) {
  fetching.value = true;
  selectedProtocol.value = await Protocol.fetch(
    route.query.protocolID as string
  );
}

if (props.subscriptionID) {
  await fetchBySubscriptionID(props.subscriptionID);
}

// eslint-disable-next-line no-undef
defineExpose({ irrigate, message, validSubmit, canComplete });

if (props.subscriptionID) {
  await fetchBySubscriptionID(props.subscriptionID);
}

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
