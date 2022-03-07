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
      <va-inner-loading :loading="groupsLoading">
        <va-card outlined>
          <va-card-title>
            <va-chip>{{ group.name }}</va-chip>
          </va-card-title>
          <va-card-content>
            <GroupView :group="group" :showSubscriptions="true"></GroupView>
          </va-card-content>
        </va-card>
      </va-inner-loading>
    </div>
    <div class="flex xs12 md6 xl4" key="Ungrouped">
      <va-card outlined>
        <va-card-title> Ungrouped Subscriptions </va-card-title>
        <va-inner-loading :loading="ungroupedLoading">
          <va-card-content>
            <va-list>
              <draggable
                v-model="ungroupedSubscriptions"
                group="subscriptions"
                @start="drag = true"
                @end="drag = false"
                @change="dragChange"
                item-key="id"
                :sort="false"
              >
                <template #item="{ element }">
                  <SubscriptionListItem
                    :subscription="element"
                    :draggable="true"
                  >
                  </SubscriptionListItem>
                </template>
              </draggable>
            </va-list>
          </va-card-content>
        </va-inner-loading>
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
import draggable from "vuedraggable";

const router = useRouter();
// eslint-disable-next-line no-undef
const emit = defineEmits(["newGroup"]);
const groupsLoading = ref(false);
const ungroupedLoading = ref(false);

const refresh = () => {
  fetchGroups();
  fetchUngroupedSubs();
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
  ungroupedLoading.value = true;
  const g = new Group();
  ungroupedSubscriptions.value.length = 0;
  ungroupedSubscriptions.value.push(...(await g.subscriptions()));
  ungroupedLoading.value = false;
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

const checkMove = (event: any) => {
  return false;
};

const dragChange = async (event: any) => {
  if (event.added) {
    event.added.element.group = undefined;
    event.added.element.save();
  }
};
</script>

<style scoped></style>
