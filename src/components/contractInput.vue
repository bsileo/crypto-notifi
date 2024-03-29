<template>
  <div class="flex">
    <div class="row">
      <div v-if="chainPrompt" class="flex sm4">
        <ChainPicker
          @selected="selectChain"
          :selectedChain="selectedChain"
          :protocol="protocol"
        ></ChainPicker>
      </div>
      <div class="flex" :class="this.chainPrompt ? 'sm8' : 'sm12'">
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
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import Moralis from "moralis";
import { ref } from "vue";
import { Chain, Contract, ContractInfo } from "@/models/Contract";
import { Protocol } from "@/models/Protocol";
import ChainPicker from "@/components/ChainPicker.vue";

export default defineComponent({
  name: "contractInput",
  components: { ChainPicker },
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
    },
    chainPrompt: {
      type: Boolean,
      required: false,
      default: false,
    },
    protocol: {
      type: Protocol,
      required: false,
    },
  },
  emits: ["address", "contractInfo"],
  emitsBroken: {
    address(payload: { address: string }) {
      // perform runtime validation
      return payload.address.length != 42;
    },
    contract(payload: { contractinfo: ContractInfo }) {
      return payload.contractinfo != undefined;
    },
  },
  setup(props) {
    const result = ref({});
    const address = ref(props.initialAddress);
    const selectedChain = ref(props.chain);
    const selectChain = (c: Chain) => {
      selectedChain.value = c;
    };

    return { result, selectedChain, selectChain, address };
  },
  data() {
    return {
      name: "",
      symbol: "",
      loading: false,
      status: false,
    };
  },
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
        c.chain = this.selectedChain;
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
        const options = { chain: this.selectedChain, addresses: this.address };
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
            this.$emit("contractInfo", {
              chain: this.selectedChain,
              address: this.address,
              symbol: this.symbol,
              name: this.name,
            });
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
