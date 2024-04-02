const Validator = Helper('validator');
const Setting = Model('Setting');
const unirest = require('unirest');
const fs = require('fs');
const download = require('download');

const TicketController = {

    index: async function (req, res, next) { // view all ticket               
        
        let limit = _.toBoolean(req.query.limit) ? _.toInteger(req.query.limit) : 10;
        let page = _.toBoolean(req.query.page) ? _.toInteger(req.query.page) : 1;

        let freshdeskEmail = await Setting.where('access_key', 'freshdesk_email').fetch();
        let freshdeskPassword = await Setting.where('access_key', 'freshdesk_password').fetch();
        let freshdeskUrl = await Setting.where('access_key', 'freshdesk_url').fetch();       

        let user = _.toBoolean(req.query.user) ? req.query.user : false;        

        if(user){
            var Request = unirest.get(`${freshdeskUrl.get('value')}/api/v2/tickets?order_type=desc&per_page=${limit}&page=${page}&email=${user}&include=requester`);
        }
        else{
            var Request = unirest.get(`${freshdeskUrl.get('value')}/api/v2/tickets?order_type=desc&per_page=${limit}&page=${page}&include=requester`);
        }             
       
        try{
            Request
            .auth({
                user: freshdeskEmail.get('value'),
                pass: freshdeskPassword.get('value'),
                sendImmediately: true
            })
            .end(function (response) {                
                if (response.status == 200) {
                    return res.status(200).json(res.fnSuccess(response.body));                    
                }
                else {
                    return res.status(400).json(res.fnError(response.body));                    
                }
            });
        }
        catch(err){
            return res.status(400).json(res.fnError(err));
        }
    },

    createTicket: async function (req, res, next) { // create ticket with out attatchment
        let formData = req.body;
        let application = Config('application');
        let freshdeskEmail = await Setting.where('access_key', 'freshdesk_email').fetch();
        let freshdeskPassword = await Setting.where('access_key', 'freshdesk_password').fetch();
        let freshdeskUrl = await Setting.where('access_key', 'freshdesk_url').fetch();


        var validation = new Validator(formData, {
            subject: `required|in:${application.ticket_subject.join(',')}`,
            email: 'required|isEmail',
            priority: `required|in:${application.ticket_priority.join(',')}`,
            status: `required|in:${application.ticket_status.join(',')}`,
            description: 'required'
        });
        let matched = await validation.check();

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }
        else {

            if(_.isEmpty(formData.attachments)){ // without attatchment

                TicketController.createTicketWithoutAttatchment(formData,freshdeskEmail.get('value'),freshdeskPassword.get('value'),freshdeskUrl.get('value'),res);
            }
            else
            {
                // with attatchment
                TicketController.createTicketWithAttatchment(formData,freshdeskEmail.get('value'),freshdeskPassword.get('value'),freshdeskUrl.get('value'),res);
            }            
        }
    },

    createTicketWithoutAttatchment(data,freshdeskEmail,freshdeskPassword,freshdeskUrl,res){
        let subject = (data.subject === 'Others') ? data.other : data.subject;
        const fields = {
            'email': `${data.email}`,
            'subject': `${subject}`,
            'description': `${data.description}`,
            'status': parseInt(data.status),
            'priority': parseInt(data.priority)               
        }

        const Request = unirest.post(`${freshdeskUrl}/api/v2/tickets`);

        try{
            Request.auth({
                user: freshdeskEmail,
                pass: freshdeskPassword,
                sendImmediately: true
            })
            .type('json')
            .send(fields)
            .end(function (response) {  
                if (response.status == 201) {
                    return res.status(200).json(res.fnSuccess(response.body));                   
                }
                else {
                    return res.status(400).json(res.fnError(response.body));                
                }
            });
        }
        catch(err){
            return res.status(400).json(res.fnError(err));                
        }
    },

    createTicketWithAttatchment(data,freshdeskEmail,freshdeskPassword,freshdeskUrl,res){
        let subject = (data.subject === 'Others') ? data.other : data.subject;
        let fields = {
            'email': `${data.email}`,
            'subject': `${subject}`,
            'description': `${data.description}`,
            'status': parseInt(data.status),
            'priority': parseInt(data.priority)            
        }
        const Request = unirest.post(`${freshdeskUrl}/api/v2/tickets`);

        try{
            let fileName = _.last(_.split(data.attachments, '/'));
            let savePath = Public(`images/supportTicket/${fileName}`);

            download(`${data.attachments}`)
            .then(data => {
                _fs.writeFileSync(savePath, data);
                if (!_fs.existsSync(savePath)) {
                    return res.status(400).json(res.fnError('Image Error in local storage!'));    
                }
                Request.auth({
                    user: freshdeskEmail,
                    pass: freshdeskPassword,
                    sendImmediately: true
                })
                .type('multipart/form-data')
                .field(fields)
                .attach('attachments[]', fs.createReadStream(`${savePath}`))
                .end(function (response) {  
                    if (response.status == 201) {
                        _fs.unlinkSync(savePath);
                        return res.status(200).json(res.fnSuccess(response.body));                   
                    }
                    else {
                        return res.status(400).json(res.fnError(response.body));                
                    }
                });
               
            })
            .catch((err)=>{
                return res.status(400).json(res.fnError(err)); 
            })            
        }
        catch(err){
            return res.status(400).json(res.fnError(err));         
        }
    },

    show: async function (req, res, next) {
        let ticketId = req.params.ticketId;                
        let freshdeskEmail = await Setting.where('access_key', 'freshdesk_email').fetch();
        let freshdeskPassword = await Setting.where('access_key', 'freshdesk_password').fetch();
        let freshdeskUrl = await Setting.where('access_key', 'freshdesk_url').fetch();

        var Request = unirest.get(`${freshdeskUrl.get('value')}/api/v2/tickets/${ticketId}?include=conversations,requester,stats`);

        try {
            Request
            .auth({
                user: freshdeskEmail.get('value'),
                pass: freshdeskPassword.get('value'),
                sendImmediately: true
            })
            .end(function (response) {                
                if (response.status == 200) {
                    return res.status(200).json(res.fnSuccess(response.body));
                }
                else {
                    return res.status(400).json(res.fnError(response.body));
                }
            });
        }
        catch(err){
            return res.status(400).json(res.fnError(err));
        }
    },

    ticketConversations: async function(req,res,next){    
        let ticketId = req.query.ticketId; 
       
        let page = _.toBoolean(req.query.page) ? _.toInteger(req.query.page) : 2;

        let freshdeskEmail = await Setting.where('access_key', 'freshdesk_email').fetch();
        let freshdeskPassword = await Setting.where('access_key', 'freshdesk_password').fetch();
        let freshdeskUrl = await Setting.where('access_key', 'freshdesk_url').fetch();

        var Request = unirest.get(`${freshdeskUrl.get('value')}/api/v2/tickets/${ticketId}/conversations?page=${page}`);
        
        try{
            Request
            .auth({
                user: freshdeskEmail.get('value'),
                pass: freshdeskPassword.get('value'),
                sendImmediately: true
            })
            .end(function (response) {                
                if (response.status == 200) {
                    return res.status(200).json(res.fnSuccess(response.body));                    
                }
                else {
                    return res.status(400).json(res.fnError(response.body));                   
                }
            });
        }
        catch(err){
            return res.status(400).json(res.fnError(err));
        }
    },

    ticketReply: async function(req,res,next){       
        let ticketId = req.params.ticketId;        
        let formData = req.body;
        
        let freshdeskEmail      = await Setting.where('access_key', 'freshdesk_email').fetch();
        let freshdeskPassword   = await Setting.where('access_key', 'freshdesk_password').fetch();
        let freshdeskUrl        = await Setting.where('access_key', 'freshdesk_url').fetch();

        var validation = new Validator(formData, {          
            description: 'required'
        });
        let matched = await validation.check();

        if (!matched) {
            return res.status(422).json(res.fnError(validation.errors));
        }
        else{           
            if(_.isEmpty(formData.attachments)){ // without attatchment

                TicketController.replyWithoutAttatchment(formData,freshdeskEmail.get('value'),freshdeskPassword.get('value'),freshdeskUrl.get('value'),ticketId,res);
            }
            else
            {
                // with attatchemnet  
                
                TicketController.replyWithAttatchment(formData,freshdeskEmail.get('value'),freshdeskPassword.get('value'),freshdeskUrl.get('value'),ticketId,res);
            }            
        }
    },

    replyWithoutAttatchment(data,freshdeskEmail,freshdeskPassword,freshdeskUrl,ticketId,res){

        const fields = {
            'body': `${data.description}`,
        }

        const Request = unirest.post(`${freshdeskUrl}/api/v2/tickets/${ticketId}/reply`);
        try{
            Request.auth({
                user: freshdeskEmail,
                pass: freshdeskPassword,
                sendImmediately: true
            })
            .type('json')
            .send(fields)
            .end(function (response) {                                         
                if (response.status == 201) {
                    return res.status(200).json(res.fnSuccess(response.body));                
                }
                else {
                    return res.status(400).json(res.fnError(response.body));                
                }
            });
        }
        catch(err){
            return res.status(400).json(res.fnError(err));         
        }
    },

    replyWithAttatchment(data,freshdeskEmail,freshdeskPassword,freshdeskUrl,ticketId,res){
        var fields = {
            'body': `${data.description}`                       
        }      
       
        const Request = unirest.post(`${freshdeskUrl}/api/v2/tickets/${ticketId}/reply`);

        try{
            let fileName = _.last(_.split(data.attachments, '/'));
            let savePath = Public(`images/supportTicket/${fileName}`);

            download(`${data.attachments}`)
            .then(data => {
                _fs.writeFileSync(savePath, data);
                if (!_fs.existsSync(savePath)) {
                    return res.status(400).json(res.fnError('Image Error in local storage!'));    
                }
                Request.auth({
                    user: freshdeskEmail,
                    pass: freshdeskPassword,
                    sendImmediately: true
                })
                .type('multipart/form-data')
                .field(fields)
                .attach('attachments[]', fs.createReadStream(`${savePath}`))
                .end(function (response) {                               
                    if (response.status == 201) {
                        _fs.unlinkSync(savePath);
                        
                        return res.status(200).json(res.fnSuccess(response.body));                
                    }
                    else {
                        return res.status(400).json(res.fnError('Internal Server Error'));                
                    }
                });
            })
            .catch((err)=>{
                return res.status(400).json(res.fnError(err)); 
            })            
        }
        catch(err){
            return res.status(400).json(res.fnError(err));         
        }
    },

    ticketUpdate: async function(req,res,next){
        let formData = req.body;
        let ticketId = req.params.ticketId;      

        let freshdeskEmail      = await Setting.where('access_key', 'freshdesk_email').fetch();
        let freshdeskPassword   = await Setting.where('access_key', 'freshdesk_password').fetch();
        let freshdeskUrl        = await Setting.where('access_key', 'freshdesk_url').fetch();

        const fields = {
            'requester_id': parseInt(formData.requester_id),
            'email': formData.email,
            'status': parseInt(formData.status),
            'priority': parseInt(formData.priority),
            'source': parseInt(formData.source)
        }

        const Request = unirest.put(`${freshdeskUrl.get('value')}/api/v2/tickets/${ticketId}`);
        try{
            Request.auth({
                user: freshdeskEmail.get('value'),
                pass: freshdeskPassword.get('value'),
                sendImmediately: true
            })
            .type('json')
            .send(fields)
            .end(function (response) {                 
                if (response.status == 200) {
                    return res.status(200).json(res.fnSuccess(response.body));                
                }
                else {
                    return res.status(400).json(res.fnError('Internal Server error!.'));                
                }
            });
        }
        catch(err){
            return res.status(400).json(res.fnError(err));         
        }
    },

    search:async function(req,res,next){

        let status = _.toInteger(req.query.status) ? req.query.status : false;;
        let priority = _.toInteger(req.query.priority) ? req.query.priority : false;
        let createAt = _.toBoolean(req.query.created_at) ? req.query.created_at : false;              
        let page = _.toBoolean(req.query.page) ? _.toInteger(req.query.page) : 1;

        let freshdeskEmail = await Setting.where('access_key', 'freshdesk_email').fetch();
        let freshdeskPassword = await Setting.where('access_key', 'freshdesk_password').fetch();
        let freshdeskUrl = await Setting.where('access_key', 'freshdesk_url').fetch();
       // let freshdeskAgentId = await Setting.where('access_key', 'freshdesk_agent_id').fetch();

       // let agentId = freshdeskAgentId.get('value');
        let query = null;

        if(status && priority && createAt){
            query = `"status:${status} AND priority:${priority} AND created_at:'${createAt}'"`;
        }
        else if((status && priority ) && (createAt === false)){
            query = `"status:${status} AND priority:${priority}"`;
        }
        else if((status && createAt) && (priority === false) ){
            query = `"status:${status} AND created_at:'${createAt}'"`;
        }
        else if((priority && createAt) && (status === false) ){            
            query = `"priority:${priority} AND created_at:'${createAt}'"`;
        }
        else if(status && ( priority === false &&  createAt === false)){
            query = `"status:${status}"`;
        }
        else if(priority && ( status === false &&  createAt === false)){       
            query = `"priority:${priority}"`;
        } 
        else if(createAt && ( status === false &&  priority === false)){                          
            query = `"created_at:'${createAt}'"`;
        }
        else{                      
            return res.status(400).json(res.fnError('Internal Server Error'));
        }
       
        const Request = unirest.get(`${freshdeskUrl.get('value')}api/v2/search/tickets?query=${query}&page=${page}`);

        try {
            Request
            .auth({
                user: freshdeskEmail.get('value'),
                pass: freshdeskPassword.get('value'),
                sendImmediately: true
            })
            .end(function (response) {                
                if (response.status == 200) {
                    return res.status(200).json(res.fnSuccess(response.body));
                }
                else {
                    return res.status(400).json(res.fnError(response.body));
                }
            });
        }
        catch(err){
            return res.status(400).json(res.fnError(err));
        }
    }
}

module.exports = TicketController;