
const Mail = Helper('mail');

module.exports = function(details){
  
    const mailOptions = { 
        to:details.order.order_details[0].user.user_name, 
        subject: `Course Refund`,
        template:{
            path : 'vendor-refund-order-notification', //view path.
            data : {details:details}
        }         
    }; 
    return Mail(mailOptions);  
}      