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
  <div v-if="selectedProtocol">
    <div v-if="protocolNoTypes" class="flex row pt-2">
      <div class="flex xs12 sm8 md6">
        <va-card :bordered="false">
          <va-card-title>Vote for this Protocol!</va-card-title>
          <va-card-content>
            This protocol has not joined up with Notifi yet. Click to Vote and
            help encourage them to share News and Information here!
          </va-card-content>
          <va-card-actions>
            <va-popover
              color="primary"
              message="Request support for this Protocol on Notifi"
            >
              <va-button size="large" @click="voteFor(protocol)"
                >Vote</va-button
              >
            </va-popover>
          </va-card-actions>
        </va-card>
      </div>
    </div>
    <div v-else class="flex row pt-2">
      <va-select
        class="flex xs12 sm8 md6 lg3"
        label="Subscription Category"
        v-model="selectedSubGeneralType"
        :options="subGeneralTypes"
        track-by="id"
        text-by="name"
        :rules="[
          (selectedSubGeneralType) =>
            selectedSubGeneralType != null || 'Select an alert category',
        ]"
      />
      <div class="row pt-2">
        <div class="flex xs12 sm8 md6">
          <va-card :bordered="false">
            <va-card-title>About these Alerts:</va-card-title>
            <va-card-content>
              <span v-html="this.selectedSubGeneralTypeDescription"></span>
            </va-card-content>
          </va-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ProtocolSelector from "./ProtocolSelector.vue";
import ProtocolInfo from "./ProtocolInfo.vue";
import { Subscription } from "@/models/Subscription";
import {
  SubscriptionType,
  SubscriptionTypeStatus,
} from "@/models/SubscriptionType";
import { Protocol } from "@/models/Protocol";
import { inject, computed, ref, watch } from "vue";
import Moralis from "moralis";
import { NotifiUser } from "@/models/NotifiUser";
import { useRoute } from "vue-router";

// eslint-disable-next-line no-undef
const props = defineProps({
  subscription: { type: Subscription, required: false },
  protocol: { type: Protocol, required: false },
  subscriptionID: { type: String, required: false },
});
// eslint-disable-next-line no-undef
const emit = defineEmits(["changed"]);
const route = useRoute();

const fetchBySubscriptionID = async (subID: string): Promise<Subscription> => {
  fetching.value = true;
  const sub = await Subscription.fetch(subID);
  if (sub) {
    activeSubscription.value = sub;
    const prot: Protocol = sub.protocol;
    await prot.fetch();
    intSelectedProtocol.value = prot;
    console.log(sub.generalType);
    intSubGeneralType.value = sub.generalType;
    fetching.value = false;
    return sub;
  }
  throw "Invalid Subscription ID";
};

const intSelectedProtocol = ref<Protocol | undefined>(props.protocol);
const subGeneralTypes = ref<SubscriptionType[]>([]);
const fetching = ref(false);
const intSubGeneralType = ref<SubscriptionType | undefined>();
const activeSubscription = ref<Subscription>();

const selectedSubGeneralType = computed({
  get(): SubscriptionType | undefined {
    return intSubGeneralType.value;
  },
  set(val: SubscriptionType | undefined): void {
    if (val) {
      const t = subGeneralTypes.value.find((e) => e.id == val.id);
      intSubGeneralType.value = t;
    } else {
      intSubGeneralType.value = val;
    }
    emit("changed");
  },
});

const selectedProtocol = computed({
  get(): Protocol | undefined {
    return intSelectedProtocol.value;
  },
  set(val: Protocol | undefined): void {
    intSelectedProtocol.value = val;
    emit("changed");
  },
});
const selectedSubGeneralTypeName = computed((): string | undefined => {
  const t = selectedSubGeneralType.value;
  return t?.name;
});

const protocolNoTypes = computed(() => {
  return fetching.value == false && subGeneralTypes.value.length == 0;
});

const selectedSubGeneralTypeDescription = computed((): string | undefined => {
  if (protocolNoTypes.value) {
    return "";
  }
  const t = selectedSubGeneralType.value;
  return t?.description;
});

const fetchSubGeneralTypes = async (): Promise<void> => {
  fetching.value = true;
  const q = new Moralis.Query(SubscriptionType);
  q.equalTo("protocol", selectedProtocol.value);
  q.equalTo("status", SubscriptionTypeStatus.active);
  const res = await q.find();
  //selectedSubGeneralType.value = undefined;
  subGeneralTypes.value.length = 0;
  subGeneralTypes.value.push(...res);
  fetching.value = false;
};

const irrigate = (s: Subscription): void => {
  if (selectedSubGeneralType.value != undefined)
    s.category = selectedSubGeneralType.value;
  if (selectedProtocol.value != undefined) s.protocol = selectedProtocol.value;
};

const message = computed((): string => {
  const info = selectedSubGeneralTypeName.value || "[Select a Type above]";
  return `the <strong>${selectedProtocolName.value}</strong> Protocol about <strong>${info}</strong>`;
});

const validSubmit = computed((): boolean => {
  return (
    selectedProtocolName.value != "" &&
    selectedSubGeneralType.value != undefined
  );
});

const canComplete = computed((): boolean => {
  return protocolNoTypes.value != true;
});

// eslint-disable-next-line no-undef
defineExpose({ irrigate, message, validSubmit, canComplete });

const selectedProtocolName = computed((): string => {
  const p = intSelectedProtocol.value;
  if (!p) {
    return "";
  } else {
    return p.name;
  }
});

const clearProtocol = () => {
  selectedProtocol.value = undefined;
};
const selectProtocol = (prot: Protocol) => {
  selectedProtocol.value = prot;
};
const voteFor = async (): Promise<void> => {
  if (!selectedProtocol.value) return undefined;
  const newVotes = await selectedProtocol.value.siteVote();
  //this.$forceUpdate();
};

watch(selectedProtocol, async (newProt, oldProt) => {
  fetchSubGeneralTypes();
});

if (route.query.protocolID) {
  fetching.value = true;
  selectedProtocol.value = await Protocol.fetch(
    route.query.protocolID as string
  );
}
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
