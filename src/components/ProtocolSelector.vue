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
            class="flex sm12"
            label="Search Protocols"
            v-model="search"
          ></va-input>
        </div>
      </va-affix>
      <va-infinite-scroll :load="appendProtocols">
        <div class="row pt-2 pb-4">
          <va-card
            class="flex sm5 lg3 mr-1 mb-1"
            :class="{
              active: this.selectedProtocol?.get('name') == protocol.name,
            }"
            :dark="this.selectedProtocol?.get('name') == protocol.name"
            :stripe="this.selectedProtocol?.get('name') == protocol.name"
            stripe-color="success"
            v-bind:key="protocol.id"
            v-for="protocol in protocols"
          >
            <va-card-title>
              <va-chip
                :href="protocol.website"
                shadow
                color="success"
                size="medium"
                >{{ protocol.name }}</va-chip
              >
            </va-card-title>
            <va-image style="height: 50px" contain :src="protocol.iconURL">
              <template #error> Image not found! :( </template>
              <template #loader>
                <va-progress-circle indeterminate />
              </template>
            </va-image>
            <div>
              <slot name="protocol"></slot>
            </div>
            <div v-if="protocol.tokenData" class="pt-2">
              Token:
              <a :href="protocol.tokenContractURL()" target="_blank">
                {{ protocol.tokenData.symbol }}</a
              >
            </div>
            <div v-if="showUserInfo">
              Balance: {{ protocol.getWalletBalance() }}
            </div>
            <div v-if="showUserInfo">
              Level:<strong>{{ protocol.getUserLevel() }}</strong>
            </div>
            <va-card-actions align="between">
              <va-button v-if="allowSelect" @click="this.select(protocol)"
                >Select</va-button
              >
            </va-card-actions>
          </va-card>
        </div>
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

export default defineComponent({
  name: "ProtocolSelector",
  components: {},
  emits: ["selection"],
  props: {
    showSearch: { type: Boolean, required: false, default: true },
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
    /*this.query = await Protocol.setupSubscription(
      this.refreshProtocols,
      this.manager
    );
    this.refreshProtocols();*/
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
      //console.log(`selected ${aProtocol}`);
      this.selectedProtocol = aProtocol;
      this.$emit("selection", this.selectedProtocol);
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
    async fetchProtocols(): Promise<void> {
      const query = new Moralis.Query(Protocol);
      if (this.search) {
        query.matches("name", this.search);
        console.log(`Search term ${this.search}`);
      }
      query.limit(this.queryLimit);
      //console.log(`Skip the first ${this.rawProtocols.length}`);
      query.skip(this.rawProtocols.length);
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
      this.rawProtocols.push(...prots);
    },
    async refreshProtocols(obj?: any): Promise<void> {
      let prots = await this.query.find();
      // temporary code until we can make the query do this for us!
      if (this.manager) {
        const res = [] as Protocol[];
        for (let i = 0; i < prots.length; i++) {
          let man = await prots[i].managerOf();
          if (man) {
            res.push(prots[i]);
          }
        }
        this.rawProtocols.length = 0;
        this.rawProtocols.push(...res);
      } else {
        this.rawProtocols.length = 0;
        this.rawProtocols.push(...prots);
      }
    },
  },
});
</script>

<style scoped>
.protocolCards {
  max-height: 30em;
  overflow-y: scroll;
  overflow-x: clip;
}
</style>
