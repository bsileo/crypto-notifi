<template>
  <va-input
    :label="label"
    v-model="address"
    :error="!status"
    :success="status"
    :error-messages="this.err_messages"
    placeholder="0x83952E7ab4aca74ca96217D6F8f7591BEaD6D64E"
  >
    <template #appendInner>
      <div v-if="showToken">
        <a v-if="status" :href="contractURL" target="_blank">
          {{ symbol }}
        </a>
      </div>
    </template>
  </va-input>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import Moralis from "moralis";
import { ref } from "vue";
import { Chain, Contract } from "@/models/Contract";

export default defineComponent({
  name: "contractInput",
  props: {
    initialAddress: {
      type: String,
      required: false,
      default: "",
    },
    showToken: {
      type: Boolean,
      required: false,
      default: false,
    },
    chain: {
      type: String as PropType<Chain>,
      required: false,
      default(this: void) {
        return "avalanche";
      },
    },
    label: {
      type: String,
      required: false,
      default: "Contract Address",
    }
  },
  setup(props) {
    const result = ref({});
    const address = ref(props.initialAddress);
    return { result, address };
  },
  data() {
    return {
      name: "",
      symbol: "",
      loading: false,
      status: false,
    };
  },
  emits: ["address"],
  watch: {
    initialAddress(newAddr: string) {
      this.address = newAddr;
    },
    address() {
      this.fetchResult();
    },
  },
  mounted() {
    this.fetchResult();
  },
  computed: {
    icon(): { name: string; color: string } {
      if (this.symbol) return { name: "check", color: "success" };
      else return { name: "error", color: "danger" };
    },
    err_messages(): string[] {
      const res = [];
      const addr = this.address;
      if (addr.length > 3 && addr.slice(0, 2) !== "0x") {
        res.push('Address should start with "0x"');
      }
      if (addr.length > 30 && addr.length != 42) {
        res.push("Address should be 42 characters");
      }
      return res;
    },
    contractURL(): string {
      if (this.status) {
        const c = new Contract();
        c.chain = this.chain;
        c.address = this.address;
        return c.contractURL;
      }
      return "";
    },
  },
  methods: {
    async fetchResult() {
      this.symbol = "";
      this.name = "";
      this.result = {};
      this.status = false;
      this.loading = true;
      if (this.address && this.address.length == 42) {
        const options = { chain: this.chain, addresses: this.address };
        try {
          const tokenMetadata = await Moralis.Web3API.token.getTokenMetadata(
            options
          );
          if (tokenMetadata && tokenMetadata.length == 1) {
            this.result = tokenMetadata[0];
            this.symbol = tokenMetadata[0].symbol || "<N/A>";
            this.name = tokenMetadata[0].name;
            this.address = this.address.toLowerCase();
            this.status = true;
            this.$emit("address", this.address);
          }
        } catch (e) {
          this.result = {};
        }
      }
      this.loading = false;
    },
  },
});
</script>
