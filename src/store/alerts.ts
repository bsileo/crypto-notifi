import {
  Module,
  VuexModule,
  Mutation,
  getModule,
  Action,
} from "vuex-module-decorators";
import { store } from ".";

import { Alert } from "@/models/Alert";
import Moralis from "@/config/moralis";

@Module({ dynamic: true, store: store, namespaced: true, name: "Alerts" })
export class AlertsModule extends VuexModule {
  ALERTS: Array<Alert> = [];

  get sentAlerts(): Array<Alert> {
    return this.ALERTS;
  }

  @Mutation
  public ADD_ALERT(alert: Alert): void {
    this.ALERTS.push(alert);
  }

  @Mutation
  public SetAlerts(alerts: Alert[]): void {
    this.ALERTS = alerts;
  }

  @Action
  public AddAlert(alert: Alert): void {
    this.context.commit("ADD_ALERT", alert);
  }
}

export const alertsModule = getModule(AlertsModule);

const setupAlertsSub = async () => {
  const query = new Moralis.Query(Alert);
  const subscription = await query.subscribe();
  const refresh = (): void => {
    query.find().then((results: Array<Alert>) => {
      console.log("Initial objects created");
      alertsModule.SetAlerts(results);
    });
  };
  subscription.on("open", () => {
    query.find().then((results: Array<Alert>) => {
      alertsModule.SetAlerts(results);
    });
  });
  subscription.on("create", (object: Alert) => {
    //console.log("object created");
    alertsModule.AddAlert(object);
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  subscription.on("update", (object: Alert) => {
    // console.log("object updated");
    refresh();
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  subscription.on("enter", (object: Alert) => {
    // console.log("object entered");
    refresh();
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  subscription.on("leave", (object: Alert) => {
    // console.log("object left");
    refresh();
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  subscription.on("delete", (object: Alert) => {
    // console.log("object deleted");
    refresh();
  });
  subscription.on("close", () => {
    console.log("subscription closed");
  });
};
setupAlertsSub();
