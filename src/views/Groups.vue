<template>
  <div class="row pb-1 pt-1">
    <div class="flex xs1 offset--xs11">
      <va-button icon="refresh" color="secondary" @click="refresh"></va-button>
      <va-button
        @click.prevent="addGroup"
        icon-right="add"
        size="medium"
        class="ml-4"
        color="success"
      >
      </va-button>
    </div>
  </div>
  <div class="row gutter--md mb-5">
    <div class="flex xs12 lg8">
      <div class="row gutter--md">
        <div
          v-for="group in groupsStore.groups"
          class="flex xs12 md6"
          :key="group.id"
        >
          <va-inner-loading :loading="groupsStore.loading">
            <va-card outlined>
              <va-card-title>
                <div class="row">
                  <va-chip>{{ group.name }}</va-chip>
                  <span class="minor"
                    >Next:
                    {{ group.prettyNextSend() }}
                  </span>
                  <va-button
                    class="rightButton"
                    @click="destroyGroup(group)"
                    icon-right="delete"
                    size="small"
                    color="danger"
                  ></va-button>
                </div>
              </va-card-title>
              <va-card-content>
                <GroupView :group="group" :showSubscriptions="true"></GroupView>
              </va-card-content>
            </va-card>
          </va-inner-loading>
        </div>
      </div>
    </div>
    <div class="flex xs12 md6 lg4" key="Ungrouped" ref="ungrouped">
      <va-card outlined>
        <va-card-title>
          <va-chip color="warning"
            >Ungrouped Subscriptions</va-chip
          ></va-card-title
        >
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
import { useGroupsStore } from "@/store/pinia_group";

// eslint-disable-next-line no-undef
const emit = defineEmits(["newGroup"]);
const ungroupedLoading = ref(false);
const groupsStore = useGroupsStore();

const refresh = () => {
  groupsStore.fetchGroups();
  fetchUngroupedSubs();
};

const fetchUngroupedSubs = async (): Promise<void> => {
  ungroupedLoading.value = true;
  const g = new Group();
  ungroupedSubscriptions.value.length = 0;
  ungroupedSubscriptions.value.push(...(await g.subscriptions()));
  ungroupedLoading.value = false;
};

const ungroupedSubscriptions = ref<Subscription[]>([]);

onMounted(() => {
  groupsStore.fetchGroups();
  fetchUngroupedSubs();
});

const showNoGroups = computed((): boolean => {
  return !groupsStore.loading && groupsStore.groups.length == 0;
});

const addGroup = (): void => {
  groupsStore.groups.push(Group.spawn());
  emit("newGroup");
};

const destroyGroup = async (delGroup: Group) => {
  if (delGroup.id) {
    await delGroup.destroy();
  } else {
    groupsStore.removeGroup(delGroup);
  }
};

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

<style scoped>
.rightButton {
  position: absolute;
  right: 0px;
  margin-right: 1em;
}
</style>
