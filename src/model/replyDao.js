/**
*社区回复数据类
*/
import {
  DeviceEventEmitter
} from 'react-native';

import BaseDao from './baseDao';
import ajax from '../util/ajax';
import Format from '../util/format';
import accountDao from './accountDao';

export default class ReplyDao extends BaseDao {
  list=[]; //论坛回复记录列表
  topicId=0;
  topicDao=null;

  constructor(topicId,topicDao) {
    super();
    this.topicId=topicId;
    this.topicDao=topicDao;
  }

  /**
  *获取更多话题回复列表
  */
  load(cb){
    let _this=this;
    ajax.get('/forum/retrieveTopicReplyList',{topicId:_this.topicId,arrayLength:_this.list.length},function(result){
      if (result.code == 0) {
        for (var i = 0; i < result.data.length; i++) {
          if(result.data[i].replyImages&&result.data[i].replyImages.length>0){
            result.data[i].replyImages=JSON.parse(result.data[i].replyImages);
          }else{
            result.data[i].replyImages=[];
          }
          _this.list.push(result.data[i]);
        }
      }
      if(cb){cb(result);}
    });
  }

  /**
  *初始化话题回复数据
  */
  init(cb){
    if(this.list.length==0){
      this.load(cb);
    }else{
      if(cb){cb(null)}
    }
  }

  getItem(replyId){
    let item=null;
    for(let i=0;i<this.list.length;i++){
      if(this.list[i].rid==replyId){
        item=this.list[i];
        break;
      }
    }
    return item;
  }

  save(reply,cb){
    let _this=this;
    reply.topicId=_this.topicId;
    reply.userId=accountDao.userInfo.rid;
    reply.username=accountDao.userDetail.realname;
    reply.headimgurl=accountDao.userDetail.headimgurl;

    ajax.post('/forum/addTopicReply',{reply:reply},function(result){
      if(result.code==0){
        reply.rid=result.insertId;
        reply.creDate=new Date();
        reply.likesId=0;
        reply.likesNum=0;
        _this.list.splice(0,0,reply);
        _this.topicDao.getItem(_this.topicId).replyNum++;
        DeviceEventEmitter.emit('changeTopic',{forumId:_this.topicDao.forumId,topicId:_this.topicId});
      }
      if(cb){cb(result)}
    });
  }

  switchReplyLikes(replyId,cb){
    let el=this.getItem(replyId);
    if(el.likesId>0){
      this.removeReplyLikes(el,cb);
    }else{
      this.addReplyLikes(el,cb);
    }
  }

  removeReplyLikes(el,cb){
    let _this=this;
    ajax.get('/forum/removeReplyLikes',{replyId:el.rid},function(result){
      if(result.code==0){
        el.likesId=0;
        el.likesNum--;
        DeviceEventEmitter.emit('changeTopicReply',{replyId:el.rid});
      }
      if(cb)(cb(result));
    });
  }

  addReplyLikes(el,cb){
    let _this=this;
    ajax.get('/forum/addReplyLikes',{replyId:el.rid},function(result){
      if(result.code==0){
        el.likesId=result.insertId;
        el.likesNum++;
        DeviceEventEmitter.emit('changeTopicReply',{replyId:el.rid});
      }
      if(cb)(cb(result));
    });
  }
}
