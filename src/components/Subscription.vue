<template>
  <va-card>
    <va-card-title>
      {{ name }}
    </va-card-title>
    <div class="row pb-1">
      {{ type }}
    </div>
    <div>
      {{ description }}
    </div>
  </va-card>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { Subscription } from "@/models/Subscription";

export default defineComponent({
  setup() {
    return {};
  },
  props: {
    subscription: { type: Subscription, required: false },
  },
  components: {},
  data() {
    return {
      currentSubscription: this.subscription || new Subscription(),
    };
  },
  computed: {
    name: {
      get(): string {
        return this.currentSubscription.name;
      },
      set(val: string) {
        this.currentSubscription.name = val;
      },
    },
    type: {
      get(): string {
        return this.currentSubscription.type;
      },
      set(val: string) {
        this.currentSubscription.type = val;
      },
    },
    description: {
      get(): string {
        return this.currentSubscription.description;
      },
      set(val: string) {
        this.currentSubscription.description = val;
      },
    },
  },
});
</script>
