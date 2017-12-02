var mongodb=require('./db');

class Comment{
    constructor(title,comment){
        this.title=title;
        this.comment=comment;
    }
    save(callback){
        let comment={
            title:this.title,
            comment:this.comment
        }
        mongodb.open(function(err,db){
            if(err){
             return callback(err);
            }
            db.collection('posts',function(err,collection){
                if(err){
                    mongodb.close();
                    return callback(err);
                }
                collection.update({
                    "title":comment.title
                },{$push:{"comments":comment.comment}
                },function(err){
                    mongodb.close();
                    if(err){
                        return callback(err);
                    }
                    callback(null);
                });
            });
        });
    }
}

module.exports=Comment;