<template>
  <div class="flex sm12">
    <div class="row pt-2">
      <va-input class="mb-4" @change="updateProviderData()"
        @keyup="updateProviderData()"
        v-model="email"
        label="Enter Email Address"
        placeholder="user@gmail.com"
        :error="!this.valid"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "Email",
  components: {},
  emits: ["providerData"],
  data() {
    return {
      email: "",
    };
  },
  computed: {
    validEmail(): boolean {
      if (/(.+)@(.+){2,}\.(.+){2,}/.test(this.email)) {
        return true;
      } else {
        return false;
      }
    },
    valid(): boolean {
      return this.validEmail;
    },
    providerdata(): Record<string, string | undefined> {
      return {
        email: this.email,
      };
    },
  },
  methods: {
    updateProviderData(): void {
      console.log(`Update PD ${this.valid}--${this.providerdata}`);
      if (this.valid) {
        this.$emit("providerData", this.providerdata);
      } else {
        this.$emit("providerData", null);
      }
    },
  },
});
</script>

<style scoped></style>
