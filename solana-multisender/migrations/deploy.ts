const anchor = require("@coral-xyz/anchor");

module.exports = async function deploy(provider) {
  anchor.setProvider(provider);

  // Add deployment setup here if needed (PDA initialization, configs, etc.)
  console.log("Multisender program deployment completed.");
};
