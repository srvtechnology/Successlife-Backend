
const Mail = Helper('mail');

module.exports = function(details,errorMessage,cntctLink,myOrderLink){

    const mailOptions = { 
        to:details.user.user_name,
        subject: `Payment Failed on SuccessLife Marketplace`,
        template:{
            path : 'order-failed-mail-to-customer', //view path.
            data : {details:details,errorMessage:errorMessage,cntctLink:cntctLink,myOrderLink:myOrderLink}
        }         
    }; 
    return Mail(mailOptions);  
}      