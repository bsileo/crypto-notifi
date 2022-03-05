<template>
  <va-card class="subscription" color="#76b4e3" gradient>
    <va-card-title>
      <div class="flex xs9 md7">
        <div class="title"><InlineEdit v-model="name" title="Name: " /></div>
        <div v-if="showGroup" class="group">
          <GroupPicker v-model="group"></GroupPicker>
        </div>
      </div>
      <div class="flex xs3 md5">
        <div class="row">
          <div class="flex xs4">
            <va-popover
              :message="pausePopoverText"
              placement="top"
              :hover-over-timeout="1"
            >
              <va-inner-loading :loading="pausing" :size="18">
                <va-button
                  @click.prevent="this.togglePause()"
                  :icon-right="pauseToggleIcon"
                  size="small"
                  :color="paused ? 'warning' : 'success'"
                ></va-button>
              </va-inner-loading>
            </va-popover>
          </div>
          <div class="flex xs4">
            <va-inner-loading :loading="destroying" :size="18">
              <va-button
                @click.prevent="this.destroy()"
                icon-right="delete"
                size="small"
                class="mr-1"
                color="danger"
              ></va-button>
            </va-inner-loading>
          </div>
          <div v-if="!allowEdit" class="flex xs4">
            <va-popover
              message="Coming Soon"
              placement="top"
              :hover-over-timeout="1"
            >
              <va-button
                @click.prevent="this.edit()"
                icon-right="edit"
                size="small"
                color="primary"
                :disabled="true"
              ></va-button>
            </va-popover>
          </div>
          <div v-if="allowEdit" class="flex xs4">
            <va-button
              @click.prevent="this.edit()"
              icon-right="edit"
              size="small"
              color="primary"
            ></va-button>
          </div>
        </div>
      </div>
    </va-card-title>
    <va-divider></va-divider>
    <div class="row ml-2 pb-1">
      <div class="flex xs3"><strong>Type:</strong></div>
      <div class="flex xs6">{{ subscriptionType }}</div>
      <va-icon class="flex xs2" :name="typeIcon"></va-icon>
    </div>
    <div v-if="subscriptionType == 'My Wallet'">
      <div v-if="fromAddress" class="row ml-2 pb-1">
        <div class="flex xs3"><strong>From:</strong></div>
        <div class="flex xs9">
          <va-popover :message="fromAddress">
            {{ fromAddressShort }}
          </va-popover>
        </div>
      </div>
      <div v-if="toAddress" class="row ml-2 pb-1">
        <div class="flex xs3"><strong>To:</strong></div>
        <div class="flex xs9">
          <va-popover :message="toAddress">
            {{ toAddressShort }}
          </va-popover>
        </div>
      </div>
    </div>
    <div v-if="subscriptionType == 'Position'" class="row ml-2 pb-1">
      <div class="flex xs3"><strong>Contract:</strong></div>
      <div class="flex xs9">
        <a :href="internalContractURL" target="_blank">{{
          internalContractShortAddress
        }}</a>
      </div>
    </div>
    <div v-if="valueDescription" class="row ml-2 pb-1">
      <div class="flex xs3"><strong>Value is:</strong></div>
      <div class="flex xs9">
        {{ valueDescription }}
      </div>
    </div>
    <div v-if="showProtocol" class="row ml-2 pb-1">
      <div class="flex xs3"><strong>Protocol:</strong></div>
      <div class="flex xs9">
        <a :href="protocolWebsite" target="_blank">
          {{ protocolName }}
        </a>
      </div>
    </div>
    <div v-if="contractDescription" class="row ml-2 pb-1">
      <div class="flex xs3"><strong>Contract:</strong></div>
      <div class="flex xs9">
        <a :href="contractURL" target="_blank">{{ contractDescription }}</a>
      </div>
    </div>
    <div v-if="contractActivity" class="row ml-2 pb-1">
      <div class="flex xs3">
        <strong>{{ activityName }}:</strong>
      </div>
      <div class="flex xs9">{{ contractActivity }}</div>
    </div>
    <div v-if="generalTypeName" class="row ml-2 pb-1">
      <div class="flex xs3"><strong>Category:</strong></div>
      <div class="flex xs9">{{ generalTypeName }}</div>
    </div>
    <va-divider dashed inset></va-divider>
    <div class="row ml-2 pb-1">
      <div v-if="availableChannels.length > 0" class="flex xs2">
        <va-button-dropdown
          right-icon
          icon="add"
          class="mr-2 mb-2"
          color="secondary"
          size="small"
        >
          <div
            v-for="channel in availableChannels"
            :key="channel.id"
            class="flex pb-1"
          >
            <va-chip
              style="font-size: x-small"
              size="small"
              color="secondary"
              :icon="channel.providerIcon"
              @click="addChannel(channel)"
            >
              {{ channel.name }}
            </va-chip>
          </div>
        </va-button-dropdown>
      </div>
      <div class="flex xs4"><strong>Channels:</strong></div>
    </div>
    <div class="layout gutter--sm">
      <div class="row ml-2">
        <div v-for="channel in channels" :key="channel.id" class="flex xs6">
          <va-chip
            class="channelChip"
            :icon="channel.providerIcon"
            size="small"
            closeable
            @update:modelValue="removeChannel(channel)"
            ><span class="channelChipName">{{ channel.name }}</span>
          </va-chip>
        </div>
      </div>
    </div>
  </va-card>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watchEffect } from "vue";
import { Subscription } from "@/models/Subscription";
import { UserChannel } from "@/models/Channel";
import { channelsModule } from "@/store/channels";
import {
  SubscriptionTypes,
  SubscriptionTypesName,
  ValueOperatorNames,
} from "@/notifi_types";
import { prettyNumber } from "@/Utilities";
import GroupPicker from "@/components/GroupPicker.vue";
import InlineEdit from "@/components/InlineEdit.vue";
import { Group } from "@/models/Group";

export default defineComponent({
  name: "SubscriptionCard",
  props: {
    subscription: { type: Subscription, required: false },
    showGroup: { type: Boolean, required: false, default: true },
  },
  setup(props) {
    const paused = computed(() => {
      return props.subscription?.status == "paused";
    });
    const channels = ref([] as UserChannel[]);

    const activeSubscription = ref<Subscription>(new Subscription());

    const availableChannels = computed(() => {
      const myChannels = channelsModule.myChannels;
      const chans: UserChannel[] = [];
      for (let i = 0; i < myChannels.length; i++) {
        let cand = myChannels[i];
        let existing = channels.value.find((elem) => {
          return elem.id == cand.id;
        });
        if (!existing) {
          chans.push(cand);
        }
      }
      return chans;
    });

    watchEffect(async () => {
      if (props.subscription) {
        activeSubscription.value = props.subscription;
        channels.value = await props.subscription.channels();
      }
    });

    return { paused, channels, activeSubscription, availableChannels };
  },
  components: { GroupPicker, InlineEdit },
  data() {
    return {
      currentSubscription: this.subscription || new Subscription(),
      channelsDescription: "",
      pausing: false,
      destroying: false,
    };
  },
  computed: {
    protocolName(): string {
      const p = this.currentSubscription.protocol;
      return p?.name;
    },
    protocolWebsite(): string {
      const p = this.currentSubscription.protocol;
      if (p) {
        return p.website;
      }
      return "";
    },
    typeIcon(): string {
      const t = this.currentSubscription.subscriptionType;
      if (t == SubscriptionTypes.wallet) {
        return "account_balance_wallet";
      } else if (t == SubscriptionTypes.protocol) {
        return "announcement";
      } else if (t == SubscriptionTypes.contract) {
        return "gavel";
      } else if (t == SubscriptionTypes.position) {
        return "radar";
      }
      return "";
    },
    showProtocol(): boolean {
      const subType = this.subscriptionType as unknown;
      return subType == "Protocol Alerts" || subType == "Smart Contracts";
    },
    contractDescription(): string {
      const c = this.currentSubscription.contract;
      return c?.description || "";
    },
    contractActivity(): string {
      const act = this.currentSubscription.contractActivity;
      return act?.name || "";
    },
    activityName(): string {
      const act = this.currentSubscription.contractActivity;
      return act?.type == "Event" ? "Event" : "Activity" || "Activity";
    },
    allowEdit(): boolean {
      return this.subscriptionType == "Position";
    },
    generalTypeName(): string {
      return this.currentSubscription.generalTypeName();
    },
    contractURL(): string {
      if (this.currentSubscription.contract) {
        return this.currentSubscription.contract.contractURL;
      } else {
        return "";
      }
    },
    internalContractShortAddress(): string {
      if (this.currentSubscription) {
        return this.currentSubscription.internalShortContractAddress();
      } else {
        return "";
      }
    },
    internalContractURL(): string {
      if (this.currentSubscription) {
        return this.currentSubscription.internalContractURL();
      } else {
        return "";
      }
    },
    fromAddress(): string {
      if (this.currentSubscription) {
        const addr = this.currentSubscription.fromAddress;
        return addr;
      } else {
        return "";
      }
    },
    toAddress(): string {
      if (this.currentSubscription) {
        const addr = this.currentSubscription.toAddress;
        return addr;
      } else {
        return "";
      }
    },
    fromAddressShort(): string {
      if (this.currentSubscription) {
        const addr = this.currentSubscription.fromAddress;
        return this.shortAddress(addr);
      } else {
        return "";
      }
    },
    toAddressShort(): string {
      if (this.currentSubscription) {
        const addr = this.currentSubscription.toAddress;
        return this.shortAddress(addr);
      } else {
        return "";
      }
    },
    valueDescription(): string {
      const sub = this.currentSubscription;
      if (!sub) return "";
      const t = sub.subscriptionType;
      if (t == SubscriptionTypes.position) {
        return sub.positionDescription();
      }
      if (t == SubscriptionTypes.wallet) {
        if (sub.valueOperator && sub.value) {
          const val = prettyNumber(sub.value);
          const op = ValueOperatorNames[sub.valueOperator];
          return `${op} ${val}`;
        }
      }
      return "";
    },
    name: {
      get(): string {
        return this.currentSubscription.name;
      },
      set(val: string) {
        this.currentSubscription.name = val;
        this.currentSubscription.save();
      },
    },
    group: {
      get(): Group {
        return this.currentSubscription.group;
      },
      set(val: Group) {
        this.currentSubscription.group = val;
        this.currentSubscription.save();
      },
    },
    subscriptionType(): SubscriptionTypesName {
      return this.currentSubscription.subscriptionType;
    },
    description: {
      get(): string {
        return this.currentSubscription.description;
      },
      set(val: string) {
        this.currentSubscription.description = val;
      },
    },
    pauseToggleIcon(): string {
      if (this.paused) return "pause";
      else return "play_arrow";
    },
    pausePopoverText(): string {
      if (this.paused) return "Paused : Click to Resume";
      else return "Active : Click to Pause";
    },
  },
  methods: {
    removeChannel(chan: UserChannel) {
      if (this.channels.length < 2) {
        alert("You can't remove the last channel on a subscription");
      } else {
        let text = `Are you sure you want to remove '${chan.name} from this subscription?`;
        if (confirm(text) == true) {
          chan.removeSubscription(this.activeSubscription as Subscription);
        }
      }
    },
    addChannel(chan: UserChannel) {
      chan.addSubscription(this.activeSubscription as Subscription);
    },
    shortAddress(addr: string) {
      if (!addr || addr.length < 6) return "";
      return addr.slice(1, 6) + "..." + addr.substring(addr.length - 4);
    },
    async destroy(): Promise<void> {
      this.destroying = true;
      this.currentSubscription.destroy();
    },
    async edit(): Promise<void> {
      const path = this.$route.fullPath;
      if (this.subscriptionType == "Position") {
        this.$router.push({
          path: `/subscription/position/${this.subscription?.id}`,
          query: { returnPath: path },
        });
      }
    },
    async togglePause(): Promise<void> {
      this.pausing = true;
      if (this.paused) {
        this.currentSubscription.set("status", "active");
      } else {
        this.currentSubscription.set("status", "paused");
      }
      await this.currentSubscription.save();
      this.pausing = false;
    },
  },
});
</script>

<style lang="scss" scoped>
.title {
  font-size: larger;
}
.subscription {
  height: 20em;
}

.channelChip {
  font-size: x-small;
  max-width: 90%;
}

.channelChipName {
  font-size: x-small;
  overflow-x: clip;
  white-space: nowrap;
  max-width: 90%;
}
</style>
