<template>
  <div class="pl-4">
    <div v-if="simpleList">
      <va-select
        :options="protocols"
        label="Protocol"
        track-by="id"
        text-by="name"
        v-model="selectedProtocols"
        :multiple="simpleMulti"
        searchable
        clearable
        @update:modelValue="selectionChange"
        @update-search="setSearch"
      >
        <template #content="{ value }">
          <va-chip
            v-for="chip in value"
            :key="chip"
            size="small"
            class="mr-1 ml-1"
            closeable
            @update:modelValue="unselect(chip)"
          >
            {{ chip.name }}
          </va-chip>
        </template>
      </va-select>
    </div>
    <div v-else class="protocolCards" ref="cards">
      <div class="row pb-1">
        <va-input
          v-if="showSearch"
          class="flex xs6 sm9"
          label="Search Names"
          v-model="search"
        ></va-input>
        <va-checkbox
          v-if="showSearchFavorites"
          class="flex xs4 sm2"
          :class="showSearch ? '' : 'offset--xs9 offset--sm9'"
          label="Favorites?"
          v-model="searchFavorites"
        />
        <div
          class="flex xs2 sm1 float-right"
          :class="
            showSearchFavorites || showSearch ? '' : 'offset--xs9 offset--sm9'
          "
        >
          <va-button
            icon="refresh"
            color="secondary"
            @click="refresh"
          ></va-button>
        </div>
      </div>
      <va-infinite-scroll :load="appendProtocols">
        <va-inner-loading :loading="loading" :size="60">
          <div class="row pt-2 pb-4">
            <ProtocolInfo
              v-bind:key="protocol.id"
              v-for="protocol in protocols"
              :protocol="protocol"
              :selected="selectedProtocol == protocol"
              :showVote="showVote"
              :showUserInfo="showUserInfo"
              :showFavorites="showFavorites"
              :allowSelect="allowSelect"
              :showSubscribe="showSubscribe"
              displayMode="narrow"
              @selected="select"
              @subscribe="subscribe"
            >
            </ProtocolInfo>

            <va-card
              v-if="!loading && showAdder"
              href="#"
              class="flex mb-1 xs12 sm4 lg3 xl2"
              @click.prevent="$emit('add')"
            >
              <va-card-title>
                <va-chip>Recommend</va-chip>
              </va-card-title>
              <va-card-content style="text-align-center;">
                Submit a protocal
                <va-icon name="add" :size="80" color="primary"></va-icon>
              </va-card-content>
            </va-card>
          </div>
        </va-inner-loading>
      </va-infinite-scroll>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Protocol } from "@/models/Protocol";
import { NotifiUser } from "@/models/NotifiUser";
import { userModule } from "@/store/user";
import Moralis from "moralis";
import { computed, inject, onMounted, ref } from "vue";
import ProtocolInfo from "@/components/ProtocolInfo.vue";
import { SiteStatus } from "@/notifi_types";

/* global defineProps, defineEmits */
const emit = defineEmits(["selection", "subscribe", "add"]);
const props = defineProps({
  showSearch: { type: Boolean, required: false, default: true },
  showVote: { type: Boolean, required: false, default: false },
  showSubscribe: { type: Boolean, required: false, default: false },
  showFavorites: { type: Boolean, required: false, default: true },
  showSearchFavorites: { type: Boolean, required: false, default: true },
  showUserInfo: { type: Boolean, required: false, default: false },
  autoSelect: { type: Boolean, required: false, default: false },
  simpleList: { type: Boolean, required: false, default: false },
  simpleMulti: { type: Boolean, required: false, default: true },
  allowSelect: { type: Boolean, required: false, default: true },
  showRequested: { type: Boolean, required: false, default: false },
  showAdd: { type: Boolean, required: false, default: false },
  manager: { type: Boolean, required: false, default: false },
});

const user: NotifiUser | undefined = inject("NotifiUser");

const intSearch = ref("");
const intSearchFavorites = ref(false);
const selectedProtocol = ref<Protocol | undefined>(undefined);
const selectedProtocols = ref<Protocol[]>([]);
const query = ref<any>(undefined);
const rawProtocols = ref<Protocol[]>([]);
const filteredProtocols = ref<Protocol[]>([]);
const queryLimit = ref<number>(20);
const loading = ref(false);
const showAdder = ref(props.showAdd);

onMounted(async () => {
  if (props.showUserInfo) {
    userModule.fetchUserTokens();
  }
  fetchProtocols();
});

const protocols = computed((): Protocol[] => {
  let prots = filteredProtocols.value;
  if (search.value) {
    const result = prots.filter((e: Protocol) => {
      const idx = e.name.toLowerCase().indexOf(search.value.toLowerCase());
      return idx != -1;
    });
    prots = result;
  }
  return prots;
});

const search = computed({
  get(): string {
    return intSearch.value;
  },
  set(newVal: string) {
    intSearch.value = newVal;
    //this.rawProtocols.length = 0;
    //this.fetchProtocols();
  },
});

const searchFavorites = computed({
  get(): boolean {
    return intSearchFavorites.value;
  },
  set(newVal: boolean) {
    intSearchFavorites.value = newVal;
    fetchProtocols(true);
  },
});

const select = (aProtocol: Protocol): void => {
  selectedProtocol.value = aProtocol;
  emit("selection", selectedProtocol.value);
};
const subscribe = (aProtocol: Protocol): void => {
  emit("subscribe", aProtocol);
};
const selectionChange = () => {
  emit("selection", selectedProtocols.value);
};
const unselect = (prot: Protocol) => {
  selectedProtocols.value = selectedProtocols.value.filter((v) => {
    return v.id !== prot.id;
  });
  selectionChange();
};
const setSearch = (s: string) => {
  console.log("Set Search");
  search.value = s;
};
const appendProtocols = async (): Promise<void> => {
  //console.log("Append");
  fetchProtocols();
};
const fetchProtocols = async (refresh?: boolean): Promise<void> => {
  loading.value = true;
  if (searchFavorites.value) {
    const u = Moralis.User.current();
    const rel = u.relation("FavoriteProtocols");
    query.value = rel.query();
  } else {
    query.value = new Moralis.Query(Protocol);
  }
  if (!props.showRequested) {
    query.value.notEqualTo("siteStatus", SiteStatus.requested);
  }
  query.value.include("ProtocolStatus");
  query.value.limit(queryLimit.value);
  if (!refresh) {
    query.value.skip(rawProtocols.value.length);
  }
  querySubscribe(query.value);
  let prots = await query.value.find();
  if (refresh == true) {
    rawProtocols.value.length = 0;
  }
  rawProtocols.value.push(...prots);
  let res: Protocol[] = [];
  if (props.manager) {
    //if (user && (await user.isAdmin())) {
    // eslint-disable-next-line no-constant-condition
    if (false) {
      res.push(...prots);
    } else {
      for (let i = 0; i < prots.length; i++) {
        let man = await prots[i].managerOf();
        if (man) {
          res.push(prots[i]);
        }
      }
    }
  } else {
    res = rawProtocols.value;
  }

  if (props.autoSelect && res.length == 1) {
    select(res[0]);
  }
  let res2: Protocol[] = [];
  if (search.value) {
    const test = search.value.toLowerCase();
    for (let i = 0; i++; i < res.length) {
      if (res[i].name.search(test) != -1) {
        res2.push(res[i]);
      }
    }
  } else {
    res2 = res;
  }
  filteredProtocols.value = res2;
  loading.value = false;
};

const refresh = (): void => {
  fetchProtocols(true);
};

const querySubscribe = async (query: any) => {
  const protocol = await query.subscribe();
  const safeManagerPush = async (prot: Protocol) => {
    if (props.manager) {
      if (await prot.managerOf()) {
        rawProtocols.value.push(prot);
      }
    } else {
      rawProtocols.value.push(prot);
    }
  };
  protocol.on("create", async (prot: Protocol) => {
    safeManagerPush(prot);
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protocol.on("update", (sub: Protocol) => {
    const index = rawProtocols.value.findIndex((e) => e.id == sub.id);
    if (index > -1) {
      rawProtocols.value.splice(index, 1, sub);
    }
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protocol.on("enter", (prot: Protocol) => {
    safeManagerPush(prot);
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protocol.on("leave", (sub: Protocol) => {
    const index = rawProtocols.value.findIndex((e) => e.id == sub.id);
    if (index > -1) {
      rawProtocols.value.splice(index, 1);
    }
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protocol.on("delete", (sub: Protocol) => {
    const index = rawProtocols.value.findIndex((e) => e.id == sub.id);
    if (index > -1) {
      rawProtocols.value.splice(index, 1);
    }
  });
  protocol.on("close", () => {
    console.log("Protocols Subscription closed");
  });
};
</script>

<style scoped>
.protocolCards {
  overflow-y: auto;
  overflow-x: clip;
}
</style>
