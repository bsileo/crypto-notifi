<template>
  <div v-if="!showNoSubscriptions && !showNoChannels" class="row pb-1 pt-1">
    <va-input class="flex xs3" label="Search Names" v-model="search"></va-input>
    <div class="flex xs4">
      <ProtocolSelector
        :simpleList="true"
        :simpleMulti="true"
        @selection="setSearchProtocols"
      ></ProtocolSelector>
    </div>
    <div class="flex xs2">
      <GroupPicker :editOnly="true" v-model="searchGroup"></GroupPicker>
    </div>
    <div class="flex xs1 offset--xs2">
      <va-button icon="refresh" color="secondary" @click="refresh"></va-button>
      <va-popover message="Add a new Subscription">
        <va-button
          @click.prevent="addSubscription"
          icon-right="add"
          size="medium"
          class="ml-4"
          color="success"
          :disabled="!allowAdd"
        >
        </va-button>
      </va-popover>
    </div>
  </div>
  <div class="gutter--sm">
    <va-inner-loading :loading="loading" :size="60">
      <div class="row">
        <div
          class="flex xs12 sm6 md6 lg4 xl3 pb-3"
          v-for="subscription in subscriptions"
          v-bind:key="subscription.id"
        >
          <SubscriptionCard :subscription="subscription"></SubscriptionCard>
        </div>
      </div>
    </va-inner-loading>
    <div v-if="showNoChannels" class="pt-3">
      <div class="flex sm12" style="text-align: center">
        <h2>
          Welcome to Crypto Notifi. The first step is to setup one or more
          channels where you will recieve alerts.
        </h2>
        <h2 class="pt-3">
          You can access
          <va-button color="primary" @click.prevent="showChannels">
            My Channels
          </va-button>
          to configure channels to receive alerts and then return here to Subscribe!
        </h2>
      </div>
    </div>
    <div v-if="showNoSubscriptions" class="pt-3">
      <h2>
        Welcome to Crypto Notifi! You have not created any subscriptions yet,
        but once you do they will appear here for easy maintenance and review.
      </h2>
      <h2>
        To get started, click the Add Button to create your first subscription!
        <va-button
          @click.prevent="addSubscription"
          icon-right="add"
          size="large"
          color="success"
          :disabled="!allowAdd"
        >
        </va-button>
      </h2>
    </div>
  </div>
</template>

<script setup lang="ts">
import useDebouncedRef from "@/composables/useDebouncedRef";
import SubscriptionCard from "@/components/Subscription.vue";
import ProtocolSelector from "@/components/ProtocolSelector.vue";
import GroupPicker from "@/components/GroupPicker.vue";
import Moralis from "moralis";
import { computed, onMounted, ref } from "vue";
import { Subscription } from "@/models/Subscription";
import { Protocol } from "@/models/Protocol";
import { useSubscriptionsStore } from "@/store/pinia_subscriptions";
import { useUserChannelsStore } from "@/store/pinia_userChannel";
import { useRouter } from "vue-router";
import { Group } from "@/models/Group";
import { storeToRefs } from "pinia";

const router = useRouter();

const search = useDebouncedRef("");
const searchProtocols = ref<Protocol[]>([]);
const searchGroup = ref<Group>();
const subscriptionStore = useSubscriptionsStore();
const {
  rawCount,
  subscriptions: rawSubscriptions,
  loading,
} = storeToRefs(subscriptionStore);

// eslint-disable-next-line no-undef
const emit = defineEmits(["showChannels"]);
// eslint-disable-next-line no-undef
const props = defineProps({ showAdd: Boolean });
const showGroups = ref(false);

const refresh = () => {
  subscriptionStore.fetchSubscriptions();
};

onMounted(() => {
  subscriptionStore.fetchSubscriptions();
});

const subscriptions = computed((): Subscription[] => {
  let subs = rawSubscriptions.value;
  if (search.value) {
    subs = subs.filter((s) => {
      return s.name.toLowerCase().includes(search.value.toLowerCase());
    });
  }
  if (searchProtocols.value.length > 0) {
    const prots = searchProtocols.value.map((e) => e.id);
    subs = subs.filter((s) => {
      const p = s.protocol;
      if (!p) {
        return false;
      }
      return prots.includes(p.id);
    });
  }
  if (searchGroup.value) {
    subs = subs.filter((s) => {
      const gr = s.get("Group");
      return gr && gr.id == searchGroup.value?.id;
    });
  }
  return subs;
});
const showNoChannels = computed((): boolean => {
  const userChannelsStore = useUserChannelsStore();
  return !loading.value && userChannelsStore.userChannels.length == 0;
});
const showNoSubscriptions = computed((): boolean => {
  return (
    !showNoChannels.value &&
    rawCount.value == 0 &&
    rawSubscriptions.value.length == 0 &&
    !loading.value
  );
});

const addSubscription = (): void => {
  router.push({ name: "SubscriptionNew" });
};
const showChannels = (): void => {
  router.push({ name: "My Channels" });
};
const setSearchProtocols = (prots: Protocol[]): void => {
  searchProtocols.value = prots;
};

const allowAdd = computed((): boolean => {
  return true;
});
</script>

<style scoped>
.top-right {
  position: absolute;
  right: 0;
}
</style>
