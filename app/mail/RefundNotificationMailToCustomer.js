
const Mail = Helper('mail');

module.exports = function(details){
  
    const mailOptions = { 
        to:details.order.user.user_name,
        subject: `Course Refund`,
        template:{
            path : 'customer-refund-order-notification', //view path.
            data : {details:details}
        }         
    }; 
    return Mail(mailOptions);  
}      