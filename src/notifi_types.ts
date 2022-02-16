export enum CardDisplayMode {
  "narrow",
  "wide",
}

export enum DisplayMode {
  "protocols" = "Protocols",
  "positions" = "Positions",
  "subscriptions" = "Subscriptions",
  "subscribe" = "Subscribe",
}

export enum UserMode {
  "user" = "user",
  "manager" = "manager",
}


export type ValueOperator = ">" | "<" | "=";

// ZRecords
export const ValueOperatorNames: Record<ValueOperator, string> = {
  ">": "Great Than",
  "<": "Less Than",
  "=": "Equal To",
}