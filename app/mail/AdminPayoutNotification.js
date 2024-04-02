
const Mail = Helper('mail');
const moment = require('moment');

module.exports = function(){
    
    const mailOptions = { 
        to:'support.marketplace@successlife.com',  
        subject: `Payout has been successfully generated for the month of - ${moment().subtract(1, 'month').startOf("month").format('MMMM')} ${moment().format('YYYY')}`,
        template:{
            path : 'admin-payout-notification', //view path.
            data : {}
        }         
    };  
    return Mail(mailOptions);   
}      