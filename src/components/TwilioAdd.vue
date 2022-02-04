<template>
  <div class="flex sm12">
    <div class="row pt-2">
      <va-input
        class="mb-4"
        @change="updateProviderData()"
        @keyup="updateProviderData()"
        v-model="newNumber"
        label="U.S. Phone Number"
        placeholder="412.555.1212"
        :error="!this.valid"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "Twilio",
  components: {},
  emits: ["providerData"],
  data() {
    return {
      newNumber: "",
    };
  },
  computed: {
    validNumber(): boolean {
      return (
        this.newNumber != "" &&
        /([0-9]{3})\)?[-.●]?([0-9]{3})[-.●]?([0-9]{4})/.test(this.newNumber)
      );
    },
    valid(): boolean {
      return this.validNumber;
    },
    providerdata(): Record<string, string | undefined> {
      return {
        to: this.newNumber,
        status: "new",
      };
    },
  },
  methods: {
    updateProviderData(): void {
      if (this.valid) {
        this.formatNumber();
        this.$emit("providerData", this.providerdata);
      } else {
        this.$emit("providerData", null);
      }
    },
    formatNumber() {
      let cleaned = ("" + this.newNumber).replace(/\D/g, "");
      const match = cleaned.match(
        /([0-9]{3})\)?[-.●]?([0-9]{3})[-.●]?([0-9]{4})/
      );
      if (!match) return;
      this.newNumber = `${match[1]}.${match[2]}.${match[3]}`;
    },
  },
});
</script>

<style scoped></style>
