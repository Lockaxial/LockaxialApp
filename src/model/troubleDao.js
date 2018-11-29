/**
*维修申报数据类
*/
import BaseDao from './baseDao';
import ajax from '../util/ajax';
import Format from '../util/format';
import accountDao from './accountDao';

export class TroubleDao extends BaseDao {
  list=[]; //维修申报列表

  constructor() {
    super();
  }

  /**
  *获取更多维修申报列表
  */
  load(cb){
    let _this=this;
    ajax.get('/trouble/retrieveTroubleList',{arrayLength:_this.list.length},function(result){
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
      console.log("初始化维修申报信息");
      this.list = [];
      this.load(cb);
  }

  /**
  *保存新建的访客密码
  */
  save(trouble,cb){
    let _this=this;
    ajax.post('/trouble/saveTrouble', {
      trouble: trouble
    }, function (result) {
      if (result.code == 0) {
        trouble.rid=result.insertId;
        trouble.unitId=accountDao.userInfo.unitId;
        trouble.communityId=accountDao.userInfo.communityId;
        trouble.userId=accountDao.userInfo.rid;
        trouble.realname=accountDao.userDetail.realname,
        trouble.headimgurl=accountDao.userDetail.headimgurl,
        trouble.state="N";
        trouble.creDate=new Date();
        _this.list.splice(0,0,trouble);
      }
      if(cb){cb(result);}
    });
  }
}

const troubleDao=new TroubleDao();
export default troubleDao; //创建一个默认的数据对象，并将其导出
