
const Orders  = Model('Order/Orders');
const OrderDetails  = Model('Order/OrderDetails');
const Validator   = Helper('validator');
const commonFunction = Helper('common');

const OrdersController = {

    index:function(req, res,next){

        let has_pagination  = _.toBoolean(req.query.pagination);
        let limit           = _.toBoolean(req.query.limit) ? _.toInteger(req.query.limit)  : 10;
        let page            = _.toBoolean(req.query.page)  ? _.toInteger(req.query.page)   : 1;       
        let user_id         = _.toInteger(req.query.user_id);  
        let vendor_id       = _.toInteger(req.query.vendor_id);         
        let fetchMyOrder    = _.toBoolean(req.query.my_order); 
        let searchString    = _.toBoolean(req.query.string) ? req.query.string : false;        
        let fetchByOrderStatus   = req.query.order_status || false;
        let fetchAdminOrder = req.query.admin_order || false;
        let fetchPaymentMethod = req.query.patment_method || false;

        let orders          =  Orders.forge().orderBy('-id'); 

        if(user_id){
            orders = orders.where('orders.user_id',user_id);
        }

        if(fetchByOrderStatus){
            orders = orders.where('orders.order_status',fetchByOrderStatus);
        }
        let userData =  {'user':function(q){
            q.select('id','user_name','phone_code','mobile_no')
        },'user.profile':function(q){
            q.select('id','user_id','first_name','middle_name','last_name')
        }};
        

        orders = orders.where('orders.is_delete',0);
       
        if(fetchMyOrder){            
            orders = orders
                .select('orders.*')
                .query((q)=>{
                    q.innerJoin('order_details','order_details.order_id','orders.id')                    
                    q.where('order_details.productable_type','products')
                    q.groupBy('orders.id')
                })
        }

        if(vendor_id){
            orders = orders
                .select('orders.*')
                .query((q)=>{
                    q.leftJoin('order_details','order_details.order_id','orders.id')
                    if(searchString){
                        q.leftJoin('users','users.id','orders.user_id')
                        q.leftJoin('profiles','profiles.user_id','users.id')
                        q.where('users.user_name','like', `%${searchString}%`)                        
                        q.orWhere('profiles.first_name','like', `%${searchString}%`) 
                        q.orWhere('profiles.middle_name','like', `%${searchString}%`)  
                        q.orWhere('profiles.last_name','like', `%${searchString}%`)                   
                    }
                    q.where('order_details.vendor_id',vendor_id)
                    q.groupBy('orders.id')
                })
        }
        if(fetchAdminOrder){
            orders = orders
            .select('orders.*')
            .query((q)=>{
                q.leftJoin('order_details','order_details.order_id','orders.id')
                if(searchString){
                    q.leftJoin('users','users.id','orders.user_id')
                    q.leftJoin('profiles','profiles.user_id','users.id')                    
                    q.where('users.user_name','like', `%${searchString}%`)                        
                    q.orWhere('profiles.first_name','like', `%${searchString}%`) 
                    q.orWhere('profiles.middle_name','like', `%${searchString}%`)  
                    q.orWhere('profiles.last_name','like', `%${searchString}%`)                   
                }                
                q.groupBy('orders.id')
            })
        }
       
        if(has_pagination)
        {
            let  relation_params   = Object.assign(
                {pageSize:limit,page:page},
                // {withRelated:[userData,'order_address','order_address.country','order_address.city','order_address.state','order_details','order_payments','order_details.pricable_details','order_details.pricable_details.payment_type','order_details.pricable_details.payment_category','order_details.pricable_details.product_details','order_details.pricable_details.product_details.event_speakers']}    
                {withRelated:[userData,'order_payments','order_details.payment_type']}                
            );
            orders = orders.fetchPage(relation_params);
        }
        else
        {            
            orders = orders.fetchAll(Object.assign(

               // {withRelated:[userData,'order_address','order_address.country','order_address.city','order_address.state','order_details','order_payments','order_details.pricable_details','order_details.pricable_details.payment_type','order_details.pricable_details.payment_category','order_details.pricable_details.product_details','order_details.pricable_details.product_details.event_speakers']}  
               {withRelated:[userData,'order_payments','order_details.payment_type']}
               
            ));             
        }

        orders.then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        })
    },

    store: async function(req,res,next){

        let formData        = req.body;        
        let application     = Config('application'); 
        let saveData  = null;
        let lastInsertOrderId = null;

        if(!_.isArray(formData.items)){
            return res.status(400).json(res.fnError('Input Data Must be in array!.'));
        }        

        let validation = new Validator({
                user_id                  :   'required|integer|inDatabase:users,id',           
                order_address_id         :   'required|integer|inDatabase:order_addresses,id',           
                total_discount_price     :   'decimal',
                total_order_price_usd    :   `required|decimal`,
                total_order_price_sxl    :   `required|decimal`,
                total_order_price        :   'required|decimal',                                       
                orderDetails             :    formData.items
      
            },
            {
                'orderDetails'                           : 'required|array',
                'orderDetails.*.payment_category_id'     : 'required|integer|inDatabase:payment_categories,id',
                'orderDetails.*.productable_id'          : 'required|integer',
                'orderDetails.*.productable_type'        : `required|in:${application.productable_type.join(',')}`,                
                'orderDetails.*.vendor_id'               : 'required|integer|inDatabase:users,id',     
                'orderDetails.*.couponable_id'           : 'integer', 
                'orderDetails.*.couponable_type'         : 'string', 
                'orderDetails.*.quantity'                : 'required|integer',
                'orderDetails.*.sub_total_usd'           : 'required|decimal',                
                'orderDetails.*.discount_usd'            : 'decimal|digitsBetween:0,100',
                'orderDetails.*.total_usd'               : 'required|decimal',
                'orderDetails.*.sub_total_sxl'           : 'required|decimal',                
                'orderDetails.*.discount_sxl'            : 'decimal|digitsBetween:0,100',
                'orderDetails.*.total_sxl'               : 'required|decimal'
            }
        );

        let matched = await validation.check();     

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }
        
        let saveOrders = {
            user_id                  :   formData.user_id,                    
            order_address_id         :   formData.order_address_id,                    
            total_discount_price     :   formData.total_discount_price,        
            total_order_price_usd    :   formData.total_order_price_usd,        
            total_order_price_sxl    :   formData.total_order_price_sxl,        
            total_order_price        :   formData.total_order_price                               
        };        
        
        new Orders(saveOrders).save()
        .then((order)=>{
            lastInsertOrderId = order.get('id');
            saveData = order;
            let orderDetails = [];

            _.map(formData.items,function(v){   
                
                orderDetails.push({
                    "user_id":formData.user_id,
                    "payment_category_id":v.payment_category_id,
                    "order_id":lastInsertOrderId,
                    "productable_id":v.productable_id,
                    "productable_type":v.productable_type,
                    "pricable_id":v.pricable_id,
                    "payment_type_id":v.payment_type_id,
                    "vendor_id":v.vendor_id,
                    "reseller_id":v.reseller_id,
                    "couponable_id":v.couponable_id,
                    "couponable_type":v.couponable_type,
                    "quantity":v.quantity,
                    "sub_total_usd":v.sub_total_usd,
                    "discount_usd":v.discount_usd,
                    "total_usd":v.total_usd,
                    "sub_total_sxl":v.sub_total_sxl,
                    "discount_sxl":v.discount_sxl,
                    "total_sxl":v.total_sxl,
                    "sxl_to_usd_rate":v.c_rate
                })
            })
           return new OrderDetails().batchInsert(orderDetails);            
        })
        .then((orderDetailsResponse)=>{            
            return res.status(200).json(res.fnSuccess(saveData));
        })
        .catch((errors)=>{
            Orders.where('id',lastInsertOrderId).destroy({required:false});
            return res.status(400).json(res.fnError(errors));
        });

    }, 

    show:function(req, res,next){ 

        let findFor = req.params.id;
        let findBy  = _.isDigit(findFor) ? 'orders.id':'orders.slug';
        let relationShip            = [];
        
        let vendor_id  = _.toInteger(req.query.vendor_id);    

        let orders = Orders.where(findBy,findFor)

        if(vendor_id){            
            let order_details = {'order_details':function(q){    
                    q.where('vendor_id',vendor_id);
                }
            }
            relationShip.push(order_details,'order_details.product_details','order_details.product_details.images');  
        }
        else
        {
            relationShip.push('order_details','order_details.product_details','order_details.product_details.images');  
        }
        
        relationShip.push('user','order_payments', 'user.profile', 'order_address','order_address.country','order_address.city','order_address.state')
            
        orders        
        .fetch({withRelated:relationShip})
        .then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
        
    },

    update: async function(req, res,next){ 
        let order_id        = req.params.id;

        Orders.where('id',order_id).save({'is_delete':1},{patch:true})
        .then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        })
        .catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    destroy:function(req,res,next){
        var order_id  = req.params.id;
        
        Orders.where('id',order_id).destroy({required:false})
        .then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },
    
}

module.exports = OrdersController;