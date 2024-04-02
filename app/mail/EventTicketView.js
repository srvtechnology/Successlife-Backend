
const Mail = Helper('mail');
const moment = require('moment');

module.exports = function(details,eventDetail,product,paymentCategory,country,state,city){   
  
   
    const mailOptions = {
        to:details.email,
        subject: `Your ticket for ${eventDetail.product.title}`,
        template:{
            path : 'event-ticket', //view path.
            data : {data:details,moment:moment,eventDetail:eventDetail,product:product,paymentCategory:paymentCategory,country:country,state:state,city:city}
        }
    };

    return Mail(mailOptions);
}   