<template>
  <div class="row pb-1 pt-1">
    <div class="flex xs1 offset--xs11">
      <va-button icon="refresh" color="secondary" @click="refresh"></va-button>
      <va-button
        to="/groups/add"
        icon-right="add"
        size="medium"
        class="ml-4"
        color="success"
      >
      </va-button>
    </div>
  </div>
  <va-collapse
    v-for="group in groups"
    :key="group.id"
    :header="group.name"
    stateful
  >
    <GroupView :group="group"></GroupView>
  </va-collapse>
  <div v-if="showNoGroups" class="pt-3">
    <div class="flex sm12" style="text-align: center">
      <h2>
        There are no Groups yet.
        <va-button
          to="/groups/add"
          icon-right="add"
          size="large"
          color="success"
        >
        </va-button>
      </h2>
    </div>
  </div>
</template>

<script setup lang="ts">
import GroupView from "@/components/GroupView.vue";
import { Group } from "@/models/Group";
import { userModule } from "@/store/user";
import Moralis from "moralis";
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
// eslint-disable-next-line no-undef
const emit = defineEmits(["newGroup"]);
const groupsLoading = ref(false);

const refresh = () => {
  fetchGroups();
};

const fetchGroups = async (): Promise<void> => {
  if (!userModule.user) return;
  groupsLoading.value = true;
  const query = new Moralis.Query(Group);
  query.equalTo("User", userModule.user);
  groups.value = await query.find();
  const ungroup = new Group();
  ungroup.name = "Ungrouped Subscriptions";
  groups.value!.push(ungroup);
  groupsLoading.value = false;
};

const groups = ref<Group[]>();

onMounted(() => {
  fetchGroups();
});

const showNoGroups = computed((): boolean => {
  return !groupsLoading.value && groups.value?.length == 0;
});

const addGroups = (): void => {
  router.push({ name: "GroupNew" });
};
</script>

<style scoped></style>
