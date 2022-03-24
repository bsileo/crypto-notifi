<template>
  <div class="gutter--sm">
    <div v-if="!showNoPositions" class="row pb-1 pt-1">
      <va-input class="flex xs7" label="Search Names" v-model="search">
      </va-input>
      <div class="flex xs2">
        <va-checkbox v-model="favorites" label="Favorites?" :disabled="true" />
      </div>
      <div class="flex xs1 float-right">
        <va-button
          icon="refresh"
          color="secondary"
          @click="refresh"
        ></va-button>
      </div>
    </div>
    <va-inner-loading :loading="protocolsLoading" :size="60">
      <div class="row">
        <ProtocolInfo
          v-for="protocol in protocols"
          v-bind:key="protocol.id"
          :allowSelect="false"
          :protocol="protocol"
          displayMode="wide"
          :showPositions="true"
        >
        </ProtocolInfo>
      </div>
    </va-inner-loading>
    <div v-if="showNoPositions" class="pt-3">
      <h2>
        Welcome to Crypto Notifi! You have not created any Favorites yet. Go to
        the <va-chip to="/protocols">Protocols Section</va-chip> and select
        those you have positions in to get started.
      </h2>
    </div>
  </div>
</template>

<script setup lang="ts">
import Moralis from "moralis";
import { computed, ref, onMounted } from "vue";
import ProtocolInfo from "@/components/ProtocolInfo.vue";
import { Protocol } from "@/models/Protocol";
import { useUserStore } from "@/store/pinia_user";

/* global defineProps, defineEmits */
const props = defineProps({
  showAdd: { type: Boolean, required: false, default: false },
});

const userStore = useUserStore();

const rawProtocols = ref<Protocol[]>([]);
const intSearch = ref("");
const favorites = ref(true);
const queryLimit = ref(25);
const protocolsLoading = ref(false);
const rawCount = ref(0);

const showNoPositions = computed(() => {
  return rawCount.value == 0 && !protocolsLoading.value;
});

onMounted(async () => {
  fetchProtocols();
});

const protocols = computed((): Protocol[] => {
  let prots = rawProtocols.value;
  return prots;
});

const search = computed({
  get(): string {
    return intSearch.value;
  },
  set(newVal: string) {
    intSearch.value = newVal;
    rawProtocols.value.length = 0;
    fetchProtocols();
  },
});

const edit = (id: string): void => {
  console.log(`Edit ${id}`);
};

const remove = (id: string): void => {
  console.log(`remove ${id}`);
  const query = new Moralis.Query("Subscription");
  query.get(id).then((s: { destroy: () => Promise<unknown> }) => {
    s.destroy().then((oldS) => {
      console.log(`Success remove ${oldS}`);
    });
  });
};

const refresh = () => {
  rawProtocols.value.length = 0;
  fetchProtocols();
};

const appendProtocols = async (): Promise<void> => {
  fetchProtocols();
};

const fetchProtocols = async (): Promise<void> => {
  if (!userStore.user) return;
  protocolsLoading.value = true;
  const rel = userStore.user.relation("FavoriteProtocols");
  const query = rel.query();
  rawCount.value = await query.count();
  if (search.value) {
    query.matches("name", search.value);
  }
  query.limit(queryLimit.value);
  query.skip(rawProtocols.value.length);
  let subs = await query.find();
  subscribe(query);
  rawProtocols.value.push(...subs);
  protocolsLoading.value = false;
};

const subscribe = async (query: any) => {
  const subscription = await query.subscribe();
  subscription.on("create", (sub: Protocol) => {
    rawProtocols.value.push(sub);
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  subscription.on("update", (sub: Protocol) => {
    const index = rawProtocols.value.findIndex((e) => e.id == sub.id);
    if (index > -1) {
      rawProtocols.value.splice(index, 1, sub);
    }
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  subscription.on("enter", (sub: Protocol) => {
    console.log("Positions - Protocols object entered");
    rawProtocols.value.push(sub);
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  subscription.on("leave", (sub: Protocol) => {
    console.log("Positions - Protocols object left");
    const index = rawProtocols.value.findIndex((e) => e.id == sub.id);
    if (index > -1) {
      rawProtocols.value.splice(index, 1);
    }
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  subscription.on("delete", (sub: Protocol) => {
    const index = rawProtocols.value.findIndex((e) => e.id == sub.id);
    if (index > -1) {
      rawProtocols.value.splice(index, 1);
    }
  });
  subscription.on("close", () => {
    console.log("Protocols subscription closed");
  });
};
</script>

<style scoped>
.top-right {
  position: absolute;
  right: 0;
}
</style>
