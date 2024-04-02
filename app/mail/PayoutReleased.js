
const Mail = Helper('mail');
const moment = require('moment');

module.exports = function(details){
    
    const mailOptions = { 
        to:details.user.user_name,
        subject: `Payout for ${moment().subtract(1, 'month').startOf("month").format('MMMM')} ${moment().format('YYYY')}`,
        template:{
            path : 'payout-released', //view path.
            data : {details:details,payoutMonth: `${moment().subtract(1, 'month').startOf("month").format('MMMM')} ${moment().format('YYYY')}`}
        }         
    }; 
    return Mail(mailOptions);  
}      