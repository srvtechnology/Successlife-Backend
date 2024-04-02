require('./app/helper/functions');
const fs = require('fs'); 
const csv = require('csv-parser');
const results = [];
const bcrypt  = require('bcryptjs');
const User    = Model('User');
const Profile = Model('Profile');


let inputFilePath = Public('live-store-original-data.csv');

fs.createReadStream(inputFilePath)
.pipe(csv())
.on('data', function(data){
    try {       
        results.push(data)           
    }
    catch(err) {
        dd(err)        
    }
})
.on('end',function(){         
    let i=0;    
    if( results.length > 0 ){        
        _.map(results,function(v){
            i++;            
            dd(`${i} - ${v.username}`);  
            const userData= {
                user_name: v.username,
                password:bcrypt.hashSync('Successlife9102', 10),
                avatar: v.avatar,
                phone_code: v.phone_code,
                mobile_no: v.mobile_no,
                is_kyc: v.is_kyc,
                is_import_data:1,
                is_active:1
            }             
            new User().save(userData)
            .then((userResponse)=>{                                  
                userResponse.roles().attach(3);
                return userResponse.get('id')               
            })
            .then((userIds)=>{                         
                let profileData = {
                    user_id : userIds,  
                    first_name:v.firstname,
                    middle_name:v.middlename,
                    last_name:v.lastname,
                    ethereum_address:v.ethereum_address,
                    address:v.address,
                    country_id:_.isEmpty(v.city_id) ? 0 : v.country_id,
                    state_id:_.isEmpty(v.city_id) ? 0 : v.state_id,
                    city_id:_.isEmpty(v.city_id) ? 0 : v.city_id,
                    social_links:'{"links":"","twitter":"","facebook":"","linkedin":"","youtube":""}'
                }               
                return new Profile().save(profileData)                 
            })               
            .then((profileDataResponse)=>{ 
                dd('success');                    
            })
            .catch((err)=>{                  
                console.log(JSON.stringify(err))
            })                
        })    
    }  
});  
