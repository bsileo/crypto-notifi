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
        autosize
        v-model="template"
        placeholder="This is an alert for [[user]] triggered from [[contract]]"
      ></va-input>
      <div class="editor" v-if="textType == 'rich'">
        <label class="inputtitle va-input--labeled va-input__label"
          >Rich Message Template</label
        >
        <EditorContent :editor="editor" />
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

<script lang="ts">
import { ContractActivity } from "@/models/ContractActivity";
import { defineComponent, reactive } from "vue";
import { DataParameter } from "@/models/ContractActivity";
import { Editor, EditorContent, BubbleMenu, FloatingMenu } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import LevelSelector from "./LevelSelector.vue"
import { ProtocolLevel } from "@/models/Protocol";

export default defineComponent({
  name: "EditContractActivity",
  components: { EditorContent, LevelSelector },
  emits: ["activityUpdate", "activityAdd", "activityDelete"],
  props: {
    contractActivity: { type: ContractActivity, required: false },
  },
  data() {
    return {
      activity: this.contractActivity || new ContractActivity(),
      intName: undefined as undefined | string,
      textType: "plain" as "plain" | "rich",
      editor: null as null | Editor,
    };
  },
  mounted() {
    this.editor = new Editor({
      content: this.richTemplate,
      onUpdate: ({ editor }) => {
        const html = editor.getHTML();
        this.richTemplate = html;
      },
      extensions: [
        StarterKit,
        TextAlign.configure({
          types: ["heading", "paragraph"],
        }),
        Highlight,
      ],
    });
  },
  computed: {
    activeActivity(): ContractActivity {
      return this.activity;
    },
    newRecord(): boolean {
      return this.contractActivity == undefined;
    },
    name: {
      get(): string {
        return this.activity.name;
      },
      set(newVal: string): void {
        this.activity.name = newVal;
        this.$emit("activityUpdate", this.activity);
      },
    },
    description: {
      get(): string {
        return this.activity.description;
      },
      set(newDescription: string): void {
        this.activity.description = newDescription;
        this.$emit("activityUpdate", this.activity);
      },
    },
    topic: {
      get(): string {
        return this.activity.topic;
      },
      set(newTopic: string): void {
        this.activity.topic = newTopic;
        this.$emit("activityUpdate", this.activity);
      },
    },
    abi: {
      get(): string {
        return this.activity.ABI;
      },
      set(newABI: string): void {
        this.activity.ABI = newABI;
        this.$emit("activityUpdate", this.activity);
      },
    },
    level: {
      get(): string {
        return this.activity.level;
      },
      set(newVal: string): void {
        this.activity.level = newVal as ProtocolLevel;
        if (!this.newRecord) {
          this.activity.save();
        }
      },
    },
    template: {
      get(): string {
        return this.activity.template;
      },
      set(newVal: string): void {
        this.activity.template = newVal;
        this.$emit("activityUpdate", this.activeActivity);
      },
    },
    richTemplate: {
      get(): string {
        return this.activity.richTemplate;
      },
      set(newVal: string): void {
        this.activity.richTemplate = newVal;
        this.$emit("activityUpdate", this.activeActivity);
      },
    },
    dataParameters(): DataParameter[] {
      return this.activeActivity.dataParameters;
    },
    addAllowed(): boolean {
      return (
        this.validName &&
        this.validDescription &&
        this.validTopic &&
        this.validABI &&
        this.validTemplate &&
        this.validLevel
      );
    },
    validName(): boolean {
      return (this.name || "").length > 3;
    },
    validTopic(): boolean {
      return (this.topic || "").length > 3;
    },
    validLevel(): boolean {
      return this.level !== "";
    },
    validABI(): boolean {
      return true;
    },
    validDescription(): boolean {
      return true;
    },
    validTemplate(): boolean {
      return true;
    },
  },
  methods: {
    add(): void {
      this.$emit("activityAdd", this.activity);
      this.activity = reactive(new ContractActivity());
    },
    destroy(): void {
      this.activeActivity.destroy();
      this.$emit("activityDelete", this.activeActivity);
    },
    parameterClick(param: DataParameter): void {
      console.log(`Click on ${param.name}`);
      const cur = this.activeActivity.template || "";
      this.template = `${cur}{{${param.name}}}`;
    },
    setLevel(aLevel: string): void {
      console.log(aLevel);
      this.level = aLevel;
    },
  },
});
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
