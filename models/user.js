var crypto=require('crypto');
var mongoose=require('mongoose');
mongoose.connect('mongodb://localhost:27017/blog');
var userSchema=new mongoose.Schema({
    name:String,
    password:String,
    email:String
},{
    collection:'users'
})
var userModel=mongoose.model('User',userSchema);
class User {
    constructor(user) {
        this.name = user.name;
        this.password = user.password;
        this.email = user.email;
    }
    save(callback) {
        let md5=crypto.createHash('md5'),
            email_MD5=md5.update(this.email.toLowerCase()).digest('hex'),
            head="http://www.gravatar.com/avatar/"+email_MD5+"?s=48";
        let user = {
            name: this.name,
            password: this.password,
            email: this.email,
            head:head
        };
        
       let newUser=new userModel(user);
       newUser.save(function(err,user){
         if(err){
             return callback(err);
         }
         callback(null,user);
       });
    };
      
    static get(name, callback) {
        userModel.findOne({name:name},function(err,user){
            if(err){
                return callback(err);
            }
            callback(null,user);
        })
    }
}
module.exports=User;


