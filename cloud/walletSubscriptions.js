/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-undef */
async function processWalletSubscriptions(transaction) {
  const logger = Moralis.Cloud.getLogger();
  const from = transaction.from_address;
  const to = transaction.to_address;
  logger.info(`Check for wallet subs ${to} and from=${from}`);
  const toQuery = new Moralis.Query("Subscription");
  toQuery.equalTo("toAddress", to);
  const fromQuery = new Moralis.Query("Subscription");
  fromQuery.equalTo("fromAddress", from);
  const fromSubs = await fromQuery.find();
  for (let i = 0; i < fromSubs.length; i++) {
    let content = `Wallet Subscription match on '${from}'`;
    processAddressHit(fromSubs[i], transaction, content);
  }
  const toSubs = await toQuery.find();
  for (let i = 0; i < toSubs.length; i++) {
    let content = `Wallet Subscription match on '${from}'`;
    processAddressHit(toSubs[i], transaction), content;
  }
}

function processAddressHit(subscription, transaction, content) {
  const logger = Moralis.Cloud.getLogger();
  logger.info(`Hit on TX ${transaction.id}`);
  let hit = true;
  if (subscription.get("value")) {
    logger.info(
      `Check val ${transaction.get("value")} '${subscription.get(
        "valueOperator"
      )}' ${subscription.get("value")} )`
    );
    if (subscription.get("valueOperator") == ">") {
      hit =
        hit &&
        parseInt(transaction.get("value")) >
          parseInt(subscription.get("value"));
    }
  }
  if (hit) {
    sendAlert(subscription, content);
  }
}
