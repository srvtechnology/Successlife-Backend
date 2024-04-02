const app = Config('app');

module.exports = function(req, res, next){
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    if (ip.substr(0, 7) == '::ffff:') {
        ip = ip.substr(7)
    }       

    let ip_white_list   = app.ip_white_list;
    let ip_block_list   = app.ip_block_list;

    // let cond1           = (ip_white_list.filter(v => (ip.string_is(v) || v === ip)).length > 0 );
    // let cond2           = (ip_block_list.filter(v => (ip.string_is(v) || v === ip)).length > 0 );
    // let message         = {status:'error',message:`${ip} :: Your Ip is not allowed to access this API.`}
   
    
    let cond1 = ( (ip_white_list.indexOf(ip) >= 0 ) ? true : false);
    let cond2 = ( (ip_block_list.indexOf(ip) >= 0 ) ? true : false );
    let message  = {status:'error',message:`${ip} :: Your Ip is not allowed to access this API.`}
    
    
    if(ip_block_list.length > 0 &&  cond2 == true){
        return res.status(403).json(message);
    }else{
        if(ip_white_list.length !== 0 &&  cond1 == false){
            return res.status(403).json(message);
        }
    }

    next();
    
}