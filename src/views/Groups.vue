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
  <div class="row gutter--md">
    <div v-for="group in groups" class="flex xs12 md6 xl4" :key="group.id">
      <va-card outlined>
        <va-card-title>
          {{ group.name }}
        </va-card-title>
        <va-card-content>
          <GroupView :group="group" :showSubscriptions="true"></GroupView>
        </va-card-content>
      </va-card>
    </div>
    <div class="flex xs12 md6 xl4" :key="Ungrouped">
      <va-card outlined>
        <va-card-title> Ungrouped Subscriptions </va-card-title>
        <va-card-content>
          <va-list>
            <SubscriptionListItem
              v-for="subscription in ungroupedSubscriptions"
              v-bind:key="subscription.id"
              :subscription="subscription"
            >
            </SubscriptionListItem>
          </va-list>
        </va-card-content>
      </va-card>
    </div>
  </div>
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
import SubscriptionListItem from "@/components/SubscriptionListItem.vue";
import { Group } from "@/models/Group";
import { Subscription } from "@/models/Subscription";
import { userModule } from "@/store/user";
import { load } from "dotenv";
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
  groups.value.length = 0;
  groups.value.push(...(await query.find()));
  groupsLoading.value = false;
};

const fetchUngroupedSubs = async (): Promise<void> => {
  groupsLoading.value = true;
  const g = new Group();
  ungroupedSubscriptions.value.length = 0;
  ungroupedSubscriptions.value.push(...(await g.subscriptions()));
};

const groups = ref<Group[]>([]);
const ungroupedSubscriptions = ref<Subscription[]>([]);

onMounted(() => {
  fetchGroups();
  fetchUngroupedSubs();
});

const showNoGroups = computed((): boolean => {
  return !groupsLoading.value && groups.value?.length == 0;
});

const addGroups = (): void => {
  router.push({ name: "GroupNew" });
};
</script>

<style scoped></style>
