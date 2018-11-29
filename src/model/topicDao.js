/**
*社区论坛数据类
*/
import {
  DeviceEventEmitter
} from 'react-native';

import BaseDao from './baseDao';
import ajax from '../util/ajax';
import Format from '../util/format';
import accountDao from './accountDao';
import ReplyDao from './replyDao';

export default class TopicDao extends BaseDao {
  list=[]; //论坛话题记录列表
  replyDao=null; //当前话题的回复列表
  forumId=0;

  constructor(forumId) {
    super();
    this.forumId=forumId;
  }

  /**
  *获取更多投诉建议列表
  */
  load(cb){
    let _this=this;
    ajax.get('/forum/retrieveTopicList',{forumId:_this.forumId,arrayLength:_this.list.length},function(result){
      if (result.code == 0) {
        for (var i = 0; i < result.data.length; i++) {
          if(result.data[i].topicImages&&result.data[i].topicImages.length>0){
            result.data[i].topicImages=JSON.parse(result.data[i].topicImages);
          }else{
            result.data[i].topicImages=[];
          }
          _this.list.push(result.data[i]);
        }
      }
      if(cb){cb(result);}
    });
  }

  /**
  *初始化投诉建议数据
  */
  init(cb){
    if(this.list.length==0){
      this.load(cb);
    }else{
      if(cb){cb(null)}
    }
  }

  getItem(topicId){
    let item=null;
    for(let i=0;i<this.list.length;i++){
      if(this.list[i].rid==topicId){
        item=this.list[i];
        break;
      }
    }
    return item;
  }

  switchTopicLikes(topicId,cb){
    let el=this.getItem(topicId);
    if(el.likesId>0){
      this.removeTopicLikes(el,cb);
    }else{
      this.addTopicLikes(el,cb);
    }
  }

  removeTopicLikes(el,cb){
    let _this=this;
    ajax.get('/forum/removeTopicLikes',{topicId:el.rid},function(result){
      if(result.code==0){
        el.likesId=0;
        el.likesNum--;
        DeviceEventEmitter.emit('changeTopic',{forumId:_this.forumId,topicId:el.rid});
      }
      if(cb)(cb(result));
    });
  }

  addTopicLikes(el,cb){
    let _this=this;
    ajax.get('/forum/addTopicLikes',{topicId:el.rid},function(result){
      if(result.code==0){
        el.likesId=result.insertId;
        el.likesNum++;
        DeviceEventEmitter.emit('changeTopic',{forumId:_this.forumId,topicId:el.rid});
      }
      if(cb)(cb(result));
    });
  }

  convertFromRemarksToDesc(remark){
    if(remark.length<120){
      return remark;
    }else{
      return remark.substring(0,117)+"...";
    }
  }

  save(topic,cb){
    topic.desc=this.convertFromRemarksToDesc(topic.remark);
    if(topic.rid>0){
      this.updateTopic(topic,cb);
    }else{
      this.addTopic(topic,cb);
    }
  }

  addTopic(topic,cb){
    let _this=this;
    topic.communityId=accountDao.userInfo.communityId;
    topic.forumId=this.forumId;
    topic.userId=accountDao.userInfo.rid;
    topic.username=accountDao.userDetail.realname;
    topic.headimgurl=accountDao.userDetail.headimgurl;
    ajax.post('/forum/addTopic',{topic:topic},function(result){
      if(result.code==0){
        topic.rid=result.insertId;
        topic.creDate=new Date();
        topic.likesNum=0;
        topic.likesId=0;
        topic.replyNum=0;
        _this.list.splice(0,0,topic);
        DeviceEventEmitter.emit('changeTopicList',{forumId:_this.forumId});
      }
      if(cb){cb(result)}
    });
  }

  updateTopic(topic,cb){
    let _this=this;
    ajax.post('/forum/updateTopic',{topic:topic},function(result){
      if(result.code==0){
        let item=_this.getItem(topic.rid);
        item.title=topic.title;
        item.remark=topic.remark;
        item.topicImages=topic.topicImages;
        DeviceEventEmitter.emit('changeTopic',{forumId:_this.forumId,topicId:topic.rid});
      }
      if(cb){cb(result)}
    });
  }

  getReplyDao(topicId){
    if(this.replyDao&&this.replyDao.topicId==topicId){
    }else{
      this.replyDao=new ReplyDao(topicId,this);
    }
    return this.replyDao;
  }
}
