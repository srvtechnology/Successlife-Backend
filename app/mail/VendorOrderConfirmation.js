
const Mail = Helper('mail');
var moment = require('moment');

module.exports = function(details){    
  
    const mailOptions = { 
        to:details.user.tutor_email, 
        subject: `Hooray – Your product is purchased on SuccessLife`,
        template:{
            path : 'vendor-order-confirmation', //view path.
            data : {details:details,  moment: moment}
        }         
    }; 
    return Mail(mailOptions);  
}      