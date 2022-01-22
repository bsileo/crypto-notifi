<template>
  <va-card class="subscription" color="secondary" gradient>
    <va-card-title>
      <div class="flex md8">{{ name }}</div>
      <div class="flex md4">
        <va-button
          @click.prevent="this.destroy()"
          icon-right="delete"
          size="small"
          class="mr-1"
          color="danger"
        ></va-button>
        <va-button
          @click.prevent="this.edit()"
          icon-right="edit"
          size="small"
          color="success"
          :disabled="true"
        ></va-button>
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
    <div class="row ml-2">
      <div class="flex sm3"><strong>Channels:</strong></div>
      <div class="flex sm9">{{ channelsDescription }}</div>
    </div>
    <div class="description row pb-1 mr-2 ml-2">
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
  },
  methods: {
    async destroy(): Promise<void> {
      this.currentSubscription.destroy();
    },
    async edit(): Promise<void> {
      console.log("EDIT");
    },
    async fetchChannelsDescription() {
      this.channelsDescription = await this.currentSubscription.channelsDescription();
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