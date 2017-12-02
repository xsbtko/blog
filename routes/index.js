var express = require('express');
var flash = require('connect-flash');
var router = express.Router();
var crypto=require('crypto'),
    fs=require('fs'),
    formidable=require('formidable'),
    User=require('../models/user'),
    Comment=require('../models/comment'),
    Post=require('../models/post');
    function checkLogin(req,res,next){
      if(!req.session.user){
        req.flash('error','未登录！');
        res.redirect('/login');
      }
      next();
    }
    function checkNotLogin(req,res,next){
      if(req.session.user){
        res.redirect('/');
      }
      next();
    }
    function privateCheckLogin(req,res,next){
       if(req.session.user.name!=req.param('name'))
      {
        req.flash('error','请登录自己的账号!');
        res.redirect('/login');
      }
      next();
    }
router.get('/', function(req, res) {
  var page=req.query.p?parseInt(req.query.p):1;
  Post.getFive(null,page,function(err,posts,total){
    if(err){
      posts=[];
    }
    res.render('index',{
      title:'主页',
      posts:posts,
      page:page,
      isFirstPage:(page-1)==0,
      isLastPage:((page-1)*10+posts.length)==total,
      user:req.session.user,
      success:req.flash('success').toString(),
      error:req.flash('error').toString()
    });
  });
}); 
router.get('/reg',checkNotLogin);
router.get('/reg',function(req,res){
  res.render('reg',{title:'注册',
  user:req.session.user,
  success:req.flash('success').toString(),
  error:req.flash('error').toString()
});
});
router.post('/reg',checkNotLogin);
router.post('/reg',function(req,res){
   var name=req.body.name,
       password=req.body.password,
       password_re=req.body['password-repeat'];
       if(password_re!=password){
       res.flash('error','两次输入的密码不一致！');
      return res.redirect('/reg');
       }
    var md5=crypto.createHash('md5'),
        password=md5.update(req.body.password).digest('hex');
    var newUser=new User({
      name:req.body.name,
      password:password,
      email:req.body.email
    });
    User.get(newUser.name,function(err,user){
      if(user){
        req.flash('error','用户已存在！');
        return res.redirect('/reg');
      }
      newUser.save(function(err,user){
        if(err){
          req.flash('error',err);
          return res.redirect('/reg');
        }
        req.session.user=user;
        req.flash('success','注册成功！');
        res.redirect('/');
      });
    });
  });
router.get('/login',checkNotLogin); 
router.get('/login',function(req,res){
    res.render('login',{title:'登录',
    user:req.session.user,
    success:req.flash('success').toString(),
    error:req.flash('error').toString()
  });
  }); 
router.post('/login',checkNotLogin);  
router.post('/login',function(req,res){
  var md5=crypto.createHash('md5'),
  password=md5.update(req.body.password).digest('hex');
  User.get(req.body.name,function(err,user){
    if(!user){
      req.flash('error','用户不存在!');
      return res.redirect('/login');
    }
    if(user.password!=password){
      req.flash('error','密码错误！');
      return res.redirect('/login');
    }
    req.session.user=user;
    req.flash('success','登录成功！');
    res.redirect('/');
  });
  });
router.get('/post',checkLogin);
router.get('/post',function(req,res){
    res.render('post',{title:'发表',
    user:req.session.user,
    success:req.flash('success').toString(),
    error:req.flash('error').toString()
  });
  });
  router.post('/post',checkLogin); 
router.post('/post',function(req,res){
   let currentUser=req.session.user,
      tags=[req.body.tag1,req.body.tag2,req.body.tag3],
       post=new Post(currentUser.name,currentUser.head,req.body.title,tags,req.body.post);
       post.save(function(err){
         if(err){
           req.flash('error',err);
           return res.redirect('/');
         }
         req.flash('success','发布成功！');
         return res.redirect('/');
       });
  });
  router.get('/post',checkLogin);
router.get('/logout',function(req,res){
  req.session.user=null;
  req.flash('success','登出成功！');
  res.redirect('/');
  });
  router.get('/upload',checkLogin);
  router.get('/upload',function(req,res){
    res.render('upload',{
      title:'文件上传',
      user:req.session.user,
      success:req.flash('success').toString(),
      error:req.flash('error').toString()
    });
  });
  router.post('/upload',checkLogin);
  router.post('/upload',function(req,res){
    var form = new formidable.IncomingForm();
       form.encoding='utf-8';
       form.hash=true;
       form.uploadDir ='./public/images/';
       form.keepExtensions=true;
       form.parse(req,function(err, fields, files){
         if(err){
          req.flash('error', '文件上传失败！').toString();
          return res.redirect('/upload');
         }
         for(var i in req.files){
      if(req.files[i].size==0){
        fs.unlinkSync(req.files[i].path);
      } else{
        var target_path='../public/images/'+req.files[i].name;
        fs.renameSync(req.files[i].path,target_path);
      }
    } 
  }); 
    req.flash('success','文件上传成功！').toString();
    res.redirect('/upload');
  });
  router.get('/archive',function(req,res){
    Post.getArchive(function(err,posts){
      if(err){
        req.flash('error',err);
        return res.redirect('/');
      }
      res.render('archive',{
        title:'存档',
        posts:posts,
        user:req.session.user,
        success:req.flash('success').toString(),
        error:req.flash('error').toString()
      });
    });
  });
  router.get('/tags',function(req,res){
     Post.getTags(function(err,posts){
       if(err){
         req.flash('error',err);
         return res.redirect('/');
       }
       res.render('tags',{
         title:'标签',
         posts:posts,
         user:req.session.user,
         success:req.flash('success').toString(),
         error:req.flash('error').toString()
       });
     });
  });
  router.get('/tags/:tag',function(req,res){
    Post.getTag(req.param('tag'),function(err,posts){
      if(err){
        req.flash('error',err);
        return res.redirect('/');
      }
      res.render('tag',{
        title:'TAG:'+req.param('tag'),
        posts:posts,
        user:req.session.user,
        success:req.flash('success').toString(),
        error:req.flash('error').toString()
      });
    });
  });
  router.get('/search',function (req,res) {
    Post.search(req.query.keyword,function (err,posts) {
      if(err){
        req.flash('error',err);
        return res.redirect('/');
      }
      res.render('search',{
        title:"SEARCH:"+req.query.keyword,
        posts:posts,
        user:req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      })
    })
  })
  router.get('/user/:name',function(req,res){
    let page=req.query.p?parent(req.query.p):1;
    User.get(req.params.name,function(err,user){
      if(!user){
        req.flash('error','用户不存在！');
        return res.redirect('/');
      }
      Post.getFive(user.name,page,function(err,posts,total){
        if(err){
          req.flash('error',err);
          return res.redirect('/');}
         res.render('user',{
        title:user.name,
        posts:posts,
        page:page,
        isFirstPage:(page-1)==0,
        isLastPage:((page-1)*10+posts.length)==total,
        user:req.session.user,
        success:req.flash('success').toString(),
        error:req.flash('error').toString()
        });
      });
    });
  });
  router.get('/article/:title',function(req,res){
    Post.getTitle(req.param('title'),function(err,posts){
      if(err){
        req.flash('error','发生错误！');
        return res.redirect('/');
      }
      res.render('article',{
        title:req.param('title'),
        posts:posts,
        user:req.session.user,
        success:req.flash('success').toString(),
        error:req.flash('error').toString()
      });
    });
  });
  router.post('/article/:title',function(req,res){
    let date=new Date(),
        time=date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate()+"-"+date.getHours()+":"+(date.getMinutes()<10?"0"+date.getMinutes():date.getMinutes()),
        md5 = crypto.createHash('md5'),
        email_MD5 = md5.update(req.body.email.toLowerCase()).digest('hex'),
        head = "https://s.gravatar.com/avatar/" + email_MD5 + "?s=80";
    let comment={
      name:req.body.name,
      head:head,
      email:req.body.email,
      website:req.body.website,
      time:time,
      content:req.body.content
    };
    let newComment=new Comment(req.param('title'),comment);
     newComment.save(function(err){
       if(err){
         req.flash('error',err);
         return res.redirect('back');
       }
       req.flash('success','留言成功！');
       res.redirect('back');
     });
  });
  router.get('/edit/:title/:name',checkLogin);
  router.get('/edit/:title/:name',privateCheckLogin);
  router.get('/edit/:title/:name',function(req,res){
    Post.getTitle(req.params.title,function(err,posts){
      if(err){
        req.flash('error',err);
        return res.redirect('back');
      }
      res.render('edit',{
        title:'编辑',
        posts:posts,
        user:req.session.user,
        success:req.flash('success').toString(),
        error:req.flash('error').toString()
      });
    });
  });
  router.post('/edit/:title/:name',checkLogin);
  router.post('/edit/:title/:name',privateCheckLogin);
  router.post('/edit/:title/:name',function(req,res){
    Post.update(req.params.title,req.body.post,function(err){
      var url='/article/'+req.params.title;
      if(err){
        req.flash('error',err);
        return res.redirect(url);
      }
      req.flash('success','修改成功!');
      res.redirect(url);
    });
  });
  router.get('/remove/:title/:name',checkLogin);
  router.get('/remove/:title/:name',privateCheckLogin);
  router.get('/remove/:title/:name',function(req,res){
    Post.remove(req.params.title,function(err){
      if(err){
        req.flash('error',err);
        return res.redirect(back);
      }
      req.flash('success','删除成功!');
      res.redirect('/');
    });
  });

module.exports = router;
 