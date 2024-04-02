
const Mail = Helper('mail');
const moment = require('moment');

module.exports = function(details,userObj,productDetails,qty,eventConfirmationMailView){   
  
    const mailOptions = {
        to:userObj.user.user_name,
        subject: `Event Confirmation` ,
        template:{
            path : 'event-confirmation-confirmation', //view path.
            data : {details:details,userObj:userObj,moment:moment,productDetails:productDetails,qty:qty,token:eventConfirmationMailView,webUrl:process.env.WEB_URL}
        }
    };

    return Mail(mailOptions);
}   