
const Mail = Helper('mail');

module.exports = function(details){
    
    const mailOptions = { 
        to:details.user_name, 
        subject: `Changed Password`,
        template:{
            path : 'change-password', //view path.
            data : {uname:(details.profile.full_name === undefined) ? details.user_name.split('@')[0] : details.profile.full_name}
        }         
    };  
    return Mail(mailOptions);   
}       