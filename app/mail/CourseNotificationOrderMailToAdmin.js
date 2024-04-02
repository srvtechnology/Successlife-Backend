
const Mail = Helper('mail');

module.exports = function(details,emailLink){   
    
    let data = details.toJSON();
    let cslug = `${emailLink}course-details/${data.slug}`; 
   
    const mailOptions = { 
        to:'support.marketplace@successlife.com',        
        subject:`Course has been created by ${data.user.profile.full_name}`,
        template:{
            path : 'admin-course-order-notification-mail', //view path.
            data : {data:data,cslug}
        }         
    }; 
    return Mail(mailOptions);  
}       