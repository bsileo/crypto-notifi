import { useUserStore } from '@/store/pinia_user';
import { Subscription } from "@/models/Subscription";
import { AlertDay, GroupFrequency } from "@/notifi_types";
import { userModule } from "@/store/user";
import { nextDay } from "@/Utilities";
import Moralis from "moralis";
import { UserChannel } from "./Channel";
import { NotifiUser } from './NotifiUser';

export class Group extends Moralis.Object {
  constructor() {
    super("Group");
  }

  static spawn(groupName = "My Group"): Group {
    const g = new Group();
    const userStore = useUserStore();
    g.set("name", groupName);
    g.set("User", Moralis.User.current());
    g.set("alertDay", "Monday");
    g.set("alertTime", "09:00:00 GMT-0500 (Eastern Standard Time)");
    const u = userStore.user;
    if (u) {
      g.setACL(this.getACL(u));
    }
    return g;
  }

  static async MyGroups(): Promise<Group[]> {
    const query = new Moralis.Query(Group);
    query.equalTo("User", userModule.user);
    return await query.find();
  }

  static getACL(user: NotifiUser): any {
    const acl = new Moralis.ACL();
    acl.setReadAccess(user.id, true);
    acl.setWriteAccess(user.id, true);
    acl.setRoleWriteAccess("admins", true);
    acl.setRoleReadAccess("admins", true);
    return acl;
  }

  async subscriptions(): Promise<Subscription[]> {
    const userStore = useUserStore();
    const q = new Moralis.Query("Subscription");
    if (this.id) {
      q.equalTo("Group", this);
    } else {
      q.equalTo("Group", undefined);
    }
    q.equalTo("User", userStore.user);
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
  get userChannel(): UserChannel {
    return this.get("UserChannel");
  }

  set userChannel(uc: UserChannel) {
    this.set("UserChannel", uc);
  }

  get nextSend(): Date {
    return this.get("nextSend");
  }

  public prettyNextSend(): string {
    const ns = this.nextSend;
    if (!ns) return "";
    return ns.toLocaleString();
  }
}

Moralis.Object.registerSubclass("Group", Group);
