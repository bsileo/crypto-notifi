/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-undef */
async function processSmartContractSubscriptions(transaction, activity) {
  const logger = Moralis.Cloud.getLogger();
  const addr = transaction.get("address");
  logger.info(`[processSmartContractSubscriptions] Check for Smart Contract subs ${addr} - ${activity}`);
  const addrQuery = new Moralis.Query("Subscription");
  addrQuery.equalTo("contractAddress", addr);
  const subs = await addrQuery.find();
  for (let i = 0; i < subs.length; i++) {
    logger.info(`[processSmartContractSubscriptions] Smart Contract sub hit ${subs[i].id}`);
    let msg = `Smart Contract Subscription match on '${subs[i].get("name")}'`;
    data = {
      address: addr,
      subscriptionName: subs[i].get("name"),
      activity: activity.get("name"),
    };
    logger.info(`[processSmartContractSubscriptions] Process hit ${data}`);
    processSmartContractHit(subs[i], transaction, activity, msg, data);
  }
}

// eslint-disable-next-line prettier/prettier
async function processSmartContractHit(subscription, transaction, activity, msg, data ) {
  const logger = Moralis.Cloud.getLogger();
  logger.info(
    `[processSmartContractHit] Contract Subscription Hit ${subscription.id} on TX ${transaction.id}`
  );
  let hit = true;
  if (subscription.contractActivity) {
    // This is an Event Subscription
    const subActivity = await subscription.contractActivity.fetch();
    hit == hit && subActivity.name == activity;
    msg = `${msg} for Event ${activity}`;
    data.event = activity;
  } else {
    // This is a Tranasaction subscription
    // So we can also have value checks
    const txVal = parseInt(transaction.get("value"));
    const subVal = parseInt(subscription.get("value"));
    switch (subscription.get("valueOperator")) {
      case ">":
        hit = hit && txVal > subVal;
        msg = `${msg} Value exceeds threshold`;
        data.value = txVal;
        break;
      case "<":
        hit = hit && txVal < subVal;
        msg = `${msg} Value is below threshold`;
        data.value = txVal;
        break;
      case "=":
        hit = hit && txVal == subVal;
        msg = `${msg} Value equals target`;
        data.value = txVal;
        break;
    }
  }
  if (hit) {
    const content = { plain: msg, rich: msg };
    sendAlert(subscription, content, data);
  }
}
