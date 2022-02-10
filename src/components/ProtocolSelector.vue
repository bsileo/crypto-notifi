<template>
  <div class="container">
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
          class="flex sm11"
          label="Search Protocols"
          v-model="search"
        ></va-input>
        <div
          class="flex sm1 float-right"
          :class="showSearch ? '' : 'offset--sm11'"
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
              :selected="this.selectedProtocol == protocol"
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
          </div>
        </va-inner-loading>
      </va-infinite-scroll>
    </div>
  </div>
</template>

<script lang="ts">
import { Protocol } from "@/models/Protocol";
import { NotifiUser } from "@/models/NotifiUser";
import { userModule } from "@/store/user";
import Moralis from "moralis";
import { computed, defineComponent, inject, ref } from "vue";
import ProtocolInfo from "@/components/ProtocolInfo.vue";

export default defineComponent({
  name: "ProtocolSelector",
  components: { ProtocolInfo },
  emits: ["selection", "subscribe"],
  props: {
    showSearch: { type: Boolean, required: false, default: true },
    showVote: { type: Boolean, required: false, default: false },
    showSubscribe: { type: Boolean, required: false, default: false },
    showFavorites: { type: Boolean, required: false, default: true },
    showUserInfo: { type: Boolean, required: false, default: false },
    autoSelect: { type: Boolean, required: false, default: false },
    simpleList: { type: Boolean, required: false, default: false },
    simpleMulti: { type: Boolean, required: false, default: true },
    allowSelect: { type: Boolean, required: false, default: true },
    manager: { type: Boolean, required: false, default: false },
  },
  setup(props) {
    const user: NotifiUser | undefined = inject("user");
    const intSearch = ref("");
    const selectedProtocol = ref<Protocol | undefined>(undefined);
    const selectedProtocols = ref<Protocol[]>([]);
    const query = ref<any>(undefined);
    const rawProtocols = ref<Protocol[]>([]);
    const filteredProtocols = ref<Protocol[]>([]);
    const queryLimit = ref<number>(20);
    const loading = ref(false);
    const showFavs = computed((): boolean => {
      return props.showFavorites;
    });

    return {
      user,
      intSearch,
      selectedProtocol,
      selectedProtocols,
      query,
      rawProtocols,
      filteredProtocols,
      queryLimit,
      loading,
      showFavs,
    };
  },
  async mounted() {
    if (this.showUserInfo) {
      userModule.fetchUserTokens();
    }
    this.fetchProtocols();
  },
  computed: {
    protocols(): Protocol[] {
      let prots = this.filteredProtocols;
      if (this.search) {
        const result = prots.filter((e: Protocol) => {
          const idx = e.name.toLowerCase().indexOf(this.search.toLowerCase());
          return idx != -1;
        });
        return result;
      } else {
        return prots;
      }
    },
    search: {
      get(): string {
        return this.intSearch;
      },
      set(newVal: string) {
        this.intSearch = newVal;
        //this.rawProtocols.length = 0;
        //this.fetchProtocols();
      },
    },
  },
  methods: {
    select(aProtocol: Protocol): void {
      this.selectedProtocol = aProtocol;
      this.$emit("selection", this.selectedProtocol);
    },
    subscribe(aProtocol: Protocol): void {
      this.$emit("subscribe", aProtocol);
    },
    selectionChange() {
      this.$emit("selection", this.selectedProtocols);
    },
    unselect(prot: Protocol) {
      this.selectedProtocols = this.selectedProtocols.filter((v) => {
        return v.id !== prot.id;
      });
      this.selectionChange();
    },
    setSearch(search: string) {
      console.log("Set Search");
      this.search = search;
    },
    async appendProtocols(): Promise<void> {
      //console.log("Append");
      this.fetchProtocols();
    },
    async fetchProtocols(refresh?: boolean): Promise<void> {
      this.loading = true;
      const query = new Moralis.Query(Protocol);
      /*if (this.search) {
        query.matches("name", this.search);
        console.log(`Search term ${this.search}`);
      }*/
      query.include("ProtocolStatus");
      query.limit(this.queryLimit);
      if (!refresh) {
        query.skip(this.rawProtocols.length);
      }
      this.querySubscribe(query);
      let prots = await query.find();
      if (refresh == true) {
        this.rawProtocols = prots;
      } else {
        this.rawProtocols.push(...prots);
      }
      let res: Protocol[] = [];
      if (this.manager) {
        for (let i = 0; i < prots.length; i++) {
          let man = await prots[i].managerOf();
          if (man) {
            res.push(prots[i]);
          }
        }
      } else {
        res = this.rawProtocols;
      }
      if (this.autoSelect && res.length == 1) {
        this.select(res[0]);
      }
      let res2: Protocol[] = [];
      if (this.search) {
        const test = this.search.toLowerCase();
        for (let i=0; i++; i< res.length) {
          if (res[i].name.search(test) != -1) {
            res2.push(res[i]);
          }
        }
      } else {
        res2 = res;
      }
      this.filteredProtocols = res2;
      this.loading = false;
    },
    refresh(): void {
      this.fetchProtocols(true);
    },
    async querySubscribe(query: any) {
      const protocol = await query.subscribe();
      const safeManagerPush = async (prot: Protocol) => {
        if (this.manager) {
          if (await prot.managerOf()) {
            this.rawProtocols.push(prot);
          }
        } else {
          this.rawProtocols.push(prot);
        }
      };
      protocol.on("create", async (prot: Protocol) => {
        safeManagerPush(prot);
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      protocol.on("update", (sub: Protocol) => {
        const index = this.rawProtocols.findIndex((e) => e.id == sub.id);
        if (index > -1) {
          this.rawProtocols.splice(index, 1, sub);
        }
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      protocol.on("enter", (prot: Protocol) => {
        safeManagerPush(prot);
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      protocol.on("leave", (sub: Protocol) => {
        const index = this.rawProtocols.findIndex((e) => e.id == sub.id);
        if (index > -1) {
          this.rawProtocols.splice(index, 1);
        }
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      protocol.on("delete", (sub: Protocol) => {
        const index = this.rawProtocols.findIndex((e) => e.id == sub.id);
        if (index > -1) {
          this.rawProtocols.splice(index, 1);
        }
      });
      protocol.on("close", () => {
        console.log("Protocols Subscription closed");
      });
    },
  },
});
</script>

<style scoped>
.protocolCards {
  overflow-y: auto;
  overflow-x: clip;
}
</style>
