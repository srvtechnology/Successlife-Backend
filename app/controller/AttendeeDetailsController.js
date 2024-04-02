
/*****************************************************
# Author                : RP
# Created Date          : 02-07-2019
# Module                : AttendeeDetailsController
# Object name           : AttendeeDetailsController
# Functionality         :
# Purpose               : CURD operation
*****************************************************/

/*****************************************************
//=========== Include model, nodemodule and custom validation =============//
****************************************************/

const AttendeeDetail = Model('AttendeeDetail');
const AttendeeInformation = Model('AttendeeInformation')
const Validator   = Helper('validator');

const AttendeeDetailsController = {

    index:function(req, res,next){

    },

    /* Function Name : store
    * Author : Rituraj Paul
    * Created Date : 06-07-2019
    * Modified Date : *
    * Purpose : Store Attendee Details
    * Params: first_name,last_name,email,country_id,phone_number,phone_code,is_admin
    * Required: All
    * Optional:
    * Data type:
    */

    store:async function(req,res,next){
        let formData = req.body;
        let attendeeData = [];

        if(formData.ticket_quantity != formData.items.length ){
            return res.status(400).json(res.fnError(`Ticket quantity and attendee count didn't match`));
        }

        if(!_.isArray(formData.items)){
            return res.status(400).json(res.fnError('Input Data Must be in array!.'));
        }
        let  getAttendeeInfoCount = await AttendeeInformation
                                .where('event_id',formData.event_id)
                                .where('user_id',formData.user_id)
                                .where('order_id',formData.order_id)
                                .where('ticket_sent_date','>=',formData.ticket_sent_date)
                                .count()
        if( getAttendeeInfoCount  === 0){
            return res.status(400).json(res.fnError('Attendee fillup time expired.'));
        }
        if(formData.is_admin == false){
            let  getAttendeeFillupInfoCount = await AttendeeInformation
                .where('event_id',formData.event_id)
                .where('user_id',formData.user_id)
                .where('order_id',formData.order_id)
                .where('attendee',1)
                .count()
                if( getAttendeeFillupInfoCount  === 1){
                     return res.status(400).json(res.fnError('You had already fillup your attendee details for this event.'));
                }
            }


        // let checkEvntDataExpire = await AttendeeInformation
        //                                 .where('event_id',formData.event_id)
        //                                 .where('user_id',formData.user_id)
        //                                 .where('order_id',formData.order_id)
        //                                 .where('ticket_sent_date',formData.ticket_sent_date)
        //                                 .count();
        // if(await checkEvntDataExpire === 0){
        //     return res.status(400).json(res.fnError('Attendee Information Date is expire.'));

        // }

        let validation = new Validator({
            attendee_id :  'required|integer',
            attendeeDetails          :    formData.items,
            },
            {
                'attendeeDetails'                        : 'required|array',
                'attendeeDetails.*.first_name'           : 'required',
                'attendeeDetails.*.last_name'            : 'required',
                'attendeeDetails.*.email'                : 'required|isEmail',
                'attendeeDetails.*.country_id'           : 'required|integer|inDatabase:countries,id',
                'attendeeDetails.*.phone_number'         : 'required|integer',
                'attendeeDetails.*.phone_code'           : 'required|integer'
            }
        );
        let matched = await validation.check();

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }

        if(await checkDuplicateInObject('email',formData.items)){
            return res.status(422).json(res.fnError('There must be a unique email address for every person who receive a ticket.'));
        }
        _.map(formData.items, function (v) {

            attendeeData.push({
                id:escape(v.id).trim(),
                country_id: escape(v.country_id).trim(),
                first_name : escape(v.first_name.trim()),
                last_name : escape(v.last_name).trim(),
                email : escape(v.email).trim(),
                phone_number:escape(v.phone_number).trim(),
                phone_code: escape(v.phone_code).trim(),
                country_id: escape(v.country_id).trim()
            })
        });

        new AttendeeDetail()
            .createOrUpdate(attendeeData, ['first_name', 'last_name', 'email','phone_code','phone_number','country_id'])
            .then((responseAttendeIfnfo) => {
                AttendeeInformation.where('id',formData.attendee_id).save({"attendee":1},{patch:true})
                return res.status(200).json(res.fnSuccess(responseAttendeIfnfo));
            })
            .catch((err) => {
                return res.status(400).json(res.fnError(err));
            })
    },

    show:function(req, res,next){

    },

    update:function(req, res,next){

    },

    destroy:function(req,res,next){

    },
}

module.exports = AttendeeDetailsController;