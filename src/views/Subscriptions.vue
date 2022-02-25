<template>
  <div v-if="!showNoSubscriptions" class="row pb-1 pt-1">
    <va-input class="flex xs5" label="Search Names" v-model="search"></va-input>
    <div class="flex xs5">
      <ProtocolSelector
        :simpleList="true"
        :simpleMulti="true"
        @selection="setSearchProtocols"
      ></ProtocolSelector>
    </div>
    <div class="flex xs2">
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
    <va-inner-loading :loading="subscriptionsLoading" :size="60">
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
          under the My Account menu above.
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
import Moralis from "moralis";
import { computed, onMounted, ref } from "vue";
import { Subscription } from "@/models/Subscription";
import { Protocol } from "@/models/Protocol";
import { userModule } from "@/store/user";
import { channelsModule } from "@/store/channels";
import { useRouter } from "vue-router";
const router = useRouter();

const rawCount = ref(0);
const rawSubscriptions = ref<Subscription[]>([]);
const subscriptionsLoading = ref(false);
const search = useDebouncedRef("");
const queryLimit = ref(25);
const searchProtocols = ref<Protocol[]>([]);

// eslint-disable-next-line no-undef
const emit = defineEmits(["showChannels"]);
// eslint-disable-next-line no-undef
const props = defineProps({ showAdd: Boolean });

// Using local search
/* watch(search, (newSearch: string) => {
  console.log(`Search=${newSearch}`);
  rawSubscriptions.value.length = 0;
  fetchSubscriptions();
});*/

const refresh = () => {
  rawSubscriptions.value.length = 0;
  fetchSubscriptions();
};

const appendSubscriptions = (): Promise<void> => {
  return fetchSubscriptions();
};
const fetchSubscriptions = async (): Promise<void> => {
  if (!userModule.user) return;
  subscriptionsLoading.value = true;
  const query = new Moralis.Query(Subscription);
  query.equalTo("userID", userModule.user?.id);
  rawCount.value = await query.count();
  // Running local browser search for more flexibility right now e.g. case insensitve
  //if (search.value) {
  //  query.matches("name", search.value);
  //}
  query.limit(queryLimit.value);
  query.skip(rawSubscriptions.value.length);
  query.include("contractActivity");
  query.include("contract");
  query.include("GeneralSubType");
  let subs = await query.find();
  subscribe(query);
  rawSubscriptions.value.push(...subs);
  subscriptionsLoading.value = false;
};

onMounted(() => {
  fetchSubscriptions();
});

const subscribe = async (query: any) => {
  const subscription = await query.subscribe();
  subscription.on("create", (sub: Subscription) => {
    rawSubscriptions.value.push(sub);
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  subscription.on("update", (sub: Subscription) => {
    const index = rawSubscriptions.value.findIndex((e) => e.id == sub.id);
    if (index > -1) {
      rawSubscriptions.value.splice(index, 1, sub);
    }
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  subscription.on("enter", (sub: Subscription) => {
    // console.log("object entered");
    rawSubscriptions.value.push(sub);
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  subscription.on("leave", (sub: Subscription) => {
    const index = rawSubscriptions.value.findIndex((e) => e.id == sub.id);
    if (index > -1) {
      rawSubscriptions.value.splice(index, 1);
    }
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  subscription.on("delete", (sub: Subscription) => {
    const index = rawSubscriptions.value.findIndex((e) => e.id == sub.id);
    if (index > -1) {
      rawSubscriptions.value.splice(index, 1);
    }
  });
  subscription.on("close", () => {
    console.log("Subscriptions subscription closed");
  });
};

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
  return subs;
});
const showNoChannels = computed((): boolean => {
  return !subscriptionsLoading.value && channelsModule.MYCHANNELS.length == 0;
});
const showNoSubscriptions = computed((): boolean => {
  return (
    !showNoChannels.value &&
    rawCount.value == 0 &&
    rawSubscriptions.value.length == 0 &&
    !subscriptionsLoading.value
  );
});

const addSubscription = (): void => {
  router.push({ name: "SubscriptionNew",  });
};
const showChannels = (): void => {
  emit("showChannels");
};
const setSearchProtocols = (prots: Protocol[]): void => {
  searchProtocols.value = prots;
};

const allowAdd = computed((): boolean => {
  return channelsModule.myChannels.length > 0;
});
</script>

<style scoped>
.top-right {
  position: absolute;
  right: 0;
}
</style>
