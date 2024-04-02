
const Mail = Helper('mail');

module.exports = function(details,amount){
  
    const mailOptions = { 
        to:details.user.user_name,
        subject: `Amount has been refunded to your wallet for order no: #SLM100${details.id}`,
        template:{
            path : 'refund-mail-to-customer', //view path.
            data : {details:details,amount:amount}
        }         
    }; 
    return Mail(mailOptions);  
}      