<template>
  <va-card
    :class="cardClass"
    :dark="selected"
    :stripe="selected"
    stripe-color="success"
    :href="allowSelectHref"
    @click.prevent="this.select(protocol)"
  >
    <va-card-title>
      <va-chip :href="protocol.website" shadow color="success" size="medium">{{
        protocol.name
      }}</va-chip>
      <va-icon
        v-if="showFavorites"
        :name="isFavorite ? 'favorite' : 'favorite_border'"
        :size="35"
        @click="toggleFavorite"
        :color="isFavorite ? 'danger' : '#000'"
      ></va-icon>
    </va-card-title>
    <va-image style="height: 50px" contain :src="protocol.iconURL">
      <template #error> Image not found! :( </template>
      <template #loader>
        <va-progress-circle indeterminate />
      </template>
    </va-image>
    <div v-if="protocol.tokenData" class="pt-2">
      Token:
      <a :href="protocol.tokenContractURL()" target="_blank">
        {{ protocol.tokenData.symbol }}</a
      >
    </div>
    <div>
      <slot name="details" :protocol="protocol"></slot>
    </div>
    <div v-if="showVote">
      <div class="pt-2 row">
        <div class="flex xs4">Status:</div>
        <div v-if="protocol.protocolSiteStatus == 'Pending'" class="flex xs8">
          <va-badge
            visible-empty
            ref="badge"
            :text="protocol.protocolPendingVotes"
            class="mr-4"
          >
            {{ protocol.protocolSiteStatus }}
          </va-badge>
        </div>
        <div v-else class="flex xs8">
          {{ protocol.protocolSiteStatus }}
        </div>
      </div>
    </div>
    <div v-if="showPositions">
      <va-list>
        <va-list-label>
          Positions:
          <va-button
            icon="refresh"
            size="small"
            @click="fetchPositions"
          ></va-button>
        </va-list-label>
        <va-inner-loading :loading="loadingPositions">
          <PositionVue
            v-for="(position, idx) in positions"
            v-bind:key="idx"
            :position="position"
          ></PositionVue>
          <div style="text-align: center" v-if="showNoPositions">
            <strong>None Found</strong>
          </div>
        </va-inner-loading>
      </va-list>
    </div>
    <div v-if="showUserInfo">Balance: {{ protocol.getWalletBalance() }}</div>
    <div v-if="showUserInfo">
      Level:<strong>{{ protocol.getUserLevel() }}</strong>
    </div>
    <va-card-actions>
      <va-button v-if="allowSelect" @click="this.select(protocol)"
        >Select</va-button
      >
      <va-popover
        color="primary"
        message="Request support for this Protocol on Notifi"
      >
        <va-button
          v-if="this.showVote && protocol.protocolSiteStatus == 'Pending'"
          size="small"
          @click="voteFor(protocol)"
          >Vote</va-button
        >
      </va-popover>
      <va-button
        v-if="this.showSubscribe && protocol.protocolSiteStatus == 'Active'"
        size="small"
        color="primary"
        @click="subscribe(protocol)"
        >Subscribe</va-button
      >
      <va-button
        v-if="this.showVote && protocol.protocolSiteStatus == 'Pending'"
        size="small"
        color="warning"
        @click="claim(protocol)"
        >Claim</va-button
      >
    </va-card-actions>
  </va-card>
  <va-modal v-model="showClaim" title="" hide-default-actions>
    <slot>
      <ProtocolClaim :protocol="protocol" @saved="claimSaved"></ProtocolClaim>
    </slot>
  </va-modal>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref, watchEffect } from "vue";
import Moralis from "moralis";
import { Protocol } from "@/models/Protocol";
import ProtocolClaim from "./ProtocolClaim.vue";
import PositionVue from "./position.vue";
import { Position } from "@/models/Position";
export default defineComponent({
  name: "ProtocolInfo",
  components: { ProtocolClaim, PositionVue },
  emits: ["selected", "subscribe", "claimed"],
  props: {
    showVote: { type: Boolean, required: false, default: false },
    showSubscribe: { type: Boolean, required: false, default: false },
    showUserInfo: { type: Boolean, required: false, default: false },
    showPositions: { type: Boolean, required: false, default: false },
    showFavorites: { type: Boolean, required: false, default: true },
    allowSelect: { type: Boolean, required: false, default: true },
    displayMode: { type: String, required: false, default: "wide" },
    manager: { type: Boolean, required: false, default: false },
    protocol: { type: Protocol, required: true },
    selected: { type: Boolean, required: false, default: false },
  },
  setup(props, { emit }) {
    const showClaim = ref(false);

    const isFavorite = ref(false);
    const refreshFavorite = async () => {
      isFavorite.value = await props.protocol.isFavorite();
    };

    watchEffect(() => {
      if (props.protocol) {
        refreshFavorite();
      }
    });

    const toggleFavorite = async (): Promise<void> => {
      await props.protocol.toggleFavorite();
      refreshFavorite();
    };

    const positions = ref<Position[]>([]);
    const loadingPositions = ref(false);
    const showNoPositions = computed((): boolean => {
      return !loadingPositions.value && positions.value.length == 0;
    });

    const wide = computed(() => {
      return props.displayMode == "wide";
    });

    const cardClass = computed((): Record<string, boolean> => {
      if (wide.value)
        return {
          active: props.selected,
          flex: true,
          "mb-1": true,
          xs12: wide.value,
          sm6: wide.value,
          lg6: wide.value,
          xl6: wide.value,
        };
      else
        return {
          active: props.selected,
          flex: true,
          "mb-1": true,
          xs12: !wide.value,
          sm4: !wide.value,
          lg3: !wide.value,
          xl2: !wide.value,
        };
    });

    onMounted(async () => {
      if (props.showPositions) {
        fetchPositions();
      }
      refreshFavorite();
    });

    const fetchPositions = async () => {
      loadingPositions.value = true;
      positions.value = await props.protocol.positions();
      loadingPositions.value = false;
    };

    return {
      showClaim,
      isFavorite,
      wide,
      toggleFavorite,
      positions,
      loadingPositions,
      fetchPositions,
      showNoPositions,
      cardClass,
    };
  },
  computed: {
    allowSelectHref() {
      return this.allowSelect ? "#" : null;
    },
  },
  methods: {
    async voteFor(aProtocol: Protocol): Promise<void> {
      const newVotes = await aProtocol.siteVote();
      this.$forceUpdate();
    },
    claim(aProtocol: Protocol): void {
      this.showClaim = true;
    },
    claimSaved(aProtcolStatus: any): void {
      this.showClaim = false;
      this.$emit("claimed");
    },
    select(aProtocol: Protocol): void {
      if (this.allowSelect) {
        this.$emit("selected", this.protocol);
      }
    },
    subscribe(aProtocol: Protocol): void {
      this.$emit("subscribe", this.protocol);
    },
  },
});
</script>

<style scoped></style>
