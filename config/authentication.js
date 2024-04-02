const permissions = {
    
    permissions_map :[
        {access:'c',name:'create'},
        {access:'r',name:'read'},
        {access:'u',name:'update'},
        {access:'d',name:'delete'}
    ],
        
    role_structure : ['superadmin','admin','customer','vendor','reseller'],

    single_user : 'admin',

    common_permission_structure : [
        {module:'user',     access:['c','r','u','d'], ticket:false},
        {module:'category', access:['c','r','u','d'], ticket:false},
    ],

    unique_permission_structure : [
        
    ]
};


module.exports = permissions;