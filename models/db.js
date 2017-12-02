var settings=require('../settings');
    Db=require('mongodb').Db,
    Connection=require('mongodb').Connection;
    server=require('mongodb').Server;
module.exports=new Db(settings.db,new server(settings.host,settings.port),{safe:true});