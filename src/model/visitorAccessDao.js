/**
*开门记录数据类
*/
import BaseDao from './baseDao';
import ajax from '../util/ajax';
import Format from '../util/format';

export class VisitorAccessDao extends BaseDao {
  list=[]; //访客密码记录列表

  constructor() {
    super();
  }

  /**
  *获取更多开门记录列表
  */
  load(cb){
    let _this=this;
    ajax.get('/unit/retrieveTempKeyList',{arrayLength:_this.list.length},function(result){
      if (result.code == 0) {
        for (var i = 0; i < result.data.length; i++) {
          if(result.data[i].realname){
            result.data[i].realname="";
          }
          if(result.data[i].mobile){
            result.data[i].mobile="";
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

  /**
  *保存新建的访客密码
  */
  save(newKey,cb){
    let _this=this;
    ajax.post('/unit/saveTempKey', {
      key: newKey
    }, function (result) {
      if (result.code == 0) {
        newKey.rid=result.insertId;
        newKey.tempkey=result.tempkey;
        newKey.creDate=new Date();
        newKey.startDate=Format.fromDateToStr(new Date,"yyyy-MM-dd hh:mm");
        _this.list.splice(0,0,newKey);
      }
      if(cb){cb(result);}
    });
  }
}

const visitorAccessDao=new VisitorAccessDao();
export default visitorAccessDao; //创建一个默认的数据对象，并将其导出
