
const Mail = Helper('mail');
const moment = require('moment');

module.exports = function(details,attachments){

    const mailOptions = { 
        to:details.user.user_name, 
        subject: `Thank you for your purchase on SuccessLife`,
        template:{
            path : 'order-confiramtion', //view path.
            data : {details:details, moment: moment}            
        },
        attachments: [{
            filename: `invoice-${moment().format('YYYYMMDDHHmmSS')}.pdf`,
            path: attachments
        }]     
    };   
    return Mail(mailOptions);  
}           