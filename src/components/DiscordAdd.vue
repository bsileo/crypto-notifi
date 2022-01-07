<template>
  <div class="flex sm12">
    <div class="row pt-2">
      <va-input
        class="mb-4"
        @change="updateProviderData()"
        @keyup="updateProviderData()"
        v-model="discordUser"
        label="Enter Discord UserName"
        placeholder="@DiscordDude"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "Discord",
  components: {},
  emits: ["providerData"],
  data() {
    return {
      discordUser: "",
    };
  },
  computed: {
    validUser(): boolean {
      return this.discordUser != "" && this.discordUser.length > 3;
    },
    valid(): boolean {
      return this.validUser;
    },
    providerdata(): Record<string, string | undefined> {
      return {
        username: this.discordUser,
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
