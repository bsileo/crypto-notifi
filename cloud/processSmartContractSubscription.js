/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-undef */
async function processSmartContractSubscriptions(transaction, activity) {
  const logger = Moralis.Cloud.getLogger();
  const addr = transaction.get("address");
  logger.info(`Check for Smart Contract subs ${addr}`);
  const addrQuery = new Moralis.Query("Subscription");
  addrQuery.equalTo("contractAddress", addr);
  const subs = await addrQuery.find();
  for (let i = 0; i < subs.length; i++) {
    logger.info(`Smart Contract sub hit ${subs[i].id}`);
    let msg = `Smart Contract Subscription match on '${subs[i].name}'`;
    data.address = addr;
    data.subscriptionName = subs[i].name;
    processSmartContractHit(subs[i], transaction, activity, msg, data);
  }
}

async function processSmartContractHit(
  subscription,
  transaction,
  activity,
  msg,
  data
) {
  const logger = Moralis.Cloud.getLogger();
  logger.info(
    `Contract Subscription Hit ${subscription.id} on TX ${transaction.id}`
  );
  let hit = true;
  if (subscription.subActivity) {
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
    sendAlert(subscription, msg, data);
  }
}
