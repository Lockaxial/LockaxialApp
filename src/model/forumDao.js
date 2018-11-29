/**
*社区论坛数据类
*/
import BaseDao from './baseDao';
import ajax from '../util/ajax';
import Format from '../util/format';
import accountDao from './accountDao';
import TopicDao from './topicDao';

export class ForumDao extends BaseDao {
  list=[]; //社区论坛记录列表
  topicDaoList=[]; //社区论坛话题列表

  constructor() {
    super();
  }

  /**
  *获取更多投诉建议列表
  */
  load(cb){
    let _this=this;
    ajax.get('/forum/retrieveForumList',{},function(result){
      if (result.code == 0) {
        for (var i = 0; i < result.data.length; i++) {
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

  clear(){
    this.list=[];
    this.topicDaoList=[];
  }
  /**
  *获得topicDao
  */
  getTopicDao(forumId){
    let topicDao=this.topicDaoList[forumId];
    if(!topicDao){
      topicDao=new TopicDao(forumId);
      this.topicDaoList[forumId]=topicDao;
    }
    return topicDao;
  }
}

const forumDao=new ForumDao();
export default forumDao; //创建一个默认的数据对象，并将其导出
