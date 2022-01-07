/* eslint-disable no-undef */
Moralis.Cloud.afterSave("AvaxTransactions", async (request) => {
  const logger = Moralis.Cloud.getLogger();
  logger.info("Avax Transaction");
  const confirmed = request.object.get("confirmed");
  if (confirmed) {
    // Check for subscriptions on this TX
    processWalletSubscriptions(request.object);
  } else {
    // handle unconfirmed case
  }
});
