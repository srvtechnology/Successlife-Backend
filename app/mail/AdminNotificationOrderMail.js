
const Mail = Helper('mail');
var moment = require('moment');

module.exports = function(details){

    const mailOptions = {  
        to:'support.marketplace@successlife.com',         
        subject: `Product is purchased on SuccessLife Marketplace`,
        template:{
            path : 'admin-notification-order-mail', //view path.
            data : {details:details,  moment: moment}
        }         
    };   
    return Mail(mailOptions);   
}        