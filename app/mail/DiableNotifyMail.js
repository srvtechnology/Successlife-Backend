
const Mail = Helper('mail');
const moment = require('moment');

module.exports = function(details,userType,contactUsLink){
    
    const mailOptions = { 
        to:(userType === 'admin') ? details.user.user_name : 'support.marketplace@successlife.com',        
        subject: 'Your product is INACTIVE on SuccessLife Marketplace',
        template:{
            path : 'diable-product-notificatio-mail', //view path.
            data : {data:details , moment: moment, contactUsLink: contactUsLink}
        }         
    };  
    return Mail(mailOptions);   
}       