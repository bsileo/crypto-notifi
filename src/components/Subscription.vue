<template>
  <va-card class="subscription" color="#76b4e3" gradient>
    <va-card-title>
      <div class="flex md8">{{ name }}</div>
      <div class="flex md4">
        <va-popover
          :message="pausePopoverText"
          placement="top"
          :hover-over-timeout="1"
        >
          <va-button
            @click.prevent="this.togglePause()"
            :icon-right="pauseToggleIcon"
            class="mr-1"
            size="small"
            :color="paused ? 'warning' : 'success' "
          ></va-button>
        </va-popover>
        <va-button
          @click.prevent="this.destroy()"
          icon-right="delete"
          size="small"
          class="mr-1"
          color="danger"
        ></va-button>
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
    </va-card-title>
    <div class="row ml-2">
      <div class="flex sm3"><strong>Protocol:</strong></div>
      <div class="flex sm9">{{ protocolName }}</div>
    </div>
    <div class="row ml-2">
      <div class="flex sm3"><strong>Type:</strong></div>
      <div class="flex sm9">{{ subscriptionType }}</div>
    </div>
    <div v-if="contractDescription" class="row ml-2">
      <div class="flex sm3"><strong>Contract:</strong></div>
      <div class="flex sm9">
        <a target="_frame" :href="contractURL">{{ contractDescription }}</a>
      </div>
    </div>
    <div v-if="contractActivity" class="row ml-2">
      <div class="flex sm3"><strong>Activity:</strong></div>
      <div class="flex sm9">{{ contractActivity }}</div>
    </div>
    <div v-if="generalTypeName" class="row ml-2">
      <div class="flex sm3"><strong>Category:</strong></div>
      <div class="flex sm9">{{ generalTypeName }}</div>
    </div>
    <div class="row ml-2">
      <div class="flex sm3"><strong>Channels:</strong></div>
      <div class="flex sm9">{{ channelsDescription }}</div>
    </div>
    <div v-if="false" class="description row pb-1 mr-2 ml-2">
      <span v-html="description"></span>
    </div>
  </va-card>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { Subscription } from "@/models/Subscription";

export default defineComponent({
  name: "SubscriptionCard",
  setup() {
    return {};
  },
  props: {
    subscription: { type: Subscription, required: false },
  },
  components: {},
  data() {
    return {
      currentSubscription: this.subscription || new Subscription(),
      channelsDescription: "",
    };
  },
  mounted() {
    this.fetchChannelsDescription();
  },
  watch: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    currentSubscription(newVal: Subscription, oldVal: Subscription) {
      console.log(`Watch currentSub ${newVal}`);
      this.fetchChannelsDescription();
    },
  },
  computed: {
    protocolName(): any {
      return this.currentSubscription.protocol;
    },
    contractDescription(): any {
      return this.currentSubscription.contract?.description;
    },
    contractActivity(): string {
      const act = this.currentSubscription.get("contractActivity");
      return act?.name || "";
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
    name: {
      get(): string {
        return this.currentSubscription.name;
      },
      set(val: string) {
        this.currentSubscription.name = val;
      },
    },
    subscriptionType(): string {
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
    paused(): boolean {
      return this.currentSubscription.status == "paused";
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
    async destroy(): Promise<void> {
      this.currentSubscription.destroy();
    },
    async edit(): Promise<void> {
      console.log("EDIT");
    },
    async fetchChannelsDescription() {
      this.channelsDescription =
        await this.currentSubscription.channelsDescription();
    },
    async togglePause(): Promise<void> {
      if (this.paused) {
        this.currentSubscription.set("status", "active");
      } else {
        this.currentSubscription.set("status", "paused");
      }
      this.currentSubscription.save();
    },
  },
});
</script>

<style lang="scss" scoped>
.subscription {
  height: 20em;
}
.description {
  padding-top: 1em;
  overflow-x: clip;
  overflow-y: clip;
  border-color: black;
  border-style: solid;
}
</style>
