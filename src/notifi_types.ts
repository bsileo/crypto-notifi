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

export enum AlertHistoryStatus {
  "sent" = "Sent",
  "pending" = "Pending",
  "error" = "Error",
}

export enum UserMode {
  "user" = "user",
  "manager" = "manager",
}

export type ValueOperator = ">" | "<" | "=";

export type SidebarDescriptor = {
  title: string;
  icon: string;
  to: string;
  text_color?: string;
};

export type SummaryItem = {
  name: string;
  quantity: number;
  limit: number;
};

export enum ProtocolLevel {
  "Free" = "Free",
  "Basic" = "Basic",
  "Gold" = "Gold",
}

export enum StakingLevel {
  "free" = "Free",
  "basic" = "Basic",
  "gold" = "Gold",
}

export enum SiteStatus {
  "requested" = "Requested",
  "pending" = "Pending",
  "inprogress" = "In-Progress",
  "active" = "Active",
}

export type TokenData = {
  symbol: string;
  contractAddress: string;
  chain: string;
  basicQuantity: number;
  goldQuantity: number;
};

export enum LimitType {
  "category" = "Category",
  "contracts" = "Contracts",
  "events" = "Events",
  "managers" = "Managers",
  "subscriptions" = "Subscriptions"
}


export enum UserFrequency {
  "Once a Day",
  "Once an Hour",
}
// Records
export const ValueOperatorNames: Record<ValueOperator, string> = {
  ">": "Great Than",
  "<": "Less Than",
  "=": "Equal To",
};

