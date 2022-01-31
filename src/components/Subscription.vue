<template>
  <va-card class="subscription" color="#76b4e3" gradient>
    <va-card-title>
      <div class="flex md7">
        <div class="title">{{ name }}</div>
      </div>
      <div class="flex md5">
        <div class="row">
          <div class="flex sm4">
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
          <div class="flex sm4">
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
          <div class="flex sm4">
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
      <div v-if="valueDescription" class="row ml-2 pb-1">
        <div class="flex xs3"><strong>Value is:</strong></div>
        <div class="flex xs9">
          {{ valueDescription }}
        </div>
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
              :icon="channel.providerID == 'twilio' ? 'sms' : 'email'"
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
        <div v-for="channel in channels" :key="channel.id" class="flex">
          <va-chip
            style="font-size: x-small"
            :icon="channel.providerID == 'twilio' ? 'sms' : 'email'"
            size="small"
            closeable
            @update:modelValue="removeChannel(channel)"
            >{{ channel.name }}
          </va-chip>
        </div>
      </div>
    </div>
  </va-card>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watchEffect } from "vue";
import { Subscription } from "@/models/Subscription";
import { SubscriptionTypes } from "@/models/Subscription";
import { UserChannel } from "@/models/Channel";
import { channelsModule } from "@/store/channels";

export default defineComponent({
  name: "SubscriptionCard",
  props: {
    subscription: { type: Subscription, required: false },
  },
  setup(props) {
    const paused = computed(() => {
      return props.subscription?.status == "paused";
    });
    const channels = ref([] as UserChannel[]);

    const activeSubscription = ref(new Subscription());

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
  components: {},
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
      if (this.currentSubscription) {
        return `${this.currentSubscription.valueOperator} ${this.currentSubscription.value}`;
      } else {
        return "";
      }
    },
    name: {
      get(): string {
        return this.currentSubscription.name;
      },
      set(val: string) {
        this.currentSubscription.name = val;
      },
    },
    subscriptionType(): SubscriptionTypes {
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
          chan.removeSubscription(this.activeSubscription);
          console.log("CHAN=" + chan.name);
        }
      }
    },
    addChannel(chan: UserChannel) {
      chan.addSubscription(this.activeSubscription);
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
      console.log("EDIT");
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
</style>
