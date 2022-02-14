<template>
  <div class="flex-container">
    <div class="row">
      <subscribe-type @select="setType" ref="typeSelector"></subscribe-type>
    </div>
    <div id="inset" class="flex xs12 ml-4">
      <subscribe-wallet v-if="showWallet" ref="wallet"></subscribe-wallet>
      <subscribe-contract
        v-if="showContract"
        ref="contract"
        @changed="irrigate"
      ></subscribe-contract>
      <subscribe-protocol
        v-if="showProtocol"
        ref="protocol"
        @changed="irrigate"
      ></subscribe-protocol>
      <div v-show="showCompletion" class="row pt-2">
        <va-divider inset />
        <va-input
          class="flex xs12 sm8 md6 lg4"
          label="Subscription Name"
          v-model="subName"
          :rules="[this.validName || 'Enter a valid name']"
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
            icon-right="create"
            size="large"
            :loading="createBusy"
            >Create</va-button
          >
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

<script lang="ts">
import { UserChannel } from "@/models/Channel";
import { channelsModule } from "@/store/channels";
import { computed, defineComponent, getCurrentInstance, ref } from "vue";
import { onBeforeRouteUpdate, useRouter } from "vue-router";

import SubscribeType from "@/components/subscribe-type.vue";
import SubscribeWallet from "@/components/subscribe-wallet.vue";
import SubscribeContract from "@/components/subscribe-contract.vue";
import SubscribeProtocol from "@/components/subscribe-protocol.vue";
import { Subscription, SubscriptionTypes } from "@/models/Subscription";
import Moralis from "moralis";

interface channelInfo {
  name: string;
  id: string;
  channel: UserChannel;
}

interface Breadcrumb {
  label: string;
  to: string;
}

export default defineComponent({
  name: "Subscribe",
  props: {
    curSection: { type: String, required: false, default: "type" },
  },
  setup(props) {
    const newChannelIDs = ref<string[]>([]);
    const section = ref(props.curSection || "type");
    const subType = ref<SubscriptionTypes>();
    const subName = ref<string>();
    const subscription = ref<Subscription>();

    const typeSelector = ref(null);
    const wallet = ref(null);
    const protocol = ref(null);
    const contract = ref(null);

    const showDefinition = computed((): boolean => {
      return section.value != "type" && section.value != undefined;
    });

    const showCompletion = computed((): boolean => {
      return section.value != "type" && section.value != undefined;
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

    const showSection = (section: string) => {
      return subType.value == section;
    };

    const activeSection = computed((): any => {
      if (section.value == SubscriptionTypes.protocol) return protocol.value;
      else if (section.value == SubscriptionTypes.contract)
        return contract.value;
      else if (section.value == SubscriptionTypes.wallet) return wallet.value;
      return undefined;
    });

    const setType = (t: SubscriptionTypes): void => {
      subType.value = t;
      section.value = t;
    };
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
      if (subType.value != undefined) s.subscriptionType = subType.value;
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
      msg = `${msg}<br/>Name this subscription <strong>${subName.value || "[Enter a Name]"}</strong>`;

      return msg;
    });

    onBeforeRouteUpdate(async (to, from) => {
      if (to.params.section) {
        section.value = to.params.section as string;
      }
    });

    const app = getCurrentInstance();
    const vaToast = app?.appContext.config.globalProperties.$vaToast;
    const showToast = vaToast.init;

    const router = useRouter();
    const cancel = async (): Promise<void> => {
      router.push("/subscriptions");
    };
    const createBusy = ref(false);
    const subscribe = async (): Promise<void> => {
      createBusy.value = true;
      irrigate();
      if (subscription.value) await subscription.value.save();
      //else showToast({ message: "Error No Subscription" });
      //showToast({ message: "Added Subscription", color: "success" });
      createBusy.value = false;
      router.push("/subscriptions");
    };

    return {
      newChannelIDs,
      section,
      setType,
      subName,
      subType,
      validName,
      activeSection,
      message,
      showContract,
      showProtocol,
      showWallet,
      typeSelector,
      showCompletion,
      showDefinition,
      myChannels,
      newChannels,
      showToast,
      protocol,
      contract,
      wallet,
      validSubmit,
      subscription,
      createBusy,
      subscribe,
      cancel,
      irrigate,
    };
  },
  components: {
    SubscribeType,
    SubscribeWallet,
    SubscribeContract,
    SubscribeProtocol,
  },
});
</script>

<style scoped></style>
