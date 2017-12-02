var mongodb=require('./db');
var markdown=require('markdown').markdown;
class Post{
    constructor(name,head,title,tags,post)
    {
        this.name=name;
        this.title=title;
        this.post=post;
        this.tags=tags;
        this.head=head;
    }
    save(callback){
        let date=new Date();
        let time={
            date:date,
            year:date.getFullYear(),
            month:date.getFullYear()+"-"+(date.getMonth()+1),
            day:date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate(),
            minute:date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate()+"-"+date.getHours()+":"+(date.getMinutes()<10?"0"+date.getMinutes():date.getMinutes())
        }
        let post={
            name:this.name,
            head:this.head,
            time:time,
            title:this.title,
            tags:this.tags,
            post:this.post,
            comments:[],
            pv:0
        }
       mongodb.open(function(err,db){
           if(err){
               callback(err);
           }
           db.collection('posts',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            collection.insert(post,{safe:true},function(err){
                mongodb.close();
                if(err){
                    callback(err);
                }
                callback(null);
            });
           });
       });
    };

    static getAll(name,callback){
        mongodb.open(function (err,db){
            if(err){
                mongodb.close();
                return callback(err);
            }
            db.collection('posts',function(err,collection){
                if(err){
                    mongodb.close();
                    return callback(err);
                }
             var query={};
             if(name){
                 query.name=name;
             }
             collection.find(query).sort({time:-1}).toArray(function(err,docs){
                 mongodb.close();
                 if(err){
                     return callback(err);
                 }
                 docs.forEach(function(doc) {
                    doc.post=markdown.toHTML(doc.post);   
                 });
                 callback(null,docs);
             });
            });
        });
    };
    
    static getOne(name,day,title,callback){
        mongodb.open(function(err,db){
            if(err){
                return callback(err);
            }
            db.collection('posts',function(err,collection){
                if(err){
                    mongodb.close();
                    return callback(err);
                }
            collection.findOne({
                'name':name,
                'time.day':day,
                'title':title
            },function(err,doc){
                mongodb.close();
                if(err){
                    return callback(err);}
                if(doc){
                    collection.update({
                        "name":name,
                        "time.day":day,
                        "title":title
                    },{$inc:{"pv":1}},function(err){
                        mongodb.close();
                        if(err){
                            return callback(err);
                        }
                    });
                    doc.post=markdown.toHTML(doc.post);
                    doc.comments.forEach(function(comment){
                        comment.content=markdown.toHTML(comment.coentent);
                    });
                }
                callback(null,doc);
            });
            });
        });
    };
    static getTitle(title,callback){
        mongodb.open(function (err,db){
            if(err){
                mongodb.close();
                return callback(err);
            }
            db.collection('posts',function(err,collection){
                if(err){
                    mongodb.close();
                    return callback(err);
                }
             let query={};
             if(title){
                 query.title=title;
             }
             collection.update({
                "title":title
            },{$inc:{"pv":1}},function(err){
                mongodb.close();
                if(err){
                    return callback(err);
                }
            });
             collection.find(query).sort({time:-1}).toArray(function(err,docs){
                 mongodb.close();
                 if(err){
                     return callback(err);
                 }
                 docs.forEach(function(doc) {
                     doc.post=markdown.toHTML(doc.post);
                    doc.comments.forEach(function(comment){
                    comment.content=markdown.toHTML(comment.content);
                   });  
                 });
                 callback(null,docs);
             });
            });
        });
    }
    static update(title,post,callback){
        mongodb.open(function (err,db){
            if(err){
                mongodb.close();
                return callback(err);
            }
            db.collection('posts',function(err,collection){
                if(err){
                    mongodb.close();
                    return callback(err);
                }
            collection.update({
                "title":title
            },{
            $set:{"post":post}
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
    static remove(title,callback){
        mongodb.open(function (err,db){
            if(err){
                mongodb.close();
                return callback(err);
            }
            db.collection('posts',function(err,collection){
                if(err){
                    mongodb.close();
                    return callback(err);
                }
            collection.remove({
                "title":title
            },{
              w:1
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
    static getFive(name,page,callback){
        mongodb.open(function (err,db){
            if(err){
                return callback(err);
            }
            db.collection('posts',function(err,collection){
                if(err){
                    mongodb.close();
                    return callback(err);
                }
             var query={};
             if(name){
                 query.name=name;
             }
             collection.count(query,function(err,total){
                  collection.find(query,{skip:(page-1)*5,limit:5}).sort({time:-1}).toArray(function(err,docs){
                 mongodb.close();
                 if(err){
                     return callback(err);
                 }
                 docs.forEach(function(doc) {
                    doc.post=markdown.toHTML(doc.post);   
                 });
                 callback(null,docs,total);
                });
             });
            });
        }); 
    }
    static getArchive(callback){
        mongodb.open(function (err,db){
            if(err){
                return callback(err);
            }
            db.collection('posts',function(err,collection){
                if(err){
                    mongodb.close();
                    return callback(err);
                }         
                  collection.find({},{"name":1,"time":1,"title":1}).sort({time:-1}).toArray(function(err,docs){
                 mongodb.close();
                 if(err){
                     return callback(err);
                 }
                 callback(null,docs);
                });
             });
            }); 
    }
    static getTags(callback){
        mongodb.open(function(err,db){
            if(err){
                return callback(err);
            }
            db.collection('posts',function(err,collection){
                if(err){
                mongodb.close();
                return callback(err);
                }
                collection.distinct("tags",function(err,docs){
                    mongodb.close;
                    if(err){
                    return callback(err);
                    }
                    callback(null,docs);
                });
            });
        });
    }
    static getTag(tag,callback){
        mongodb.open(function (err,db){
            if(err){
                return callback(err);
            }
            db.collection('posts',function(err,collection){
                if(err){
                    mongodb.close();
                    return callback(err);
                }         
                  collection.find({"tags":tag},{"name":1,"time":1,"title":1}).sort({time:-1}).toArray(function(err,docs){
                 mongodb.close();
                 if(err){
                     return callback(err);
                 }
                 callback(null,docs);
                });
             });
            }); 
    }
    static search(keyword,callback){
        mongodb.open(function (err,db) {
            if(err){
                return callback(err);
            }
            db.collection('posts',function (err,collection) {
             if(err){
                 mongodb.close();
                 return callback(err);
             }
             var pattern=new RegExp("^.*"+keyword+".*$","i");
             collection.find({
                 "title":pattern,
             },{"name":1,"time":1,"title":1}).sort({time:-1}).toArray(function (err,docs) {
                 mongodb.close();
                 if(err){
                     return callback(err);
                 }
                 callback(null,docs);
             });                
            });
        });
    }
};
module.exports=Post;