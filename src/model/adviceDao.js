/**
*开门记录数据类
*/
import BaseDao from './baseDao';
import ajax from '../util/ajax';
import Format from '../util/format';
import accountDao from './accountDao';

export class AdviceDao extends BaseDao {
  list=[]; //访客密码记录列表

  constructor() {
    super();
  }

  /**
  *获取更多投诉建议列表
  */
  load(cb){
    let _this=this;
    ajax.get('/advice/retrieveAdviceList',{arrayLength:_this.list.length},function(result){
      if (result.code == 0) {
        for (var i = 0; i < result.data.length; i++) {
          if(result.data[i].images&&result.data[i].images.length>0){
            result.data[i].images=JSON.parse(result.data[i].images);
          }else{
            result.data[i].images=[];
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
      console.log("初始化投诉建议信息");
      this.list = [];
      this.load(cb);
  }

  /**
  *保存新建的访客密码
  */
  save(advice,cb){
    let _this=this;
    ajax.post('/advice/saveAdvice', {
      advice: advice
    }, function (result) {
      if (result.code == 0) {
        advice.rid=result.insertId;
        advice.unitId=accountDao.userInfo.unitId;
        advice.communityId=accountDao.userInfo.communityId;
        advice.userId=accountDao.userInfo.rid;
        advice.realname=accountDao.userDetail.realname,
        advice.headimgurl=accountDao.userDetail.headimgurl,
        advice.state="N";
        advice.creDate=new Date();
        _this.list.splice(0,0,advice);
      }
      if(cb){cb(result);}
    });
  }
}

const adviceDao=new AdviceDao();
export default adviceDao; //创建一个默认的数据对象，并将其导出
