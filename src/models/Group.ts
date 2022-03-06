import { Subscription } from "@/models/Subscription";
import { AlertDay, GroupFrequency } from "@/notifi_types";
import { userModule } from "@/store/user";
import Moralis from "moralis";
import { setTransitionHooks } from "vue";

export class Group extends Moralis.Object {
  constructor() {
    super("Group");
  }

  static async MyGroups(): Promise<Group[]> {
    const query = new Moralis.Query(Group);
    query.equalTo("User", userModule.user);
    return await query.find();
  }

  async subscriptions(): Promise<Subscription[]> {
    const q = new Moralis.Query("Subscription");
    if (this.id) {
      q.equalTo("Group", this);
    } else {
      q.equalTo("Group", undefined);
    }
    return q.find();
  }

  get name(): string {
    return this.get("name");
  }

  set name(name: string) {
    this.set("name", name);
  }

  get description(): string {
    return this.get("description");
  }
  set description(desc: string) {
    this.set("description", desc);
  }

  get frequency(): GroupFrequency {
    return this.get("frequency");
  }
  set frequency(freq: GroupFrequency) {
    this.set("frequency", freq);
  }

  get alertTime(): string {
    return this.get("alertTime");
  }

  set alertTime(time: string) {
    this.set("alertTime", time);
  }

  get alertDay(): AlertDay {
    return this.get("alertDay");
  }

  set alertDay(d: AlertDay) {
    this.set("alertDay", d);
  }
}

Moralis.Object.registerSubclass("Group", Group);
