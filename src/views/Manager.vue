<template>
  <div class="header" v-if="selectedProtocol">
    Manage {{ selectedProtocol.name }}
  </div>
  <router-view v-slot="{ Component }">
    <template v-if="Component">
      <KeepAlive>
        <Suspense :key="$route.fullPath">
          <component :is="Component" :key="$route.fullPath" />
          <template #fallback> Loading... </template>
        </Suspense>
      </KeepAlive>
    </template>
  </router-view>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { Protocol } from "@/models/Protocol";
import { fetchProtocol } from "@/composables/getProtocolByID";
import { useRoute } from "vue-router";
const route = useRoute();

// eslint-disable-next-line no-undef
const props = defineProps({
  protocolID: { type: String, required: false },
});
const selectedProtocol = ref<Protocol | undefined>(new Protocol());
if (props.protocolID) {
  selectedProtocol.value = await fetchProtocol(props.protocolID);
}

watch(
  () => route.params.protocolID,
  async (pId) => {
    console.log(route.params.protocolID);
    if (route.params.protocolID) {
      console.log("fetch manager Protocol " + route.params.protocolID);
      selectedProtocol.value = await fetchProtocol(
        route.params.protocolID as string
      );
      console.log(selectedProtocol.value);
    } else {
      console.log("Cleared manager Protocol");
      selectedProtocol.value = undefined;
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
