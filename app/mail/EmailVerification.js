const Mail = Helper('mail');

module.exports = function(user,role,email_link){      
    if(role === "customer") {
            const mailOptions = {
                to:user.get('user_name'), 
                subject: 'Account Activation',
                template:{ 
                    path : 'customer-verification', 
                    data : { 
                        token_link : _.replace(email_link,':token',user.get('token')),
                        uname : user.get('user_name').split('@')[0]
                    }
                }
            };
            return Mail(mailOptions);
    }
    if(role === "vendor") {
        const mailOptions = {
            to:user.get('user_name'), 
            subject: 'Account Activation',
            template:{ 
                path : 'vendor-verification', 
                data : { 
                    token_link : _.replace(email_link,':token',user.get('token')),
                    uname : user.get('user_name').split('@')[0]
                }
            }
        };
        return Mail(mailOptions);   
    }
    if(role === "reseller") {
        const mailOptions = {
            to:user.get('user_name'), 
            subject: 'Account Activation',
            template:{ 
                path : 'reseller-verification', 
                data : { 
                    token_link : _.replace(email_link,':token',user.get('token')),
                    uname : user.get('user_name').split('@')[0]
                }
            }
        };
        return Mail(mailOptions);   
    }

} 