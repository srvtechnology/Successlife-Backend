const convert = require('xml-js');
const soapRequest = require('easy-soap-request');
const ApplicationConfig = Config('application');

const csPayCreditCardObj = {
    '_declaration': {
        '_attributes': {
            'version': '1.0',
            'encoding': 'UTF-8'
        }
    },
    'SOAP-ENV:Envelope': {
        '_attributes': {
            'xmlns:SOAP-ENV': 'http://schemas.xmlsoap.org/soap/envelope/',
            'xmlns:ns1': 'urn:schemas-cybersource-com:transaction-data-1.120',
            'xmlns:ns2': 'http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd'
        },
        'SOAP-ENV:Header': {
            'ns2:Security': {
                '_attributes': {
                    'SOAP-ENV:mustUnderstand': '1'
                },
                'ns2:UsernameToken': {
                    'ns2:Username': {
                        '_text': getEnv('CSPAY_USERNAME')
                    },
                    'ns2:Password': {
                        '_text': getEnv('CSPAY_SECRET')
                    }
                }
            }
        },
        'SOAP-ENV:Body': {
            'ns1:requestMessage': {
                'ns1:merchantID': {
                    '_text': getEnv('CSPAY_MERCHANTID')
                },
                'ns1:merchantReferenceCode': {
                    '_text': ''
                },
                'ns1:clientLibrary': {
                    '_text': 'CyberSource PHP 1.0.0'
                },
                'ns1:clientLibraryVersion': {
                    '_text': '7.2.10-0ubuntu0.18.04.1'
                },
                'ns1:clientEnvironment': {
                    '_text': 'Linux subhajit-desktop 4.15.0-45-generic #48-Ubuntu SMP Tue Jan 29 16:28:13 UTC 2019 x86_64'
                },
                'ns1:billTo': null,
                'ns1:shipTo': null,
                'ns1:item': [],
                'ns1:purchaseTotals': {
                    'ns1:currency': {
                        '_text': 'USD'
                    },
                    'ns1:grandTotalAmount': {
                        '_text': ''
                    }
                },
                // 'ns1:card': {
                //     'ns1:accountNumber': {
                //         '_text': '4111111111111111'
                //     },
                //     'ns1:expirationMonth': {
                //         '_text': '12'
                //     },
                //     'ns1:expirationYear': {
                //         '_text': '2020'
                //     }
                // },
                'ns1:card': null,
                'ns1:ccAuthService': {
                    '_attributes': {
                        'run': 'true'
                    }
                }
            }
        }
    }
}

const cyberSoursePayment = {
    csPayCreditCardObj,

    setMerchantReferenceCode: function() {
        const obj = this.csPayCreditCardObj;
        const str = (new Date()).getTime();
        obj['SOAP-ENV:Envelope']['SOAP-ENV:Body']['ns1:requestMessage']['ns1:merchantReferenceCode'] = {
            '_text': str
        };
    },

    setCard: function(card) {
        const obj = this.csPayCreditCardObj;
        obj['SOAP-ENV:Envelope']['SOAP-ENV:Body']['ns1:requestMessage']['ns1:card'] = {
            "ns1:accountNumber": {
                "_text": card.card_no || ''
            },
            "ns1:expirationMonth": {
                "_text": card.exp_mo || ''
            },
            "ns1:expirationYear": {
                "_text": card.exp_yr || ''
            },
            "ns1:cvNumber": {
                "_text": card.cvn || ''
            }
        };
        return this;
    },

    setGrandTotal: function(total) {
        const obj = this.csPayCreditCardObj;
        obj['SOAP-ENV:Envelope']['SOAP-ENV:Body']['ns1:requestMessage']['ns1:purchaseTotals']['ns1:grandTotalAmount'] = {
            "_text": total || ''
        };
        return this;
    },

    setItems: function(items) {
        // console.log(items.items);
        const obj = this.csPayCreditCardObj;
        obj['SOAP-ENV:Envelope']['SOAP-ENV:Body']['ns1:requestMessage']['ns1:item'] = items.map(function(el) {
            const elm = {
                '_attributes': {
                    'id': el.id
                },
                'ns1:unitPrice': {
                    '_text': el.price
                }
            };
            return elm;
        });
        return this;
    },

    setBillingAddress: function(address, ip) {
        const ipAddrArr = (ip) ? ip.split(':') : null;
        const ipStr = (ipAddrArr) ? ipAddrArr[ipAddrArr.length - 1] : '';

        const obj = this.csPayCreditCardObj;
        obj['SOAP-ENV:Envelope']['SOAP-ENV:Body']['ns1:requestMessage']['ns1:billTo'] = {
            'ns1:firstName': {
                '_text': address.user.first_name || ''
            },
            'ns1:lastName': {
                '_text': address.user.last_name || ''
            },
            'ns1:street1': {
                '_text': address.address || ''
            },
            'ns1:city': {
                '_text': address.city.name || ''
            },
            'ns1:state': {
                '_text': address.state.name || ''
            },
            'ns1:postalCode': {
                '_text':  address.postcode || ''
            },
            'ns1:country': {
                '_text': address.country.code || ''
            },
            'ns1:phoneNumber': {
                '_text': address.user.mobile_no || ''
            },
            'ns1:email': {
                '_text': address.user.email || ''
            },
            'ns1:ipAddress': {
                '_text': ipStr
            }
        }
        return this;
    },

    requestCCPayment : async function(){
        this.setMerchantReferenceCode();

        const payObj = this.csPayCreditCardObj;

        console.log(payObj,'==payment-object==');
        const xml = convert.js2xml(payObj, {compact: true, ignoreComment: true, spaces: 4});

       
        const url = getEnv('CSPAY_IC2URL');
        console.log(url,'===url===');
        // const url = 'https://ics2wstest.ic3.com/commerce/1.x/transactionProcessor/CyberSourceTransaction_1.26.wsdl';
        const headers = {
            'user-agent': 'sampleTest',
            'Content-Type': 'text/xml;charset=UTF-8',
            'soapAction': `runTransaction`,
        };

        const { response } = await soapRequest(url, headers, xml); // Optional timeout parameter(milliseconds)
        const { body, statusCode } = response;
        const resObj = convert.xml2js(body, {compact: true, spaces: 4});

        console.log(resObj,'==payment-rsponse==');
        console.log(statusCode,'==statusCode==');
        
        if (resObj) {
            let reason = ApplicationConfig.cs_reason_code.find((el) => (el.code === parseInt(resObj['soap:Envelope']['soap:Body']['c:replyMessage']['c:reasonCode']['_text'], 10)));

            if (parseInt(resObj['soap:Envelope']['soap:Body']['c:replyMessage']['c:reasonCode']['_text'], 10) === 100) {
                reason = {
                    ...reason,
                    sent: payObj,
                    receive: resObj
                };
                return reason;
            } else {

                // reason.sent = payObj;
                // reason.receive = resObj;

                reason = {
                    ...reason,
                    sent: payObj,
                    receive: resObj
                };
                throw reason;
            }
        } else {
            throw {
                code: 400,
                message: 'Failed to place the transaction to cyber source',
                sent: payObj,
                receive: {}
            };
        }

    },
}

module.exports = cyberSoursePayment; 


