import { UserChannel } from "@/models/Channel";
import { Group } from "@/models/Group";
import { Moralis } from "moralis";
import { defineStore } from "pinia";

// useStore could be anything like useUser, useCart
// the first argument is a unique id of the store across your application
export const useGroupsStore = defineStore("groups", {
  state: () => {
    return {
      loading: false,
      groups: [] as Group[],
      query: undefined as any,
    };
  },
  actions: {
    setGroups(groups: Group[]) {
      this.groups.length = 0;
      this.groups.push(...groups);
    },
    removeGroup(aGroup: Group) {
      const idx = this.groups.findIndex((g) => {
        g.id == aGroup.id || g._localId == aGroup._localId;
      });
      if (idx) this.groups.splice(idx, 1);
      else console.log("Group to remove not found");
    },
    async fetchGroups() {
      try {
        this.loading = true;
        const query = new Moralis.Query("Group");
        query.equalTo("User", Moralis.User.current());
        const groups: any = await query.find();
        this.setGroups(groups);
        this.query = query;
        this.subscribe();
        this.loading = false;
      } catch (err) {
        this.loading = false;
        return err;
      }
    },
    async subscribe(): Promise<void> {
      if (!this.query) return;
      const subscription = await this.query.subscribe();
      subscription.on("open", () => {
        this.query.find().then((results: Array<Group>) => {
          this.setGroups(results);
        });
      });
      subscription.on("create", (group: Group) => {
        const idx = this.groups.findIndex((g) => g.id == group.id);
        if (!idx) this.groups.push(group);
      });
      subscription.on("update", (group: Group) => {
        const idx = this.groups.findIndex((g) => g.id == group.id);
        if (idx) {
          this.groups.splice(idx, 1, group);
        }
      });
      subscription.on("enter", (group: Group) => {
        this.groups.push(group);
      });
      subscription.on("leave", (group: Group) => {
        const idx = this.groups.findIndex((g) => g.id == group.id);
        if (idx) {
          this.groups.splice(idx, 1);
        }
      });
      subscription.on("delete", (group: Group) => {
        const idx = this.groups.findIndex((g) => g.id == group.id);
        if (idx) {
          this.groups.splice(idx, 1);
        }
      });
    },
  },
});
