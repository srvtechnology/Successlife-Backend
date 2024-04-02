const moment = require('moment');
const Mail = Helper('mail');

module.exports = function(details,userType){
        
    const mailOptions = { 
        to:(userType === 'admin') ? details.user.user_name : 'support.marketplace@successlife.com',        
        subject: 'Product is Removed on SuccessLife Marketplace',
        template:{
            path : 'delete-notify-mail', //view path.
            data : {data:details , moment: moment, userType:userType}
        }         
    };  
    return Mail(mailOptions);   
}       