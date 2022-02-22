<template>
  <div class="flex-container">
    <div class="row">
      <SubscribeType v-model="section" ref="typeSelector"></SubscribeType>
    </div>
    <div id="inset" class="flex xs12 ml-4">
      <SubscribeWallet v-if="showWallet" ref="wallet"></SubscribeWallet>
      <SubscribeContract
        v-if="showContract"
        ref="contract"
        @changed="irrigate"
      ></SubscribeContract>
      <SubscribeProtocol
        v-if="showProtocol"
        ref="protocol"
        @changed="irrigate"
      ></SubscribeProtocol>
      <SubscribePosition
        v-if="showPosition"
        :subscriptionID="subscriptionID"
        ref="position"
        @changed="irrigate"
      ></SubscribePosition>
      <div v-show="showCompletion" class="row pt-2">
        <va-divider inset />
        <va-input
          class="flex xs12 sm8 md6 lg4"
          label="Subscription Name"
          v-model="subName"
          :rules="[validName || 'Enter a valid name']"
        />
      </div>
      <div v-show="showDefinition" class="flex xs12 lg6 pt-4">
        <va-alert
          color="info"
          :border-color="validSubmit ? 'success' : 'danger'"
          border="top"
        >
          <template v-slot:icon>
            <va-icon
              :name="validSubmit ? 'info' : 'error'"
              :color="validSubmit ? 'primary' : 'danger'"
            ></va-icon>
          </template>
          <template v-slot:title>Subscription Definition:</template>
          <template v-slot:default><span v-html="message"></span></template>
        </va-alert>
      </div>
      <div v-show="showCompletion" class="row pt-2 pb-3 offset--md1">
        <div class="flex xs12 sm5 md5">
          <h3>Send these alerts to:</h3>
          <va-option-list
            type="switch"
            label="Select channels for alerts"
            v-model="newChannelIDs"
            :options="myChannels"
            valueBy="id"
            textBy="name"
            class="pb-3"
          />
        </div>
        <div class="flex xs12 sm7 md5 lg4 offset-lg-3">
          <va-button
            class="flex mr-2"
            :disabled="!validSubmit"
            @click.prevent="subscribe"
            color="primary"
            :icon-right="subscribeIcon"
            size="large"
            :loading="createBusy"
            >{{ subscribeLabel }}
          </va-button>
          <va-button
            class="flex"
            @click.prevent="cancel"
            color="danger"
            icon-right="close"
            size="large"
            >Cancel</va-button
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { UserChannel } from "@/models/Channel";
import { channelsModule } from "@/store/channels";
import { computed, getCurrentInstance, ref } from "vue";
import { onBeforeRouteUpdate, useRouter } from "vue-router";

import SubscribeType from "@/components/subscribe-type.vue";
import SubscribeWallet from "@/components/subscribe-wallet.vue";
import SubscribeContract from "@/components/subscribe-contract.vue";
import SubscribeProtocol from "@/components/subscribe-protocol.vue";
import SubscribePosition from "@/components/subscribe-position.vue";
import { Subscription } from "@/models/Subscription";
import Moralis from "moralis";
import {
  SubscriptionTypes,
  SubscriptionTypesName,
  SubscriptionTypesSymbol,
} from "@/notifi_types";

interface channelInfo {
  name: string;
  id: string;
  channel: UserChannel;
}

/* global defineProps, defineEmits */
const props = defineProps({
  typeName: { type: String, required: false, default: "new" },
  subscriptionID: { type: String, required: false },
  returnPath: { type: String, required: false, default: "/subscriptions" },
});

let sub: Subscription | undefined = undefined;
if (props.subscriptionID) sub = await Subscription.fetch(props.subscriptionID);
else sub = new Subscription();
const subscription = ref<Subscription>(sub);

const channels: string[] = [];
if (subscription.value) {
  const ucs = await subscription.value.channels();
  channels.push(...ucs.map((uc) => uc.id));
}

const newChannelIDs = ref<string[]>(channels);
const section = ref<SubscriptionTypesName | "new">(
  SubscriptionTypes[props.typeName as SubscriptionTypesSymbol] || "new"
);
//const subType = ref<SubscriptionTypesName | "type">(section.value);
const subName = ref<string>(subscription.value.name);

const typeSelector = ref(null);
//const wallet = ref<SubscribeWallet>(null);
const wallet = ref(null);
const protocol = ref<SubscribeProtocol>(null);
//const contract = ref<SubscribeContract>(null);
const contract = ref(null);
const position = ref<SubscribePosition>(null);

const showDefinition = computed((): boolean => {
  return (
    section.value != "new" && section.value != undefined && showCompletion.value
  );
});

const showCompletion = computed((): boolean => {
  return (
    section.value != "new" &&
    section.value != undefined &&
    canComplete.value == true
  );
});

const subscribeLabel = computed(() => {
  return subscription.value ? "Save" : "Create";
});

const subscribeIcon = computed(() => {
  return subscription.value ? "save" : "create";
});


const showContract = computed(() => {
  return showSection(SubscriptionTypes.contract);
});

const showProtocol = computed(() => {
  return showSection(SubscriptionTypes.protocol);
});

const showWallet = computed(() => {
  return showSection(SubscriptionTypes.wallet);
});
const showPosition = computed(() => {
  return showSection(SubscriptionTypes.position);
});

const showSection = (aSection: SubscriptionTypesName | "new") => {
  return section.value == aSection;
};

const activeSection = computed((): any => {
  if (section.value == SubscriptionTypes.protocol) return protocol.value;
  else if (section.value == SubscriptionTypes.contract) return contract.value;
  else if (section.value == SubscriptionTypes.wallet) return wallet.value;
  else if (section.value == SubscriptionTypes.position) return position.value;
  return undefined;
});

const myChannels = computed((): channelInfo[] => {
  return channelsModule.myChannels.map((v) => {
    const p = v.providerName;
    return {
      name: `${v.attributes.name} - (${p})`,
      channel: v,
      id: v.id,
    };
  });
});

const newChannels = computed((): UserChannel[] => {
  const res: UserChannel[] = newChannelIDs.value.map((id): UserChannel => {
    const rec = myChannels.value.find((e) => e.id === id);
    if (rec) {
      return rec.channel;
    }
    throw "Missing ID to Channel Group Mapping";
  });
  return res;
});

const validName = computed((): boolean => {
  return subName.value != undefined && subName.value.length > 3;
});

// Returns false if there is no way to get to success based on current Selections
const canComplete = computed((): boolean => {
  if (
    activeSection.value &&
    !(typeof activeSection.value.canComplete == "undefined")
  ) {
    return activeSection.value.canComplete;
  }
  return true;
});

const validSubmit = computed((): boolean => {
  return (
    activeSection.value != undefined &&
    activeSection.value.validSubmit &&
    validName.value &&
    newChannels.value.length > 0
  );
});

const createSubscription = (): Subscription => {
  subscription.value = new Subscription();
  return subscription.value;
};

const irrigate = (): void => {
  let sub = subscription.value;
  if (sub == undefined) {
    sub = createSubscription();
  }
  if (activeSection.value) {
    activeSection.value.irrigate(sub);
  }
  irrigateMe(sub);
};

const irrigateMe = (s: Subscription) => {
  if (subName.value != undefined) s.name = subName.value;
  if (section.value != undefined)
    s.subscriptionType = section.value as SubscriptionTypesName;
  s.user = Moralis.User.current();
  const r = s.relation("UserChannel");
  r.add(newChannels.value);
};

const message = computed((): string => {
  let msg = "Send alerts for";
  if (activeSection.value) {
    const sectionMsg = activeSection.value.message;
    msg = `${msg} ${sectionMsg}`;
  }
  msg = `${msg}<br/>Name this subscription <strong>${
    subName.value || "[Enter a Name]"
  }</strong>`;

  return msg;
});

onBeforeRouteUpdate(async (to, from) => {
  if (to.params.section) {
    section.value = to.params.section as SubscriptionTypesName;
  }
});

const app = getCurrentInstance();
const vaToast = app?.appContext.config.globalProperties.$vaToast;
const showToast = vaToast.init;

const router = useRouter();
const cancel = async (): Promise<void> => {
  router.push(props.returnPath);
};
const createBusy = ref(false);
const subscribe = async (): Promise<void> => {
  createBusy.value = true;
  irrigate();
  if (subscription.value) await subscription.value.save();
  //else showToast({ message: "Error No Subscription" });
  //showToast({ message: "Added Subscription", color: "success" });
  createBusy.value = false;
  router.push(props.returnPath);
};
</script>

<style scoped></style>
