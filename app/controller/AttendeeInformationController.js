
/*****************************************************
# Author                : RP                                 
# Created Date          : 01-07-2019
# Module                : AttendeeInformationController                     
# Object name           : AttendeeInformationController    
# Functionality         : 
# Purpose               : CURD operation                       
*****************************************************/

/*****************************************************
//=========== Include model, nodemodule and custom validation =============//
****************************************************/

const AttendeeInformation = Model('AttendeeInformation');
const Validator   = Helper('validator');

const AttendeeInformationController = {

    /* Function Name : index
    * Author : RP
    * Created Date : 05-07-2019
    * Modified Date : *
    * Purpose : Get all attendee Information
    * Params: event_id,user_id,order_id,pagination,limit,page
    * Required: 
    * Optional: All
    * Data type: 
    */

    index:function(req, res,next){
        
        let eventId = _.toInteger(req.query.event_id) ? req.query.event_id : false;
        let userId = _.toInteger(req.query.user_id) ? req.query.user_id : false;    
        let orderId = _.toInteger(req.query.order_id) ? req.query.order_id : false; 
        let has_pagination = _.toBoolean(req.query.pagination) ? true : false;
        let limit   = _.toBoolean(req.query.limit) ? _.toInteger(req.query.limit)  : 10;
        let page    = _.toBoolean(req.query.page)   ? _.toInteger(req.query.page)   : 1;


        let attendeeInfo = AttendeeInformation.orderBy('-id');
            if(eventId){
                attendeeInfo.where('event_id',eventId)    
            }
            if(userId){
                attendeeInfo.where('user_id',userId)
            }
            if(orderId){
                attendeeInfo.where('order_id',orderId)  
            }
           
            let relationShip = {"withRelated":[
                {
                    "user":function(q){
                        q.select('id','user_name')
                    },
                    "user.profile":function(q){
                        q.select('user_id','first_name','last_name','middle_name')
                    }
                },
                "attendee_details",
                "attendee_details.country",
                {
                    "events":function(q){
                        q.select('title','slug','id')
                        q.where('product_type','event_ticket')
                    }
                },
                { 
                    "payment_category":function(q){
                        q.select('id','title')
                    }
                }
            ]};

            if(has_pagination){
                let relation_params   = Object.assign({pageSize:limit,page:page},relationShip);
                attendeeInfo          = attendeeInfo.fetchPage(relation_params);
            }else{
                attendeeInfo          = attendeeInfo.fetchAll(Object.assign(relationShip));
                
            }
            attendeeInfo                      
            .then((info)=>{
                return res.status(200).json(res.fnSuccess(info));
            })
            .catch((err)=>{
                return res.status(400).json(res.fnError(err));
            })
    },

    store:async function(req,res,next){
       
    },

    show:function(req, res,next){
       
    },

    update:function(req, res,next){ 
        
    },

    destroy:function(req,res,next){
        
    },
}

module.exports = AttendeeInformationController;