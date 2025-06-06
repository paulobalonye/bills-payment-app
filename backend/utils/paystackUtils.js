const axios = require('axios');
const crypto = require('crypto');

// Paystack API base URL
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

/**
 * Create Axios instance for Paystack API calls
 */
const paystackAPI = axios.create({
  baseURL: PAYSTACK_BASE_URL,
  headers: {
    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    'Content-Type': 'application/json'
  }
});

/**
 * Initialize a transaction for wallet funding
 * @param {Object} data - Transaction data
 * @param {String} data.email - Customer email
 * @param {Number} data.amount - Amount in kobo (Naira * 100)
 * @param {String} data.reference - Unique transaction reference
 * @param {String} data.callback_url - URL to redirect to after payment
 * @returns {Promise<Object>} Paystack API response
 */
const initializeTransaction = async (data) => {
  try {
    const response = await paystackAPI.post('/transaction/initialize', data);
    return response.data;
  } catch (error) {
    console.error('Paystack transaction initialization error:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Verify a transaction using the reference
 * @param {String} reference - Transaction reference
 * @returns {Promise<Object>} Paystack API response
 */
const verifyTransaction = async (reference) => {
  try {
    const response = await paystackAPI.get(`/transaction/verify/${reference}`);
    return response.data;
  } catch (error) {
    console.error('Paystack transaction verification error:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Purchase airtime
 * @param {Object} data - Airtime purchase data
 * @param {String} data.phone - Phone number
 * @param {Number} data.amount - Amount in Naira
 * @param {String} data.provider - Network provider code (e.g., MTN, GLO, AIRTEL, 9MOBILE)
 * @returns {Promise<Object>} Paystack API response
 */
const purchaseAirtime = async (data) => {
  try {
    const response = await paystackAPI.post('/bills/airtime', {
      phone: data.phone,
      amount: data.amount,
      provider: data.provider
    });
    return response.data;
  } catch (error) {
    console.error('Paystack airtime purchase error:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Pay electricity bill
 * @param {Object} data - Electricity bill data
 * @param {String} data.meterNumber - Meter number
 * @param {Number} data.amount - Amount in Naira
 * @param {String} data.provider - Electricity provider code
 * @param {String} data.meterType - Meter type (prepaid or postpaid)
 * @returns {Promise<Object>} Paystack API response
 */
const payElectricityBill = async (data) => {
  try {
    const response = await paystackAPI.post('/bills/electricity', {
      meter_number: data.meterNumber,
      amount: data.amount,
      provider: data.provider,
      meter_type: data.meterType
    });
    return response.data;
  } catch (error) {
    console.error('Paystack electricity bill payment error:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Pay cable TV bill
 * @param {Object} data - Cable TV bill data
 * @param {String} data.smartcardNumber - Smartcard number
 * @param {String} data.provider - Cable TV provider code
 * @param {String} data.packageCode - Package code
 * @returns {Promise<Object>} Paystack API response
 */
const payCableBill = async (data) => {
  try {
    const response = await paystackAPI.post('/bills/cable', {
      smartcard_number: data.smartcardNumber,
      provider: data.provider,
      package_code: data.packageCode
    });
    return response.data;
  } catch (error) {
    console.error('Paystack cable bill payment error:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Verify Paystack webhook signature
 * @param {String} signature - x-paystack-signature header
 * @param {Object|String} payload - Request body (raw)
 * @returns {Boolean} Whether signature is valid
 */
const verifyWebhookSignature = (signature, payload) => {
  if (!signature || !payload) return false;
  
  const hash = crypto
    .createHmac('sha512', process.env.PAYSTACK_WEBHOOK_SECRET)
    .update(JSON.stringify(payload))
    .digest('hex');
  
  return hash === signature;
};

module.exports = {
  initializeTransaction,
  verifyTransaction,
  purchaseAirtime,
  payElectricityBill,
  payCableBill,
  verifyWebhookSignature
};
