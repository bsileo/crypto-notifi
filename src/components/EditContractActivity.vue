<template>
  <div>
    <div class="row pb-1">
      <va-input class="flex sm10" label="Name" v-model="name"></va-input>
      <va-button
        v-if="newRecord"
        icon="add"
        size="small"
        :disabled="!addAllowed"
        @click="add"
      ></va-button>
      <va-button
        v-if="!newRecord"
        icon="delete"
        size="small"
        @click="destroy"
      ></va-button>
    </div>
    <div class="row pb-1">
      <va-input
        class="flex sm12"
        label="Description"
        textarea
        v-model="description"
      ></va-input>
    </div>
    <div class="row pb-1">
      <va-input
        class="flex sm12"
        label="Topic"
        placeholder="Transfer(address, address, uint256)"
        v-model="topic"
      ></va-input>
    </div>
    <div class="row pb-1">
      <va-input
        class="flex sm12"
        label="ABI"
        type="textarea"
        :error="ABIfailed"
        :error-messages="ABIerrors"
        :min-rows="4"
        v-model="abi"
      ></va-input>
    </div>
    <LevelSelector @changed="setLevel" :startingLevel="level"></LevelSelector>
    <div class="row pb-1">
      <va-tabs v-model="textType">
        <template #tabs>
          <va-tab name="plain">Plain</va-tab>
          <va-tab name="rich">Rich</va-tab>
        </template>
      </va-tabs>
      <va-input
        v-if="textType == 'plain'"
        class="flex sm12"
        label="Plain Message Template"
        type="textarea"
        :min-rows="6"
        autosize
        v-model="template"
        placeholder="This is an alert for [[user]] triggered from [[contract]]"
      ></va-input>
      <div class="editor" v-if="textType == 'rich'">
        <editor
          api-key="582k9lowpc19oacd180hsqwlq73pavp5uvuet95zgras454q"
          v-model="richTemplate"
          :init="{
            height: 200,
            menubar: true,
            plugins: [
              'advlist autolink lists link image charmap print preview anchor',
              'searchreplace visualblocks code fullscreen',
              'insertdatetime media table paste code help wordcount',
            ],
            toolbar:
              'undo redo | formatselect | bold italic backcolor | \ alignleft aligncenter alignright alignjustify | \
            bullist numlist outdent indent | removeformat | help',
            menu: {
              file: {
                title: 'File',
                items: 'newdocument restoredraft | preview ',
              },
              edit: {
                title: 'Edit',
                items: 'undo redo | cut copy paste | selectall | searchreplace',
              },
              view: {
                title: 'View',
                items:
                  'code | visualaid visualchars visualblocks | spellchecker | preview fullscreen',
              },
              insert: {
                title: 'Insert',
                items:
                  'image link media template codesample inserttable | charmap emoticons hr | pagebreak nonbreaking anchor toc | insertdatetime',
              },
              format: {
                title: 'Format',
                items:
                  'bold italic underline strikethrough superscript subscript codeformat | formats blockformats fontformats fontsizes align lineheight | forecolor backcolor | removeformat',
              },
              tools: {
                title: 'Tools',
                items: 'spellchecker spellcheckerlanguage | code wordcount',
              },
              table: {
                title: 'Table',
                items: 'inserttable | cell row column | tableprops deletetable',
              },
              help: { title: 'Help', items: 'help' },
            },
          }"
        />
      </div>
    </div>
    <div class="row ml-1 pb-1">
      <va-chip
        v-for="(param, index) in dataParameters"
        :key="index"
        :color="param.source == 'system' ? 'warning' : 'success'"
        style="font-size: x-small"
        size="small"
        class="mr-1 mb-1"
        @click="parameterClick(param)"
      >
        {{ param.name }}
      </va-chip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ContractActivity } from "@/models/ContractActivity";
import { computed, defineComponent, ref, reactive } from "vue";
import { DataParameter } from "@/models/ContractActivity";
import Editor from "@tinymce/tinymce-vue";
import LevelSelector from "./LevelSelector.vue";
import { ProtocolLevel } from "@/notifi_types";

/* global defineProps, defineEmits */
const emit = defineEmits(["activityUpdate", "activityAdd", "activityDelete"]);
const props = defineProps({
  contractActivity: { type: ContractActivity, required: false },
});

// eslint-disable-next-line vue/no-setup-props-destructure
let newAct: ContractActivity = props.contractActivity;
if (!props.contractActivity) {
  newAct = new ContractActivity();
}
const activity = ref<ContractActivity>(newAct);

const intName = ref<string>("");

const textType = ref<"plain" | "rich">("plain");

const ABIfailed = ref(false);
const ABIerrors = ref<string[]>([]);

const activeActivity = computed((): ContractActivity => {
  return activity.value;
});
const newRecord = computed((): boolean => {
  return props.contractActivity == undefined;
});
const name = computed({
  get(): string {
    return activity.value.name;
  },
  set(newVal: string): void {
    activity.value.name = newVal;
    emit("activityUpdate", activity.value);
  },
});
const description = computed({
  get(): string {
    return activity.value.description;
  },
  set(newDescription: string): void {
    activity.value.description = newDescription;
    emit("activityUpdate", activity.value);
  },
});
const topic = computed({
  get(): string {
    return activity.value.topic;
  },
  set(newTopic: string): void {
    activity.value.topic = newTopic;
    emit("activityUpdate", activity.value);
  },
});
const abi = computed({
  get(): string {
    return activity.value.ABI;
  },
  set(newABI: string): void {
    ABIfailed.value = false;
    try {
      JSON.parse(newABI);
    } catch (err: any) {
      ABIfailed.value = true;
      ABIerrors.value = ["Parse Failed-" + err.message];
      return;
    }
    ABIfailed.value = false;
    ABIerrors.value = [];
    activity.value.ABI = newABI;
    emit("activityUpdate", activity.value);
  },
});
const level = computed({
  get(): string {
    return activity.value.level;
  },
  set(newVal: string): void {
    activity.value.level = newVal as ProtocolLevel;
    if (!newRecord.value) {
      activity.value.save();
    }
  },
});
const template = computed({
  get(): string {
    return activity.value.template;
  },
  set(newVal: string): void {
    activity.value.template = newVal;
    emit("activityUpdate", activeActivity.value);
  },
});
const richTemplate = computed({
  get(): string {
    return activity.value.richTemplate;
  },
  set(newVal: string): void {
    activity.value.richTemplate = newVal;
    emit("activityUpdate", activeActivity.value);
  },
});
const dataParameters = computed((): DataParameter[] => {
  return activeActivity.value.dataParameters;
});
const addAllowed = computed((): boolean => {
  return (
    validName.value &&
    validDescription.value &&
    validTopic.value &&
    validABI.value &&
    validTemplate.value &&
    validLevel.value
  );
});
const validName = computed((): boolean => {
  return (name.value || "").length > 3;
});
const validTopic = computed((): boolean => {
  return (topic.value || "").length > 3;
});
const validLevel = computed((): boolean => {
  return level.value !== "";
});
const validABI = computed((): boolean => {
  return true;
});
const validDescription = computed((): boolean => {
  return true;
});
const validTemplate = computed((): boolean => {
  return true;
});

const add = (): void => {
  emit("activityAdd", activity.value);
  activity.value = reactive(new ContractActivity());
};

const destroy = (): void => {
  activeActivity.value.destroy();
  emit("activityDelete", activeActivity.value);
};
const parameterClick = (param: DataParameter): void => {
  console.log(`Click on ${param.name}`);
  const cur = activeActivity.value.template || "";
  template.value = `${cur}{{${param.name}}}`;
};
const setLevel = (aLevel: string): void => {
  level.value = aLevel;
};
</script>

<style scoped lang="scss">
div.editor {
  min-height: 4em;
  padding-top: 5px;
  padding-bottom: 5px;
  background-color: #f5f9fb;
  border-style: none;
  color: var(--va-input-text-color);
  font-family: inherit;
  font-size: var(--va-input-font-size);
  font-stretch: var(--va-input-font-stretch);
  font-style: var(--va-input-font-style);
  font-weight: var(--va-input-font-weight);
  letter-spacing: var(--va-input-letter-spacing);
  line-height: var(--va-input-line-height);
  outline: none;
  scrollbar-color: var(--va-input-scroll-color) transparent;
  scrollbar-width: thin;
  transform: translateY(-1px);
  width: 100%;
}

.inputtitle {
  color: rgb(44, 130, 224);
  display: block;
  font-size: var(--va-input-container-label-font-size);
  font-weight: var(--va-input-container-label-font-weight);
  height: 12px;
  left: 10;
  letter-spacing: var(
    --va-input-container-label-letter-spacing,
    var(--va-letter-spacing)
  );
  line-height: var(--va-input-container-label-line-height);
  max-width: var(--va-input-container-label-max-width);
  overflow: hidden;
  padding-top: 1px;
  position: absolute;
  text-overflow: ellipsis;
  text-transform: var(--va-input-container-label-text-transform);
  top: 0;
  //transform: translateY(-100%);
  transform-origin: top left;
  white-space: nowrap;
}
/* Basic editor styles */
.ProseMirror {
  > * + * {
    margin-top: 0.75em;
    margin-bottom: 10px;
  }

  ul,
  ol {
    padding: 0 1rem;
  }

  blockquote {
    padding-left: 1rem;
    border-left: 2px solid rgba(#0d0d0d, 0.1);
  }
}

.bubble-menu {
  display: flex;
  background-color: #0d0d0d;
  padding: 0.2rem;
  border-radius: 0.5rem;

  button {
    border: none;
    background: none;
    color: #fff;
    font-size: 0.85rem;
    font-weight: 500;
    padding: 0 0.2rem;
    opacity: 0.6;

    &:hover,
    &.is-active {
      opacity: 1;
    }
  }
}

.floating-menu {
  display: flex;
  background-color: #0d0d0d10;
  padding: 0.2rem;
  border-radius: 0.5rem;

  button {
    border: none;
    background: none;
    font-size: 0.85rem;
    font-weight: 500;
    padding: 0 0.2rem;
    opacity: 0.6;

    &:hover,
    &.is-active {
      opacity: 1;
    }
  }
}
</style>
