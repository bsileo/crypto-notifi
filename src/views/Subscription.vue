<template>
  <div class="header" v-if="selectedSubscription">Update Subscription</div>
  <router-view v-slot="{ Component }">
    <template v-if="Component">
      <KeepAlive>
        <Suspense :key="$route.fullPath">
          <component :is="Component" :key="$route.fullPath" />
          <template #fallback>
            <va-inner-loading :loading="true"/>
          </template>
        </Suspense>
      </KeepAlive>
    </template>
  </router-view>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useRoute } from "vue-router";
import { Subscription } from "@/models/Subscription";
const route = useRoute();

// eslint-disable-next-line no-undef
const props = defineProps({
  subscriptionID: { type: String, required: false },
  typeName: { type: String, required: false, default: "new" },
});
const selectedSubscription = ref<Subscription | undefined>(undefined);

watch(
  () => route.params.subscriptionID,
  async (sId) => {
    if (route.params.subscriptionID) {
      selectedSubscription.value = await Subscription.fetch(
        route.params.subscriptionID as string
      );
    } else {
      selectedSubscription.value = undefined;
    }
  }
);
</script>

<style scoped>
.header {
  font-size: larger;
  background: var(--va-secondary);
  padding-top: 5px;
  padding-bottom: 5px;
  text-align: center;
  height: 2em;
}
</style>
