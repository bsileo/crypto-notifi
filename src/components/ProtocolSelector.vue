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
      <va-affix :offset-top="0" :offset-bottom="0" :target="() => $refs.cards">
        <div class="row pb-1">
          <va-input
            v-if="showSearch"
            class="flex sm11"
            label="Search Protocols"
            v-model="search"
          ></va-input>
          <div class="flex sm1 float-right">
          <va-button
            icon="refresh"
              color="secondary"
            @click="refresh"
          ></va-button>
          </div>
        </div>
      </va-affix>
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
              :allowSelect="allowSelect"
              :showSubscribe="showSubscribe"
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
import { defineComponent, inject } from "vue";
import ProtocolInfo from "@/components/ProtocolInfo.vue";

export default defineComponent({
  name: "ProtocolSelector",
  components: { ProtocolInfo },
  emits: ["selection", "subscribe"],
  props: {
    showSearch: { type: Boolean, required: false, default: true },
    showVote: { type: Boolean, required: false, default: false },
    showSubscribe: { type: Boolean, required: false, default: false },
    showUserInfo: { type: Boolean, required: false, default: false },
    simpleList: { type: Boolean, required: false, default: false },
    simpleMulti: { type: Boolean, required: false, default: true },
    allowSelect: { type: Boolean, required: false, default: true },
    manager: { type: Boolean, required: false, default: false },
  },
  data() {
    return {
      intSearch: "",
      selectedProtocol: undefined as Protocol | undefined,
      selectedProtocols: [] as Protocol[],
      managerQuery: undefined as any,
      query: undefined as any,
      rawProtocols: [] as Protocol[],
      queryLimit: 20,
      loading: false,
    };
  },
  setup() {
    const user: NotifiUser | undefined = inject("user");
    return {
      user,
    };
  },
  async mounted() {
    userModule.fetchUserTokens();
    this.fetchProtocols();
  },
  computed: {
    protocols(): Protocol[] {
      let prots = this.rawProtocols;
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
        this.rawProtocols.length = 0;
        this.fetchProtocols();
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
      if (this.search) {
        query.matches("name", this.search);
        console.log(`Search term ${this.search}`);
      }
      query.include("ProtocolStatus");
      query.limit(this.queryLimit);
      //console.log(`Skip the first ${this.rawProtocols.length}`);
      if (!refresh) {
        query.skip(this.rawProtocols.length);
      }
      this.querySubscribe(query);
      let prots = await query.find();

      // temporary code until we can make the query do this for us!
      if (this.manager) {
        const res = [] as Protocol[];
        for (let i = 0; i < prots.length; i++) {
          let man = await prots[i].managerOf();
          if (man) {
            res.push(prots[i]);
          }
        }
        prots = res;
      }
      if (refresh == true) {
        this.rawProtocols = prots;
      } else {
        this.rawProtocols.push(...prots);
      }
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
