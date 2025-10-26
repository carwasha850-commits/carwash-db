const checkoutNodeJssdk = require('@paypal/checkout-server-sdk');

/**
 * PayPal HTTP client for making requests
 */
function environment() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const mode = process.env.PAYPAL_MODE || 'sandbox';

  if (!clientId || !clientSecret) {
    throw new Error('PayPal credentials not configured');
  }

  if (mode === 'sandbox') {
    return new checkoutNodeJssdk.core.SandboxEnvironment(clientId, clientSecret);
  } else {
    return new checkoutNodeJssdk.core.LiveEnvironment(clientId, clientSecret);
  }
}

/**
 * Returns PayPal HTTP client instance with environment credentials
 */
function client() {
  return new checkoutNodeJssdk.core.PayPalHttpClient(environment());
}

module.exports = { client };
