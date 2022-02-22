<template>
  <div>Hello from Brad</div>
  <EmailCategory2></EmailCategory2>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import EmailCategory2 from "./EmailCategoryWidget.vue";

export default defineComponent({
  name: "App",
  components: { EmailCategory2 },
});
</script>
