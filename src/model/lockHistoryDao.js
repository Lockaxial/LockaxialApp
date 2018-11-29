/**
*开门记录数据类
*/
import BaseDao from './baseDao';
import ajax from '../util/ajax';

export default class LockHistoryDao extends BaseDao {
  list=[]; //开门记录列表

  constructor() {
    super();
  }

  /**
  *增加开门记录图片
  */
  static appendImage(imageUuid,imageUrl){
    let _this=this;
    ajax.get('/device/appendImage',{imageUuid:imageUuid,imageUrl:imageUrl},function(result){
      if (result.code == 0) {
      }
    });
  }

  /**
  *获取更多开门记录列表
  */
  load(cb){
    let _this=this;
    ajax.get('/unit/retrieveAccessList',{arrayLength:_this.list.length},function(result){
      if (result.code == 0) {
        for (var i = 0; i < result.data.length; i++) {
            console.log("=============== s t a r t ========================");
            console.log("rid = "+result.data[i].rid);
            console.log("communityId = "+result.data[i].communityId);
            console.log("unitId = "+result.data[i].unitId);
            console.log("userId = "+result.data[i].userId);
            console.log("lockId = "+result.data[i].lockId);
            console.log("type = "+result.data[i].type);
            console.log("creDate = "+result.data[i].creDate);
            console.log("tempKeyId = "+result.data[i].tempKeyId);
            console.log("cardNo"+result.data[i].cardNo);
            console.log("imageUrl = "+result.data[i].imageUrl);
            console.log("employeeId = "+result.data[i].employeeId);
            console.log("imageUuid = "+result.data[i].imageUuid);
            console.log("lockName = "+result.data[i].lockName);
          if(result.data[i].imageUrl){
            result.data[i].imageUrl=ajax.convertImageUrl(result.data[i].imageUrl);
          }
            console.log("Decode imageurl = "+result.data[i].imageUrl);
            console.log("=============== e n d ========================");
          _this.list.push(result.data[i]);
        }
      }
      if(cb){cb(result);}
    });
  }

  /**
  *初始开门记录数据
  */
  init(cb){
    if(this.list.length==0){
      this.load(cb);
    }else{
      if(cb){cb(null)}
    }
  }
}
