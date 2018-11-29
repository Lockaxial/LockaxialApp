/**
*联系物业数据类
*/
import BaseDao from './baseDao';
import ajax from '../util/ajax';
import Format from '../util/format';

export class ContactDao extends BaseDao {
  list=[]; //联系物业列表
  adminDeviceList=[]; //管理中心机列表

  constructor() {
    super();
  }

  /**
  *获取更多联系物业列表
  */
  load(cb){
    let _this=this;
    ajax.get('/unit/retrieveContactList',{arrayLength:_this.list.length},function(result){
      if (result.code == 0) {
        for (var i = 0; i < result.data.length; i++) {
          _this.list.push(result.data[i]);
        }
        for (var i = 0; i < result.adminDeviceList.length; i++) {
          _this.adminDeviceList.push(result.adminDeviceList[i]);
        }
      }
      if(cb){cb(result);}
    });
  }

  /**
  *初始联系物业数据
  */
  init(cb){
    if(this.list.length==0){
      this.load(cb);
    }else{
      if(cb){cb(null)}
    }
  }
}

const contactDao=new ContactDao();
export default contactDao; //创建一个默认的数据对象，并将其导出
