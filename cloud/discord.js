/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-unused-vars */
function sendDiscordAlert(channel, content) {
  const logger = Moralis.Cloud.getLogger();
  logger.info(`Discord send ${content.rich} to ${channel}`);
}
