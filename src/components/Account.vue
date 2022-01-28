<template>
  <div>
    <div class="flex pl-2 pt-3">
      <va-button
        @click.prevent="this.showAdd = true"
        :disabled="addNotAllowed"
        size="small"
        icon-right="add"
        class="mr-4"
      ></va-button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { userModule } from "../store/user";
import Moralis from "moralis";

export default defineComponent({
  name: "Account",
  components: {  },
  data() {
    return {
    };
  },
  computed: {

  },
  methods: {

  },
});
</script>

<style scoped></style>
