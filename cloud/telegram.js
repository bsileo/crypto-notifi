/* eslint-disable no-undef */
Moralis.Cloud.define(
  "telegramMonitor",
  async (request) => {
    const user = request.user;
    const tag = request.params.userTag;
    const q = new Moralis.Query("TelegramUser");
    q.equalTo("user", user);
    let tu = await q.first({ useMasterKey: true });
    //logger.info("TU=" + tu);
    if (!tu) {
      const telegram = Moralis.Object.extend("TelegramUser");
      tu = new telegram();
      tu.set("user", user);
    }
    tu.set("userTag", tag);
    await tu.save();
    const res = await telegramPoll();
    if (res.result == true) {
      await tu.fetch();
      const uid = tu.get("telegramUsername");
      const chatID = tu.get("chatID");
      return { success: true, userid: uid, chatID: chatID };
    }
    return result;
  },
  {
    fields: {
      userTag: {
        required: true,
        type: String,
        error: "A UserTag must be provided.",
      },
    },
    requireUser: true,
  }
);

async function telegramPoll() {
  const TELEGRAM_KEY = await getAPIKey("TELEGRAM_BOT");
  const offset = await getTelegramOffset();
  logger.info(`GetUpdates from ${offset}`);
  const resp = await Moralis.Cloud.httpRequest({
    method: "GET",
    url: `https://api.telegram.org/${TELEGRAM_KEY}/getUpdates`,
    params: {
      offset: offset,
    },
  });
  if (resp.status == 200) {
    logger.info(resp.text);
    const response = JSON.parse(resp.text);
    const result = await processTelegramUpdates(response.result);
    return { result: result, status: resp.status, body: resp.text };
  } else {
    logger.error("Telegram error " + resp.status);
    return { result: "error", status: resp.status, body: resp.text };
  }
}

async function processTelegramUpdates(updates) {
  logger.info("Process Updates:" + updates.length);
  let updateID = null;
  for (let i = 0; i < updates.length; i++) {
    const uname = updates[i].message.from.username;
    const text = updates[i].message.text;
    updateID = updates[i].update_id;
    logger.info(`${uname} sent: ${text} on ${updateID}`);
    const info = text.match(/Notifi-([A-z1-9]{8})/);
    if (info && info.length == 2) {
      const tag = info[1];
      processTelegramConnect(tag, updates[i]);
    }
  }
  if (updateID) setTelegramOffset(updateID);
  return true;
}

async function getTelegramOffset() {
  const q = new Moralis.Query("TelegramUser");
  q.equalTo("userTag", "TelegramBot");
  const tu = await q.first({ useMasterkey: true });
  if (tu) return tu.get("chatID");
  return 0;
}

async function setTelegramOffset(offset) {
  logger.info(`Set new Offet: ${offset}`);
  const q = new Moralis.Query("TelegramUser");
  q.equalTo("userTag", "TelegramBot");
  let tu = await q.first({ useMasterkey: true });
  if (!tu) {
    tel = Moralis.object.extend("TelegramUser");
    tu = new tel();
    tu.set("userTag", "TelegramBot");
  }
  tu.set("chatID", offset + 1);
  await tu.save(null, { useMasterKey: true });
}

async function processTelegramConnect(tag, update) {
  const q = new Moralis.Query("TelegramUser");
  q.equalTo("userTag", tag);
  const tu = await q.first({ useMasterkey: true });
  logger.info(`Setting ${tu.id} for ${tag}`);
  if (tu) {
    tu.set("chatID", update.message.chat.id);
    tu.set("telegramUsername", update.message.from.username);
    tu.save(null, { useMasterKey: true });
  } else {
    logger.error(`Failed to locate Telegram Tag ${tag}`);
  }
}

/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-unused-vars */
async function sendTelegramAlert(channel, content) {
  const logger = Moralis.Cloud.getLogger();
  const chatID = channel.get("providerData").chatID;
  logger.info(
    `Telegram send ${content.plain} to ${channel.get("providerData").chatID}`
  );
  const TELEGRAM_KEY = await getAPIKey("TELEGRAM_BOT");
  logger.info(`[SendTelegramAlert] Content="${content.plain}"`);
  const url = `https://api.telegram.org/${TELEGRAM_KEY}/sendMessage?chat_id=${chatID}&text=${content.plain}`;
  logger.info(`[SendTelegramAlert] ${url}`);
  try {
    const httpResp = await Moralis.Cloud.httpRequest({
      method: "GET",
      url: url,
      headers: {
        "Content-Type": "application/json;charset=utf-8",
      },
    });
    const result = { status: true, result: httpResp.text };
    return result;
  } catch (httpResp) {
    logger.error("Caught failed Telegram");
    const msg =
      "[SendTelegramAlert] Request failed with response code " +
      httpResp.status +
      "::" +
      httpResp.text;
    logger.error(msg);
    const result = { status: false, error: msg, result: httpResp.text };
    return result;
  }
}
