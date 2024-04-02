const Course        =  Model('Course/Course');
const Product       = Model('Product/Product');
const OrderDetails  = Model('Order/OrderDetails');
const Announcement  = Model('UserAnnouncement');
const CourseDiscussion = Model('Course/CourseDiscussion');
const UserCourse     = Model('Course/UserCourse');
const Bookshelf     = Config('database');
const Reviews       = Model('Review/Reviews');
const Notification  = Model('Notification');
const Validator     = Helper('validator');
const wallet        = Model('Wallets/Wallets')
const moment = require('moment');

const DashboardController = {

    index:async function(req, res,next){
        
        let params                      = req.params.userId;        
        let search_by                   = _.toBoolean(req.query.search_by) ? req.query.search_by : false;
        
        if(!_.toInteger(params)){
            return res.status(400).json(res.fnError('Course Id must be integer!'));
        }
        let responseData = null;
        switch (search_by) {           
            case 'vendor':                
                responseData = await DashboardController.vendorDahboard(_.toInteger(params) ? params : false );
                break;
            case 'vendor_course':
                responseData = await DashboardController.VendorCourseDahboard(_.toInteger(params) ? params : false );
                break;            
            default:
                responseData = await DashboardController.adminDahboard();   
        }

        return res.status(200).json(res.fnSuccess(responseData));                    
    },

    adminDahboard : async function(){
        let data = {};     
        let courseCount         = await Course                                    
                                        .where('is_delete',0)
                                        .count();
        let productCount        = await Product
                                        .where('is_delete',0)
                                        .where('product_type','product')
                                        .count();
        let eventTicketCount    = await Product  
                                        .where('is_delete',0)                                       
                                        .where('product_type','event_ticket')
                                        .count(); 
        let totalSaleAmount     = await Bookshelf.knex.raw(`SELECT SUM(amount) as amount from wallets`);            
        let orderOverview       = await OrderDetails
                                        .where('created_at','LIKE',`%${moment().format('YYYY')}%`)
                                        .fetchAll();  
        let total_course_sold   = await OrderDetails             
                                        .query((qb)=>{                                              
                                               qb.leftJoin('courses','courses.id','order_details.productable_id') 
                                               qb.leftJoin('orders','orders.id','order_details.order_id')
                                               qb.where('order_details.productable_type','courses')
                                               qb.where('orders.order_status','complete')
                                        })            
                                        .count();
        let total_event_sold    = await OrderDetails             
                                        .query((qb)=>{                                                            qb.leftJoin('orders','orders.id','order_details.order_id')
                                                qb.leftJoin('product_events','product_events.product_id','order_details.productable_id')
                                                qb.where('order_details.productable_type','products')
                                                qb.where('orders.order_status','complete')
                                        })            
                                        .count();                                                         
        let courseVendorSaleAmtQuery    = `SELECT (
                                            SUM( COALESCE( CASE WHEN wallet_transactions.TYPE =  "credit"  THEN wallet_transactions.amount END , 0 ) )
                                            - SUM( COALESCE( CASE WHEN wallet_transactions.TYPE =  "debit"  THEN wallet_transactions.amount  END , 0 ) )
                                            ) AS balance
                                        FROM wallet_transactions                                         
                                        LEFT JOIN wallets ON wallets.id = wallet_transactions.wallet_id 
                                        where wallets.user_id != 1
                                        and wallet_transactions.transactionable_type = 'courses'
                                        GROUP BY wallet_transactions.wallet_id`;


        let total_vendor_course_sale_amt = await Bookshelf.knex.raw(courseVendorSaleAmtQuery);  
        
        let eventTicketVendorSaleAmtQuery  = `SELECT (
                                        SUM( COALESCE( 
                                        CASE WHEN wallet_transactions.TYPE =  "credit"
                                        THEN wallet_transactions.amount
                                        END , 0 ) ) - SUM( COALESCE( 
                                        CASE WHEN wallet_transactions.TYPE =  "debit"
                                        THEN wallet_transactions.amount
                                        END , 0 ) )
                                    ) AS balance
                                    FROM wallet_transactions
                                    LEFT JOIN wallets ON wallets.id = wallet_transactions.wallet_id
                                    LEFT JOIN product_events ON product_events.product_id = wallet_transactions.transactionable_id
                                    WHERE wallets.user_id !=1
                                    AND wallet_transactions.transactionable_type =  'products'
                                    GROUP BY wallet_transactions.wallet_id`;

        let total_event_ticket_vendor_sale_amt = await Bookshelf.knex.raw(eventTicketVendorSaleAmtQuery); 

        let adminAmtQuery  = `SELECT (
                                    SUM( COALESCE( 
                                    CASE WHEN wallet_transactions.TYPE =  "credit"
                                    THEN wallet_transactions.amount
                                    END , 0 ) ) 
                                ) AS balance
                                FROM wallet_transactions
                                LEFT JOIN wallets ON wallets.id = wallet_transactions.wallet_id
                                
                                WHERE wallets.user_id = 1                                
                                GROUP BY wallet_transactions.wallet_id`;

        let total_admin_amt = await Bookshelf.knex.raw(adminAmtQuery);                                         
        data['course_count']                 = courseCount;
        data['product_count']                = productCount;
        data['event_ticket_count']           = eventTicketCount;
        data['total_sale_amount']            = totalSaleAmount[0];
        data['order_overview']               = orderOverview;
        data['total_course_sold']            = total_course_sold;
        data['total_event_sold']             = total_event_sold;
        data['total_vendor_course_sale_amt'] = total_vendor_course_sale_amt[0];
        data['total_event_ticket_vendor_sale_amt']  = total_event_ticket_vendor_sale_amt[0];
        data['total_admin_amt']               = total_admin_amt[0];
        
        return data;
    },

    vendorDahboard : async function(vid){
        let data = {};     
       
        if(vid ){
            let courseCount         = await Course
                                        .where('is_delete',0)                                       
                                        .where('created_by',vid)
                                        .count();
            let productCount        = await Product
                                        .where('is_delete',0)                                       
                                        .where('user_id',vid)
                                        .where('product_type','product')
                                        .count();
            let eventTicketCount    = await Product
                                        .where('is_delete',0)                                           
                                        .where('user_id',vid)
                                        .where('product_type','event_ticket')
                                        .count();
            let totalSaleAmount     = await wallet                      
                                        .where('user_id',vid)
                                        .fetch();
            let orderOverview       = await OrderDetails        
                                        .where('vendor_id',vid)
                                        .where('created_at','LIKE',`%${moment().format('YYYY')}%`)
                                        .fetchAll();   
            let total_course_sold   = await OrderDetails             
                                        .query((qb)=>{                                              
                                               qb.leftJoin('courses','courses.id','order_details.productable_id') 
                                               qb.leftJoin('orders','orders.id','order_details.order_id')
                                               qb.where('order_details.productable_type','courses')
                                               qb.where('order_details.vendor_id',vid)
                                               qb.where('orders.order_status','complete')
                                        })            
                                        .count()                                                          
            let total_event_sold    = await OrderDetails             
                                        .query((qb)=>{                                                            qb.leftJoin('orders','orders.id','order_details.order_id')
                                                qb.leftJoin('product_events','product_events.product_id','order_details.productable_id')
                                                qb.where('order_details.productable_type','products')
                                                qb.where('order_details.vendor_id',vid)
                                                qb.where('orders.order_status','complete')
                                        })            
                                        .count();
            let courseSaleAmtQuery  = `SELECT (
                                            SUM( COALESCE( CASE WHEN wallet_transactions.TYPE =  "credit"  THEN wallet_transactions.amount END , 0 ) )
                                            - SUM( COALESCE( CASE WHEN wallet_transactions.TYPE =  "debit"  THEN wallet_transactions.amount  END , 0 ) )
                                            ) AS balance
                                        FROM wallet_transactions                                         
                                        LEFT JOIN wallets ON wallets.id = wallet_transactions.wallet_id 
                                        where wallets.user_id = ${vid}
                                        and wallet_transactions.transactionable_type = 'courses'
                                        GROUP BY wallet_transactions.wallet_id`;


            let total_course_sale_amt = await Bookshelf.knex.raw(courseSaleAmtQuery);

            let eventTicketSaleAmtQuery  = `SELECT (
                                        SUM( COALESCE( 
                                        CASE WHEN wallet_transactions.TYPE =  "credit"
                                        THEN wallet_transactions.amount
                                        END , 0 ) ) - SUM( COALESCE( 
                                        CASE WHEN wallet_transactions.TYPE =  "debit"
                                        THEN wallet_transactions.amount
                                        END , 0 ) )
                                    ) AS balance
                                    FROM wallet_transactions
                                    LEFT JOIN wallets ON wallets.id = wallet_transactions.wallet_id
                                    LEFT JOIN product_events ON product_events.product_id = wallet_transactions.transactionable_id
                                    WHERE wallets.user_id =${vid}
                                    AND wallet_transactions.transactionable_type =  'products'
                                    GROUP BY wallet_transactions.wallet_id`;

            let total_event_ticket_sale_amt = await Bookshelf.knex.raw(eventTicketSaleAmtQuery);


            let topSellingCourses = await OrderDetails
                                    .orderBy('-id')     
                                    .query((qb)=>{
                                        qb.where('vendor_id',vid)
                                        qb.where('productable_type','courses')                           
                                        qb.groupBy('productable_id')
                                    })            
                                    .limit(10)
                                    .fetchAll({withRelated:['product_details']});

            let topSellingEvents = await OrderDetails
                                    .orderBy('-id')     
                                    .query((qb)=>{
                                        qb.where('vendor_id',vid)
                                        qb.where('productable_type','products')                           
                                        qb.groupBy('productable_id')
                                    })            
                                    .limit(10)
                                    .fetchAll({withRelated:['product_details']}); 
                                    

            data['course_count']                 = courseCount;
            data['product_count']                = productCount;
            data['event_ticket_count']           = eventTicketCount;
            data['total_sale_amount']            = totalSaleAmount;
            data['order_overview']               = orderOverview;
            data['total_course_sold']            = total_course_sold;
            data['total_event_sold']             = total_event_sold;
            data['total_course_sale_amt']        = total_course_sale_amt[0];
            data['total_event_ticket_sale_amt']  = total_event_ticket_sale_amt[0];
            data['top_sellings_courses']         = topSellingCourses;
            data['top_sellings_events']          = topSellingEvents;

            return data;
        }
    },

    VendorCourseDahboard : async function(cid){
        let data = {};    
        
        if(cid){
            let total_enrolled      = await UserCourse
                                        .where('course_id',cid)
                                        .where('status','enrolled')
                                        .count();
            let order_count         = await Bookshelf
                                        .knex.from('order_details')
                                        .count('id as count')
                                        .where('productable_id',cid)
                                        .where('productable_type','courses');   
            let total_qa            = await CourseDiscussion
                                        .where('course_id',cid)
                                        .count();   
            let total_review        = await Reviews
                                        .where('reviewable_type','courses')
                                        .where('reviewable_id',cid)  
                                        .count();
            let order_list          = await OrderDetails                                                
                                        .where('productable_id',cid)
                                        .where('productable_type','courses')
                                        .fetchAll({'withRelated':['order','order.user','order.user.profile']});   
            let enroll_student      = await UserCourse                                                
                                        .where('course_id',cid)                                             
                                        .fetchAll({'withRelated':['user','user.profile']});
            let total_qa_list       = await CourseDiscussion
                                        .where('course_id',cid)   
                                        .limit(5)                                     
                                        .fetchAll({'withRelated':['user','user.profile']})
                                                                                               
            
            data['total_enrolled']      = total_enrolled;
            data['order_count']         = order_count;
            data['total_qa']            = total_qa;  
            data['total_review']        = total_review;
            data['order_list']          = order_list;
            data['enroll_student']      = enroll_student;
            data['total_qa_list']       = total_qa_list;
            
            return data;
        }       
    },
    
    store:function(req,res,next){

    },

    show:function(req, res,next){

    },

    update:function(req, res,next){ 
        
    },

    destroy:function(req,res,next){
        
    },
}

module.exports = DashboardController;