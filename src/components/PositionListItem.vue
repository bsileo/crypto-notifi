<template>
  <div class="position">
    <va-list-item>
      <va-list-item-section avatar>
        <va-avatar :src="logo" :size="25"></va-avatar>
      </va-list-item-section>
      <va-list-item-section>
        <va-list-item-label>
          <va-icon :name="typeIcon" :size="16"></va-icon>
          {{ name }} ${{ value }}
        </va-list-item-label>
        <va-list-item-label caption>
          <div v-if="lp">
            <div class="row">
              <div class="flex xs12">
                {{ prettyNumber(token1.balance) }} @ ${{
                  prettyNumber(token1.price)
                }}
              </div>
              <div class="flex xs12">
                {{ prettyNumber(token0.balance) }} @ ${{
                  prettyNumber(token0.price)
                }}
              </div>
            </div>
          </div>
          <div v-else>{{ balance }} @ ${{ price }}</div>
        </va-list-item-label>
      </va-list-item-section>
      <va-list-item-section v-if="showSubscription">
        <PositionSubscription :position="position"></PositionSubscription>
      </va-list-item-section>
    </va-list-item>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import { Position } from "@/models/Position";
import PositionSubscription from "./PositionSubscription.vue";
import { prettyNumber } from "@/Utilities";
import { TokenStatus } from "cookietrack-types";

export default defineComponent({
  name: "PositionListItem",
  components: { PositionSubscription },
  props: {
    position: { type: Position, required: true },
    showSubscription: { type: Boolean, required: false, default: true },
  },
  setup(props, { emit }) {
    const name = computed(() => {
      return props.position.name;
    });
    const symbol = computed(() => {
      return props.position.symbol;
    });
    const balance = computed(() => {
      const bal = props.position.balance;
      return `${prettyNumber(bal)}`;
    });
    const price = computed(() => {
      const p = props.position.price;
      return `${prettyNumber(p)}`;
    });
    const value = computed(() => {
      return `${prettyNumber(props.position.value)}`;
    });
    const address = computed(() => {
      return props.position.address;
    });
    const logo = computed(() => {
      return props.position.logo;
    });
    const lp = computed(() => {
      return props.position.type == "lpToken";
    });
    const token0 = computed(() => {
      return props.position.token0;
    });
    const token1 = computed(() => {
      return props.position.token1;
    });
    const typeIcon = computed(() => {
      const stat: TokenStatus = props.position.status;
      if (stat == "unclaimed") return "redeem";
      return lp.value ? "toll" : "monetization_on";
    });

    const subscription = computed(() => {
      return props.position.subscription;
    });

    return {
      name,
      symbol,
      balance,
      address,
      logo,
      price,
      value,
      lp,
      token0,
      token1,
      typeIcon,
      subscription,
      prettyNumber,
    };
  },
});
</script>

<style scoped>
.position:hover {
  background-color: var(--va-background);
}
</style>
