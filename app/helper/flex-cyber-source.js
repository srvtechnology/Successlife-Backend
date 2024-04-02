const cybersourceRestApi = require('cybersource-rest-client');
const Setting = Model('Setting');

const flexCyberSoursePayment = {

    generateKey: async function () {

        let getConfig = await Setting.where('access_key', 'cybersource_secrete_key').fetch();

        var p = new Promise(function (resolve, reject) {

            try {
                var configObj = {
                    'authenticationType': process.env.CYBERSOURCE_FLEX_AUTHENTICATION_TYPE,
                    // 'runEnvironment': 'cybersource.environment.SANDBOX',
                    'runEnvironment': 'cybersource.environment.production',

                    'merchantID': process.env.CYBERSOURCE_FLEX_MERCHENT_ID,
                    'merchantKeyId': process.env.CYBERSOURCE_FLEX_MERCHENT_KEY,
                    'merchantsecretKey': getConfig.toJSON().value,

                };

                var instance = new cybersourceRestApi.KeyGenerationApi(configObj);

                var request = new cybersourceRestApi.GeneratePublicKeyRequest();
                request.encryptionType = 'None';
                var opts = {}

                instance.generatePublicKey(request, opts, function (error, data, response) {
                    if (error) {
                        reject(Error(error));
                    }
                    else {
                        resolve(data);
                    }
                });
            }
            catch (error) {
                reject(Error(error));
            }
        });
        return p;
    },
    generateToken: async function (keyData, cardInfoDetail) {

        let getConfig = await Setting.where('access_key', 'cybersource_secrete_key').fetch();

        var p = new Promise(function (resolve, reject) {

            try {
                var keyId = '';
                var publicKey = '';
                var cardInfo = new cybersourceRestApi.Flexv1tokensCardInfo();

                cardInfo.cardNumber = cardInfoDetail.card_no,
                    cardInfo.cardExpirationMonth = cardInfoDetail.exp_mo,
                    cardInfo.cardExpirationYear = cardInfoDetail.exp_yr,
                    cardInfo.cardType = cardInfoDetail.card_type;

                var configObj = {
                    'authenticationType': process.env.CYBERSOURCE_FLEX_AUTHENTICATION_TYPE,
                    // 'runEnvironment': 'cybersource.environment.SANDBOX',
                    'runEnvironment': 'cybersource.environment.production',

                    'merchantID': process.env.CYBERSOURCE_FLEX_MERCHENT_ID,
                    'merchantKeyId': process.env.CYBERSOURCE_FLEX_MERCHENT_KEY,
                    'merchantsecretKey': getConfig.toJSON().value,

                };

                var tokenizeInstance = new cybersourceRestApi.TokenizationApi(configObj);
                var keyInstance = new cybersourceRestApi.KeyGenerationApi(configObj);

                var KeyRequest = new cybersourceRestApi.GeneratePublicKeyRequest();
                KeyRequest.encryptionType = 'None';

                var opts = {};


                keyInstance.generatePublicKey(KeyRequest, opts, function (error, data, response) {

                    if (error) {
                        reject(Error(error));
                    }

                    else if (data) {
                        keyId = keyData.keyId;
                        publicKey = keyData.der.publicKey;

                        var tokenizeRequest = new cybersourceRestApi.TokenizeRequest();
                        tokenizeRequest.keyId = keyId;
                        tokenizeRequest.cardInfo = cardInfo;

                        tokenizeInstance.tokenize(tokenizeRequest, function (error, data, response) {                            
                            if (response.status == 400) {
                                reject(response.text);
                            } else if (error) {
                                reject(Error(error));
                            }
                            else if (data) {
                                var tokenVerifier = new cybersourceRestApi.TokenVerification();
                                var result = tokenVerifier.verifyToken(publicKey, data);

                                if (result) {
                                    resolve(data);
                                }
                                else {
                                    reject(Error('Token mismatch'));
                                }
                            }
                        });
                    }
                    else {
                        reject(Error('Token mismatch'));
                    }
                })
            }
            catch (error) {
                reject(Error(error));
            }
        });
        return p;
    },
    paymentProcess: async function (cardToken, formData) {

        let getConfig = await Setting.where('access_key', 'cybersource_secrete_key').fetch();
        var p = new Promise(function (resolve, reject) {
            try {
                var configObj = {
                    'authenticationType': process.env.CYBERSOURCE_FLEX_AUTHENTICATION_TYPE,
                    // 'runEnvironment': 'cybersource.environment.SANDBOX',
                    'runEnvironment': 'cybersource.environment.production',

                    'merchantID': process.env.CYBERSOURCE_FLEX_MERCHENT_ID,
                    'merchantKeyId': process.env.CYBERSOURCE_FLEX_MERCHENT_KEY,
                    'merchantsecretKey': getConfig.toJSON().value,
                };
                var instance = new cybersourceRestApi.PaymentsApi(configObj);

                var clientReferenceInformation = new cybersourceRestApi.Ptsv2paymentsClientReferenceInformation();
                clientReferenceInformation.code = Math.random().toString(36).substring(15);

                var processingInformation = new cybersourceRestApi.Ptsv2paymentsProcessingInformation();
                processingInformation.commerceIndicator = 'internet';

                var amountDetails = new cybersourceRestApi.Ptsv2paymentsOrderInformationAmountDetails();
                amountDetails.totalAmount = formData.net_amount;
                amountDetails.currency = 'USD';

                var billTo = new cybersourceRestApi.Ptsv2paymentsOrderInformationBillTo();
                billTo.country = formData.billing_address.country.code;
                billTo.firstName = formData.billing_address.user.first_name;
                billTo.lastName = formData.billing_address.user.last_name;
                billTo.address1 = formData.billing_address.address;
                billTo.locality = formData.billing_address.state.name;
                billTo.administrativeArea = formData.billing_address.city.name;
                billTo.phoneNumber = formData.billing_address.user.mobile_no;
                billTo.postalCode = formData.billing_address.postcode;
                billTo.email = formData.billing_address.user.email;


                var paymentInformation = new cybersourceRestApi.Ptsv2paymentsPaymentInformation();
                var customer = new cybersourceRestApi.Ptsv2paymentsPaymentInformationCard();
                customer.customerId = cardToken.token;
                paymentInformation.customer = customer;


                var orderInformation = new cybersourceRestApi.Ptsv2paymentsOrderInformation();
                orderInformation.amountDetails = amountDetails;
                orderInformation.billTo = billTo;

                var request = new cybersourceRestApi.CreatePaymentRequest();
                request.clientReferenceInformation = clientReferenceInformation;
                request.processingInformation = processingInformation;
                request.orderInformation = orderInformation;
                request.paymentInformation = paymentInformation;
                request.processingInformation.capture = true;

                instance.createPayment(request, function (error, data, response) {
                    if (error) {
                        reject(Error(error));
                    }
                    else if (data) {
                        resolve(data);
                    }
                    else {
                        reject(Error('Internal Server Error.!'));
                    }

                });
            }
            catch (error) {
                reject(Error(error));
            }
        });
        return p;

    }
}

module.exports = flexCyberSoursePayment; 
