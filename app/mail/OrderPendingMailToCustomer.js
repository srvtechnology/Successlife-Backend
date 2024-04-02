
const Mail = Helper('mail');

module.exports = function(details){

var contactUsLink = `${getConfig('application').email.url}contact`;
var myOrderLink = `${getConfig('application').email.url}dashboard/transactions`;

    const mailOptions = { 
        to:details.user.user_name,
        subject: `Reminder – Order Payment pending at SuccessLife Marketplace`,
        template:{
            path : 'order-pending-mail-to-customer', //view path.
            data : {details:details,contactUsLink:contactUsLink,myOrderLink:myOrderLink}
        }         
    }; 
    return Mail(mailOptions);  
}      