
const OrderAddress  = Model('Order/OrderAddress');
const Validator   = Helper('validator'); 

const OrderAddressController = {

    index:function(req, res,next){

        let relationShip    = [];
        let has_pagination  = _.toBoolean(req.query.pagination);
        let limit           = _.toBoolean(req.query.limit) ? _.toInteger(req.query.limit)  : 10;
        let page            = _.toBoolean(req.query.page)  ? _.toInteger(req.query.page)   : 1;
        let user_id         = _.toInteger(req.query.user_id);
        let has_user        = _.toBoolean(req.query.user) ? req.query.user : false;
        let has_profile     = _.toBoolean(req.query.profile) ? req.query.profile : false; 
        let has_country     = _.toBoolean(req.query.country) ? req.query.country : false;
        let has_state       = _.toBoolean(req.query.state) ? req.query.state : false;
        let has_city        = _.toBoolean(req.query.city) ? req.query.city : false;

        let orderAddress         =  OrderAddress.forge().orderBy('-id');               

        if(user_id){
            orderAddress = orderAddress.where('user_id',user_id); 
            if(has_user){
                relationShip.push('user');
            }
            if(has_profile) {
                relationShip.push('user.profile');
            }
        }
        if(has_country){
            relationShip.push('country');
            if(has_state){
                relationShip.push('state');
            }
            if(has_city){
                relationShip.push('city');
            }
        }
        if(has_pagination)
        {
            let  relation_params   = Object.assign(
                {pageSize:limit,page:page},
                {withRelated:relationShip}
            );
            orderAddress = orderAddress.fetchPage(relation_params);
        }
        else
        {            
            orderAddress = orderAddress.fetchAll(Object.assign(
                {withRelated:relationShip}
            ));          
        }

        orderAddress.then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        })
    },

    store: async function(req,res,next){
        let formData        = req.body;
        let application     = Config('application'); 
        
        let validationRules = {

            address          :   'required|string',
            type             :   `required|in:${application.order_address_type.join(',')}`,
            postcode         :   'required|string|maxLength:10',  
            is_default       :   'boolean',     
            user_id          :   'required|integer',           
            country_id       :   'required|integer',
            state_id         :   'required|integer',
            city_id          :   'required|integer'
        };

        let validation = new Validator(formData,validationRules);
       
        let matched = await validation.check();     

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }

        let saveOrderAddress = {

            address           : formData.address,
            type              : formData.type,    
            postcode          : formData.postcode,
            is_default        : formData.is_default,  
            user_id           : formData.user_id,            
            country_id        : formData.country_id,
            state_id          : formData.state_id,
            city_id           : formData.city_id
        }

        new OrderAddress(saveOrderAddress).save()
        .then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        })
        .catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },
 
    show:function(req, res,next){

        let findFor = req.params.id;
        let findBy  = _.isDigit(findFor) ? 'id':'slug';

        OrderAddress.where(findBy,findFor).fetch({withRelated:['user','country','city','state']})
        .then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    update: async function(req, res,next){ 

        let formData                = req.body;
        let application             = Config('application'); 
        let order_address_id        = req.params.id;

        let validationRules  = {
            address          :   'required|string',
            type             :   `required|in:${application.order_address_type.join(',')}`,
            postcode         :   'required|string|maxLength:10',  
            is_default       :   'boolean',     
            user_id          :   'required|integer',           
            country_id       :   'required|integer',
            state_id         :   'required|integer',
            city_id          :   'required|integer' 
        }      

        let validation  = new Validator(formData,validationRules);
        let matched     = await validation.check();

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }

        let saveOrderAddress = {

            address           : formData.address,
            type              : formData.type,    
            postcode          : formData.postcode,
            is_default        : formData.is_default,  
            user_id           : formData.user_id,            
            country_id        : formData.country_id,
            state_id          : formData.state_id,
            city_id           : formData.city_id
        }

        OrderAddress.where('id',order_address_id).save(saveOrderAddress,{patch:true})
        .then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    destroy:function(req,res,next){

        var order_address_id  = req.params.id;
        
        OrderAddress.where('id',order_address_id).destroy({required:false})
        .then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },
}

module.exports = OrderAddressController;