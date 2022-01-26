/* eslint-disable no-undef */
// eslint-disable-next-line no-undef
Moralis.Cloud.afterSave("Subscription", async (request) => {
  const logger = Moralis.Cloud.getLogger();
  const { object: sub, context } = request;
  if (context && context.final) {
    const type = sub.get("subscriptionType");
    if (type == "Smart Contracts") {
      processSmartContractSubscription(sub);
    } else if (type == "Smart Wallet Alerts") {
      processSmartWalletSubscription(sub);
    }
  }
});

Moralis.Cloud.afterDelete("Subscription", async (request) => {
  const logger = Moralis.Cloud.getLogger();
  const { object: sub, context } = request;
  logger.info(`[subscription.afterDelete()] `);
  const type = sub.get("subscriptionType");
  if (type == "Smart Contracts") {
    processSmartContractSubscriptionDelete(sub);
  } else if (type == "Smart Wallet Alerts") {
    processSmartWalletSubscriptionDelete(sub);
  }
});

function processSmartContractSubscription(sub) {
  const logger = Moralis.Cloud.getLogger();
  logger.info(`[processSmartContractSub] `);
  setupSmartContractWatch(sub);
}

async function setupSmartContractWatch(sub) {
  const logger = Moralis.Cloud.getLogger();
  let contract = sub.get("contract");
  contract = await contract.fetch({ useMasterKey: true });
  let activity = sub.get("contractActivity");
  activity = await activity.fetch({ useMasterKey: true });
  let prot = sub.get("Protocol");
  prot = await prot.fetch({ useMasterKey: true });
  const tableName = await getTableName(prot, contract, activity);
  logger.info(`[setupSmartContractWatch] TableName= ${tableName}`);
  const watching = await checkForWatch(tableName);
  if (!watching) {
    logger.info("[setupSmartContractWatch] Not watching - build Options:");
    const abi = JSON.parse(activity.get("ABI"));
    const chainID = getChainID(activity);
    const options = {
      tableName: tableName,
      chainID: chainID,
      address: contract.get("address"),
      topic: activity.get("topic"),
      abi: abi,
      sync_historical: false,
    };
    logger.info("[setupSmartContractWatch] Options: " + options);
    Object.entries(options).forEach(([key, value]) => {
      logger.info(`${key}=${value}`);
    });
    const wceResult = await Moralis.Cloud.run("watchContractEvent", options, {
      useMasterKey: true,
    });
    logger.info(`[setupSmartContractWatch] watchContractEvent--${wceResult.success}:${wceResult.error}`);
    Moralis.Cloud.beforeConsume(tableName, (event) => {
      return event && event.confirmed;
    });
  } else {
    logger.info("[setupSmartContractWatch] Already watching:" + tableName);
  }
}

async function checkForWatch(tableName) {
  const q = new Moralis.Query("EventSync");
  q.equalTo("tableName", tableName);
  const count = await q.count({ useMasterKey: true });
  return count !== 0;
}

function getChainID(act) {
  const chain = act.get("chain");
  switch (chain) {
    case "avalanche":
      return "0xa86a";
    case "eth":
      return "0x1";
    default:
      throw "Unsupported chain in [trigger].getChainID";
  }
}

function getTableName(prot, contract, activity) {
  const logger = Moralis.Cloud.getLogger();
  logger.info(`[GetTableName]  P=${prot.id} C=${contract.id} A=${activity.id}`);
  logger.info(`[GetTableName] CN=${contract.attributes}`);
  logger.info(`[GetTableName] PN=${prot.attributes}`);

  const pname = prot.get("name").replace(/[-+()_.\s]/g, "");
  const cname = contract.get("name").replace(/[-+()_.\s]/g, "");
  const act = activity.get("name").replace(/[-+()_.\s]/g, "");
  return `${pname}${cname}${act}`;
}

function processSmartWalletSubscription(sub) {
  const logger = Moralis.Cloud.getLogger();
  logger.info(`[processSmartWalletSub] `);
}

async function processSmartContractSubscriptionDelete(sub) {
  const logger = Moralis.Cloud.getLogger();
  logger.info(`[processSmartContractSubDelete] `);
  let contract = sub.get("contract");
  contract = await contract.fetch({ useMasterKey: true });
  let activity = sub.get("contractActivity");
  activity = await activity.fetch({ useMasterKey: true });
  let prot = sub.get("Protocol");
  prot = await prot.fetch({ useMasterKey: true });
  const tableName = getTableName(prot, contract, activity);
  logger.info(`[processSmartContractSubDelete] TableName= ${tableName}`);
  let unwatchOptions = { tableName: tableName };
  const res = await Moralis.Cloud.run("unwatchContractEvent", unwatchOptions, { useMasterKey: true });
  logger.info(`[processSmartContractSubDelete] Res= ${res}`);
}

function processSmartWalletSubscriptionDelete(sub) {
  const logger = Moralis.Cloud.getLogger();
  logger.info(`[processSmartWalletSubDelete] `);
}
