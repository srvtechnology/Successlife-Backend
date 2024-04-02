
const Mail = Helper('mail');

module.exports = function(details){
    let contactUsLink = `${getConfig('application').email.url}contact`;
    let myOrderLink = `${getConfig('application').email.url}dashboard/transactions`;
    
    const mailOptions = { 
        to:details.user.user_name,
        subject: `Failed SXL Payment on SuccessLife Marketplace`,
        template:{
            path : 'sxl-payment-failed-mail-to-customer', //view path.
            data : {details:details,contactUsLink:contactUsLink,myOrderLink:myOrderLink}
        }         
    }; 
    return Mail(mailOptions);  
}      