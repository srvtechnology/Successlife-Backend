
const OrderDetails  = Model('Order/OrderDetails');
const Validator   = Helper('validator');

const OrderDetailsController = {

    index:function(req, res,next){
        
        let relationShip            = [];

        let has_pagination          = _.toBoolean(req.query.pagination);
        let limit                   = _.toBoolean(req.query.limit) ? _.toInteger(req.query.limit)  : 10;
        let page                    = _.toBoolean(req.query.page)  ? _.toInteger(req.query.page)   : 1;       
        
        let order_id                = _.toInteger(req.query.order_id);
        let fetchProduct_details    = _.toBoolean(req.query.product_detail);
        let fetchUser               = _.toBoolean(req.query.user);
        let fetchOrder              = _.toBoolean(req.query.order);
        let vendor_id               = _.toInteger(req.query.vendor_id);
        let vendor_order_id         = _.toBoolean(req.query.vendor_order_id);

        let ordersDetails           =  OrderDetails.forge().orderBy('-id');
            

        if(vendor_id){
            ordersDetails = ordersDetails
            .select('order_details.*')   
            .query(function(qb){                
                qb.where('order_details.vendor_id',vendor_id )
                qb.groupBy('order_details.order_id')
            })         
        }
        if(vendor_order_id){
            relationShip.push('order');  
        }
       
        if(order_id){
            ordersDetails = ordersDetails.where('order_id',order_id);
        }
        if(fetchUser){
            relationShip.push('user');   
        }
        if(fetchOrder){
            relationShip.push('order');   
        }
        if(fetchProduct_details){
            relationShip.push('product_details');            
        }

        if(has_pagination)
        {
            let  relation_params   = Object.assign(
                {pageSize:limit,page:page}, 
                {withRelated:relationShip}
            );
            ordersDetails = ordersDetails.fetchPage(relation_params);
        }
        else
        {            
            ordersDetails = ordersDetails.fetchAll(Object.assign(                
                {withRelated:relationShip}                
            )); 
        }

        ordersDetails.then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        })
    },

    store:async function(req,res,next){
        // let formData        = req.body;
        // // console.log(formData);

        // let application     = Config('application'); 

        // if(!_.isArray(formData)){
        //     return res.status(400).json(res.fnError('Input Data Must be in array!.'));
        // }
        // let validation = new Validator({
        //         orderDetails: formData
        //     },
        //     {
        //         'orderDetails'                           : 'required|array',
        //         'orderDetails.*.order_id'                : 'required|integer|inDatabase:orders,id',
        //         'orderDetails.*.vendor_id'               : 'required|integer|inDatabase:users,id',     
        //         'orderDetails.*.reseller_id'             : 'integer',             
        //         'orderDetails.*.couponable_id'           : 'integer', 
        //         'orderDetails.*.productable_id'          : 'required|integer',
        //         'orderDetails.*.productable_type'        : `required|in:${application.productable_type.join(',')}`,
        //         'orderDetails.*.unit_price'              : 'required|decimal',
        //         'orderDetails.*.discount_price'          : 'required|decimal|digitsBetween:0,100',
        //         'orderDetails.*.tax_price'               : 'required|decimal',
        //         'orderDetails.*.quantity'                : 'required|integer',
        //         'orderDetails.*.total_price'             : 'required|decimal',
        //         'orderDetails.*.product_currency'        : 'required|string|maxLength:5',
        //         'orderDetails.*.ordered_currency'        : 'required|string|maxLength:5',
        //         'orderDetails.*.conversion_rate'         : 'required|integer'
        //     }
        // );
       
        // let matched = await validation.check();     

        // if (!matched) {
        //     return res.status(422).json(res.fnError(validation.errors));
        // }
        // let save_order_detail = formData;
        
        
        // new OrderDetails().batchInsert(save_order_detail)  
        // .then((response)=>{
        //     return res.status(200).json(res.fnSuccess(save_order_detail));
        // })
        // .catch((errors)=>{
        //     return res.status(400).json(res.fnError(errors));
        // })

    },

    show:function(req, res,next){

        let findFor = req.params.id;
        let findBy  = _.isDigit(findFor) ? 'id':'slug';

        OrderDetails.where(findBy,findFor).fetch({withRelated:['user','order','course_coupon','order.order_payments','order.user','order.order_address','order.order_address.country','order.order_address.city','order.order_address.state']})
        .then((response)=>{
            return res.status(200).json(res.fnSuccess(response));
        }).catch((errors)=>{
            return res.status(400).json(res.fnError(errors));
        });
    },

    update: async function(req, res,next){ 
        // let formData        = req.body;
        // let application     = Config('application'); 

        // let order_detail_id = req.params.id;

        // let validationRules = {

        //     order_id                : 'required|integer',
        //     vendor_id               : 'required|integer', 
        //     course_coupon_id        : 'required|integer', 
        //     productable_id          : 'required|integer',
        //     productable_type        : `in:${application.productable_type.join(',')}`,
        //     unit_price              : 'required|decimal',
        //     discount_price          : 'required|decimal',
        //     tax_price               : 'required|decimal',
        //     quantity                : 'required|integer',
        //     total_price             : 'required|decimal',
        //     product_currency        : 'required|string|maxLength:5',
        //     ordered_currency        : 'required|string|maxLength:5',
        //     conversion_rate         : 'required|integer'           
        // };
 
        // let validation = new Validator(formData,validationRules);
       
        // let matched = await validation.check();     

        // if (!matched) {
        //     return res.status(422).json(res.fnError(validation.errors));
        // }

        // let update_order_detail = {
        //     order_id            : formData.order_id,
        //     vendor_id           : formData.vendor_id,
        //     course_coupon_id    : formData.course_coupon_id,
        //     orderable_id        : formData.orderable_id,
        //     orderable_type      : formData.orderable_type,
        //     unit_price          : formData.unit_price,
        //     discount_price      : formData.discount_price,
        //     tax_price           : formData.tax_price,
        //     quantity            : formData.quantity,
        //     total_price         : formData.total_price,
        //     product_currency    : formData.product_currency,
        //     ordered_currency    : formData.ordered_currency,
        //     conversion_rate     : formData.conversion_rate
        // }

        // OrderDetails.where('id',order_detail_id).save(update_order_detail,{patch:true})
        // .then((response)=>{
        //     return res.status(200).json(res.fnSuccess(response));
        // })
        // .catch((errors)=>{
        //     return res.status(400).json(res.fnError(errors));
        // });
        
    },

    destroy:function(req,res,next){
        // var order_details_id  = req.params.id;
        
        // OrderDetails.where('id',order_details_id).destroy({required:false})
        // .then((response)=>{
        //     return res.status(200).json(res.fnSuccess(response));
        // }).catch((errors)=>{
        //     return res.status(400).json(res.fnError(errors));
        // });
    },
}

module.exports = OrderDetailsController;