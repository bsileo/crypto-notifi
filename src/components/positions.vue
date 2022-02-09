<template>
  <div v-if="!showNoPositions" class="row pb-1 pt-1">
    <va-input class="flex xs5" label="Search Names" v-model="search">
    </va-input>
    <div class="flex xs2">
      <va-button icon="refresh" color="secondary" @click="refresh"></va-button>
    </div>
  </div>
  <div class="layout gutter--sm">
    <va-inner-loading :loading="protocolsLoading" :size="60">
      <div class="row">
        <ProtocolInfo
          v-for="protocol in protocols"
          v-bind:key="protocol.id"
          :allowSelect="false"
          :protocol="protocol"
          :displayMode="wide"
          :showPositions="true"
        >
        </ProtocolInfo>
      </div>
    </va-inner-loading>
    <div v-if="showNoPositions" class="pt-3">
      <h2>
        Welcome to Crypto Notifi! You have not created any Favorites yet. Go to
        the Protocols section and select those you have positions in to get
        started.
      </h2>
    </div>
  </div>
</template>

<script lang="ts">
import Moralis from "moralis";
import { computed, defineComponent, ref } from "vue";
import ProtocolInfo from "@/components/ProtocolInfo.vue";
import { Protocol } from "@/models/Protocol";
import { userModule } from "@/store/user";

export default defineComponent({
  name: "positions",
  components: { ProtocolInfo},
  props: {
    showAdd: Boolean,
  },
  setup(props, { emit }) {
    const rawProtocols = ref<Protocol[]>([]);
    const intSearch = ref("");
    const queryLimit = ref(25);
    const protocolsLoading = ref(false);
    const rawCount = ref(0);

    const showNoPositions = computed(() => {
      return rawProtocols.value.length == 0 && !protocolsLoading.value;
    });

    return {
      rawProtocols,
      intSearch,
      queryLimit,
      rawCount,
      protocolsLoading,
      showNoPositions,
    };
  },
  async created() {
    this.fetchProtocols();
  },
  emits: ["subscribe"],
  computed: {
    protocols(): Protocol[] {
      let subs = this.rawProtocols;
      return subs;
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
    edit(id: string): void {
      console.log(`Edit ${id}`);
    },
    remove(id: string): void {
      console.log(`remove ${id}`);
      const query = new Moralis.Query("Subscription");
      query.get(id).then((s: { destroy: () => Promise<unknown> }) => {
        s.destroy().then((oldS) => {
          console.log(`Success remove ${oldS}`);
        });
      });
    },
    refresh() {
      this.rawProtocols.length = 0;
      this.fetchProtocols();
    },
    async appendProtocols(): Promise<void> {
      //console.log("Append");
      this.fetchProtocols();
    },
    async fetchProtocols(): Promise<void> {
      if (!userModule.user) return;
      this.protocolsLoading = true;
      const rel = userModule.user.relation("FavoriteProtocols");
      const query = rel.query();
      this.rawCount = await query.count();
      if (this.search) {
        query.matches("name", this.search);
      }
      query.limit(this.queryLimit);
      query.skip(this.rawProtocols.length);
      let subs = await query.find();
      this.subscribe(query);
      this.rawProtocols.push(...subs);
      this.protocolsLoading = false;
    },
    async subscribe(query: any) {
      const subscription = await query.subscribe();
      subscription.on("create", (sub: Protocol) => {
        this.rawProtocols.push(sub);
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      subscription.on("update", (sub: Protocol) => {
        const index = this.rawProtocols.findIndex((e) => e.id == sub.id);
        if (index > -1) {
          this.rawProtocols.splice(index, 1, sub);
        }
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      subscription.on("enter", (sub: Protocol) => {
        // console.log("object entered");
        this.rawProtocols.push(sub);
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      subscription.on("leave", (sub: Protocol) => {
        const index = this.rawProtocols.findIndex((e) => e.id == sub.id);
        if (index > -1) {
          this.rawProtocols.splice(index, 1);
        }
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      subscription.on("delete", (sub: Protocol) => {
        const index = this.rawProtocols.findIndex((e) => e.id == sub.id);
        if (index > -1) {
          this.rawProtocols.splice(index, 1);
        }
      });
      subscription.on("close", () => {
        console.log("Protocols subscription closed");
      });
    },
  },
});
</script>

<style scoped>
.top-right {
  position: absolute;
  right: 0;
}
</style>
