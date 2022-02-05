/* eslint-disable no-undef */
// eslint-disable-next-line no-undef
Moralis.Cloud.beforeSave(
  "UserChannel",
  async (request) => {
    return true;
  }
  /* {
    fields: {
      userID: {
        required: true,
        error: "You must provide a UserID",
      },
      providerID: {
        required: true,
        error: "A ProviderID is requried",
      },
      name: {
        required: true,
        error: "A UserChannel Name is requried",
      },
    },
  }*/
);

Moralis.Cloud.afterSave("UserChannel", async (request) => {
  const { object: uc, context } = request;
  logger.info("[userChannel.afterSave] " + uc.id);
  //logger.info("[userChannel.afterSave] Status=" + uc.get("status"));
  //logger.info("[userChannel.afterSave] Action=" + context.action);
  if (
    uc.get("status") == "Pending Verification" &&
    context.action == "insert"
  ) {
    processVerification(uc);
  }
});

function processVerification(uc) {
  const pid = uc.get("providerID");
  logger.info("[processVerification] " + uc.id);
  if (pid == "twilio") {
    processSMSVerification(uc);
  } else if (pid == "email") {
    processEmailVerification(uc);
  }
}

function processSMSVerification(uc) {
  content = {
    plain:
      "Welcome to Notifi. Reply YES to verify / opt-in. Standard Message Rates Apply. STOP to end.",
  };
  sendTwilioAlert(uc, content);
  uc.set("status", "Verification Sent");
  uc.save(null, { useMasterKey: true });
}

Moralis.Cloud.define("emailVerified", async (request) => {
  const val = request.user.get("emailVerified");
  return val;
});

function processEmailVerification(uc) {
  const pd = uc.get("providerData");
  if (pd.setDefault) {
    // special case - use system email and verification
    const u = uc.get("User");
    logger.info("processEV " + u);
    u.set("email", pd.email);
    u.save(null, { useMasterKey: true });
    uc.set("status", "Pending Verification");
    uc.set("verificationCode", "system");
    uc.save(null, { useMasterKey: true });
  } else {
    const code = getRandomCode();
    const serverURL =
      "https://dfnrl9oy6cjp.usemoralis.com:2053/server/functions";
    const appID = "_ApplicationId=vNzZEcsSUFcPhfxYFqNbfMXVyfp2cNSX8tha5TwW";
    const link = `${serverURL}/confirmEmail?code=${code}&${appID}`;
    const content = {
      plain:
        "Welcome to Notifi. Click this link to Confirm your email address. If you did not request this message you can safely ignore it.",
      rich: `Welcome to Notifi!<br/> Click the link below to confirm your email address.<br/><a href='${link}'>Confirm my Email</a> <br/>If you did not request this message you can safely ignore it.`,
    };
    sendEmailAlert(uc, content);
    uc.set("status", "Verification Sent");
    uc.set("verificationCode", code);
    uc.save(null, { useMasterKey: true });
  }
}

Moralis.Cloud.define("confirmEmail", async (request) => {
  const code = request.params.code;
  const q = new Moralis.Query("UserChannel");
  q.equalTo("verificationCode", code);
  const uc = await q.first({ useMasterKey: true });
  logger.info("[confirmEmail]" + uc);
  if (uc) {
    uc.set("status", "Active");
    uc.save(null, { useMasterKey: true });
    return "Your email address was verified. Continue to <a href='www.cryptonotifi.xyz'>Notifi</a> to setup your Subscriptions!";
  } else {
    return "Invalid verification code.";
  }
});

function getRandomCode() {
  var chars =
    "0123456789abcdefghijklmnopqrstuvwxyz!@#$%^&*()ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  var passwordLength = 20;
  var password = "";
  for (var i = 0; i <= passwordLength; i++) {
    var randomNumber = Math.floor(Math.random() * chars.length);
    password += chars.substring(randomNumber, randomNumber + 1);
  }
  return password;
}

/* eslint-disable no-undef */
Moralis.Cloud.beforeDelete("UserChannel", async (request) => {
  const logger = Moralis.Cloud.getLogger();
  const { object: uc, context } = request;
  const subs = uc.relation("subscriptions");
  const q = subs.query();
  const count = await q.count({ useMasterKey: true });
  if (count > 0) {
    throw "Can't delete a Channel if it still has subscriptions.";
  }
});
