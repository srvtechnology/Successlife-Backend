const bookshelf   = Config('database');
const jwt         = require('jsonwebtoken');

module.exports    = bookshelf.model('User',{

    hasTimestamps : true,

    tableName : 'users',

    hidden : ['password','ratings'],

    virtuals: {
        email: function() {
            return this.get('user_name');
        },
        avg_rating : function(){
            let ratings = this.related('ratings');
            if(ratings){
                return _.meanBy(ratings.toJSON(),'rating') || 0;
            }
        }
    },

    providers : function(){
        return this.hasMany(Model('ProviderAccount'));
    },

    profile: function(){
        return this.hasOne(Model('Profile'),'user_id');
    },

    roles : function(){
        return this.belongsToMany(Model('Role'),'role_user');
    },

    courses : function(){
        return this.hasMany(Model('Course/Course'),'created_by');
    },
    products : function(){
        return this.hasMany(Model('Product/Product'),'user_id');
    },
    events : function(){
        return this.hasMany(Model('Product/Product'),'user_id');
    },
    reviews : function(){
        return this.hasMany(Model('Review/Reviews'));
    },
    ratings : function(){
        return this.hasMany(Model('Course/Course'),'created_by');
    },

    user_announcements : function(){
        return this.hasMany( Model('UserAnnouncement'));
    },

    getPermissions : function(user_id){
        return bookshelf.knex('role_user').select('permissions.name').where('user_id',user_id)
            .innerJoin('permission_role',function(){
                this.on('permission_role.role_id','=','role_user.role_id');
            })
            .innerJoin('permissions',function(){
                this.on('permissions.id','=','permission_role.permission_id');
            });
    },

    getRoles: function(user_id){
        return bookshelf.knex('role_user').select('roles.name').where('user_id',user_id)
            .innerJoin('roles',function(){
                this.on('roles.id','=','role_user.role_id');
            })
    },

    getAuthorizeToken: async function(user_id){

        let expireIn = '1y';

        let token_data = {
            user        :[],
            permissions :[],
            roles       :[]
        };

        //console.log(profile);

        await this.where('id',user_id).fetch({
            withRelated:['profile', 'profile.country', 'profile.state', 'profile.city'],
            columns: [
                'id', 'user_name','avatar','mobile_no','is_kyc','in_agreement','agreement_pdf'
            ]
        }).then((user)=>{
            token_data.user = user.toJSON()
        });

        await this.getPermissions(user_id).pluck('permissions.name').then((permissions)=>{
            token_data.permissions = permissions;
        });

        await this.getRoles(user_id).pluck('roles.name').then((roles)=>{
            token_data.roles = roles
        });

        let token = 'jwt '+ jwt.sign(token_data,appKey(),{expiresIn:expireIn});

        let send_data = {
            status      :'success',
            token       :token,
            payload     :token_data,
            expires_in  :expireIn
        };
        return send_data;
    },
    order:function(){
        return this.hasMany( Model('Order/Orders'),'user_id');
    }

});