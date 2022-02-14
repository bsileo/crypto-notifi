<template>
  <div class="pl-4">
    <div v-show="!selectedProtocol" class="row">
      <div v-show="subType == undefined" class="pb-3">
        <h1>Select a Protocol:</h1>
      </div>
      <ProtocolSelector
        :showSearch="true"
        :showUserInfo="true"
        @selection="selectProtocol"
      ></ProtocolSelector>
    </div>
    <div v-if="selectedProtocol" class="row">
      <ProtocolInfo
        :protocol="selectedProtocol"
        :selected="false"
        :showVote="false"
        :showUserInfo="true"
        :showFavorites="true"
        :allowSelect="false"
        :showSubscribe="false"
        displayMode="narrow"
      >
      </ProtocolInfo>
      <div class="flex xs1">
        <va-button
          @click="clearProtocol"
          size="small"
          color="secondary"
          icon="clear"
          class="float-right"
        ></va-button>
      </div>
    </div>
  </div>
  <va-divider inset />
  <div>
    <div class="flex row pt-2">
      <va-select
        class="flex xs12 sm8 md6"
        label="Subscription Category"
        v-model="subGeneralTypeID"
        :options="subGeneralTypes"
        value-by="id"
        text-by="name"
        :rules="[
          (subGeneralTypeID) =>
            subGeneralTypeID != null || 'Select an alert category',
        ]"
      />
      <div class="row pt-2">
        <div class="flex xs12 sm8 md6">
          <va-card :bordered="false">
            <va-card-title>About these Alerts:</va-card-title>
            <va-card-content>
              <span v-html="this.selectedSubGeneralTypeDescription"></span>
            </va-card-content>
          </va-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, inject, computed, ref, watch } from "vue";

import { Subscription } from "@/models/Subscription";
import {
  SubscriptionType,
  SubscriptionTypeStatus,
} from "@/models/SubscriptionType";
import { Protocol } from "@/models/Protocol";

import Moralis from "moralis";
import { NotifiUser } from "@/models/NotifiUser";
import ProtocolSelector from "./ProtocolSelector.vue";
import ProtocolInfo from "./ProtocolInfo.vue";

export default defineComponent({
  name: "SubscribeProtocol",
  components: { ProtocolSelector, ProtocolInfo },
  props: {
    subscription: { type: Subscription, required: false },
    protocol: { type: Protocol, required: false },
  },
  emits: ["changed"],
  setup(props, { emit }) {
    const user: NotifiUser | undefined = inject("user");
    const intSelectedProtocol = ref<Protocol | undefined>(props.protocol);
    const subGeneralTypes = ref<SubscriptionType[]>([]);

    const intSubGeneralTypeID = ref("");
    const subGeneralTypeID = computed({
      get(): string {
        return intSubGeneralTypeID.value;
      },
      set(val: string): void {
        intSubGeneralTypeID.value = val;
        emit("changed");
      },
    });

    const selectedProtocol = computed({
      get(): Protocol | undefined {
        return intSelectedProtocol.value;
      },
      set(val: Protocol | undefined): void {
        intSelectedProtocol.value = val;
        emit("changed");
      },
    });
    const selectedSubGeneralTypeName = computed((): string | undefined => {
      const t = selectedSubGeneralType.value;
      return t?.name;
    });

    const selectedSubGeneralTypeDescription = computed(
      (): string | undefined => {
        const t = selectedSubGeneralType.value;
        return t?.description;
      }
    );

    const selectedSubGeneralType = computed(
      (): SubscriptionType | undefined => {
        const t = subGeneralTypes.value.find(
          (e) => e.id == subGeneralTypeID.value
        );
        return t;
      }
    );

    const fetchSubGeneralTypes = async (): Promise<void> => {
      const q = new Moralis.Query(SubscriptionType);
      q.equalTo("protocol", selectedProtocol.value);
      q.equalTo("status", SubscriptionTypeStatus.active);
      const res = await q.find();
      subGeneralTypeID.value = "";
      subGeneralTypes.value.length = 0;
      subGeneralTypes.value.push(...res);
    };

    const irrigate = (s: Subscription): void => {
      if (selectedSubGeneralType.value != undefined)
        s.category = selectedSubGeneralType.value;
      if (selectedProtocol.value != undefined)
        s.protocol = selectedProtocol.value;
    };

    const message = computed((): string => {
      const info = selectedSubGeneralTypeName.value || "[Select a Type above]";
      return `the <strong>${selectedProtocolName.value}</strong> Protocol about <strong>${info}</strong>`;
    });

    const selectedProtocolName = computed((): string => {
      const p = intSelectedProtocol.value;
      if (!p) {
        return "";
      } else {
        return p.name;
      }
    });

    const validSubmit = computed((): boolean => {
      return selectedProtocolName.value != "" && subGeneralTypeID.value != "";
    });

    const clearProtocol = () => {
      selectedProtocol.value = undefined;
    };
    const selectProtocol = (prot: Protocol) => {
      selectedProtocol.value = prot;
    };

    watch(selectedProtocol, async (newProt, oldProt) => {
      fetchSubGeneralTypes();
    });

    return {
      user,
      subGeneralTypes,
      subGeneralTypeID,
      message,
      clearProtocol,
      selectProtocol,
      validSubmit,
      selectedProtocol,
      selectedProtocolName,
      selectedSubGeneralType,
      selectedSubGeneralTypeDescription,
      irrigate,
    };
  },
});
</script>

<style scoped>
div.active {
  background-color: rgb(197 47 47);
}
.protocolCards {
  max-height: 30em;
  overflow-y: scroll;
  overflow-x: clip;
}
</style>
