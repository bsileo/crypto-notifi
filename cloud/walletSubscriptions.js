/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-undef */
async function processWalletSubscriptions(transaction) {
  const logger = getLogger();
  const from = transaction.from_address;
  const to = transaction.to_address;
  logger.info(`Check for wallet subs ${to} and from=${from}`);
  const toQuery = new Moralis.Query("Subscription");
  toQuery.equalTo("toAddress", to);
  const fromQuery = new Moralis.Query("Subscription");
  fromQuery.equalTo("fromAddress", from);
  const fromSubs = await fromQuery.find({ useMasterKey: true });
  for (let i = 0; i < fromSubs.length; i++) {
    let content = `Wallet Subscription match on '${from}'`;
    processAddressHit(fromSubs[i], transaction, content);
  }
  const toSubs = await toQuery.find({ useMasterKey: true });
  for (let i = 0; i < toSubs.length; i++) {
    let content = `Wallet Subscription match on '${from}'`;
    processAddressHit(toSubs[i], transaction), content;
  }
}

function processAddressHit(subscription, transaction, content) {
  const logger = getLogger();
  logger.info(`Address Hit on TX ${transaction.id}`);
  let hit = true;
  if (subscription.get("value")) {
    logger.info(
      `Check val ${transaction.get("value")} '${subscription.get(
        "valueOperator"
      )}' ${subscription.get("value")} )`
    );
    const txVal = parseInt(transaction.get("value"));
    const subVal = parseInt(subscription.get("value"));
    switch (subscription.get("valueOperator")) {
      case ">":
        hit = hit && txVal > subVal;
        break;
      case "<":
        hit = hit && txVal < subVal;
        break;
      case "=":
        hit = hit && txVal == subVal;
        break;
    }
  }
  if (hit) {
    sendAlert(subscription, content);
  }
}
