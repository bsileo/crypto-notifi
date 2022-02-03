/* eslint-disable no-undef */
Moralis.Cloud.beforeSave(
  "ProtocolStatus",
  async (request) => {
    //const logger = Moralis.Cloud.getLogger();
    const { object: protStatus } = request;
    if (protStatus.get("claimStarted")) {
      checkDiscordUser(protStatus.get("discordUser"));
      checkDiscordInvite(protStatus.get("discordServer"));
      checkClaimName(protStatus.get("claimName"));
    }
  },
  { fields: {} }
);

function checkDiscordUser(username) {
  if (!/@.+/.test(username)) {
    throw "Invalid Discord Username";
  }
}

function checkDiscordInvite(url) {
  const test = /https:\/\/discord\.gg\/[0-9A-z]{8}/i.test(url);
  if (!test) {
    throw "Invalid Discord Invite";
  }
}

function checkClaimName(name) {
  if (name.length < 2) {
    throw "Invalid Name for Claimee";
  }
}

Moralis.Cloud.afterSave("ProtocolStatus", async (request) => {
  const logger = Moralis.Cloud.getLogger();
  const { object: protStatus, context } = request;
  logger.info(`[ProtocolStatus.afterSave()] Check for claim status`);
  const started = protStatus.get("claimStarted");
  if (started) {
    let prot = protStatus.get("Protocol");
    await prot.fetch({ useMasterKey: true });
    if (prot.get("siteStatus") == "Pending") {
      logger.info(
        `[ProtocolStatus.afterSave()] Claim Started for Pending ${prot.id} -> In Progress`
      );
      prot.set("siteStatus", "In-Progress");
      logger.info(`Set Complete`);
      prot = await prot.save(null, { useMasterKey: true });
      logger.info(
        `[ProtocolStatus.afterSave()] Prot ${prot.id} set to In Progress`
      );
    }
  }
});
