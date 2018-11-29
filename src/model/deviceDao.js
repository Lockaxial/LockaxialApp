/**
*家庭相框数据类
*/
import BaseDao from './baseDao';
import ajax from '../util/ajax';
import Format from '../util/format';
import accountDao from './accountDao';

export class DeviceDao extends BaseDao {
  list=[]; //室内机列表
  deviceMac=''; //当前室内机MAC地址
  images=[]; //当前室内机的照片列表

  constructor() {
    super();
  }

  /**
  *获取更多维修申报列表
  */
  load(cb){
    let _this=this;
    ajax.get('/unit/retrieveDevicePhotoList',{},function(result){
      if (result.code == 0) {
        _this.list=result.data;
        if(result.data.length>0){
          _this.deviceMac=result.data[0].deviceMac;
        }
        if(result.images&&result.images.length>0){
          _this.images=JSON.parse(result.images[0].images);
        }else{
          _this.images=[];
        }
      }
      if(cb){cb(result);}
    });
  }

  getImages(deviceMac,cb){
    let _this=this;
    this.deviceMac=deviceMac;
    ajax.get('/unit/retrievePhotoList',{deviceMac},function(result){
      if (result.code == 0) {
        if(result.data.length>0){
          console.log(result.data[0].images);
          _this.images=JSON.parse(result.data[0].images);
        }else{
          _this.images=[];
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
  save(cb){
    let _this=this;
    ajax.post('/unit/saveDevicePhoto', {
      deviceMac: _this.deviceMac,
      images:_this.images
    }, function (result) {
      if(cb){cb(result);}
    });
  }
}

const deviceDao=new DeviceDao();
export default deviceDao; //创建一个默认的数据对象，并将其导出
