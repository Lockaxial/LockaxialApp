/**
*广告数据类
*/
import {
  DeviceEventEmitter
} from 'react-native';
import BaseDao from './baseDao';
import AppConf from '../comm/appConf';
import ajax from '../util/ajax';
import {toast,toastX} from '../util/tools';
import {compareJson} from '../util/tools';

export class AdsDao extends BaseDao {
  adsData={};
  isRefreshingData=false;

  constructor() {
    super();
  }

  /**
  *从服务器中获取最新广告数据
  */
  load(){
    let _this=this;
    ajax.get('/auth/retrieveAdList',null,function(result){
      if (result.code == 0) {
        for (var i = 0; i < result.adList.length; i++) {
          var item = result.adList[i];
          var covers=[];
          if(item.covers){
            covers = JSON.parse(item.covers);
            if(covers.length>0) {
              for (var j = 0; j < covers.length; j++) {
                covers[j].img = ajax.convertImageUrl(covers[j].img);
              }
              if (!compareJson(_this.adsData[item.name], covers)) { //判断数据是否一致，不一致则更新本地的数据
                _this.adsData[item.name] = covers; //获取到数据后，根据名称替换本地数据
              }
            }
          }                    
        }
        DeviceEventEmitter.emit('changeAdsBanner',_this.adsData);
      }
    });
  }
  /**
  *开始在后台启动广告数据刷新
  */
  startRefresh(delay){
    setTimeout(()=>{
      if(!this.isRefreshingData){
        this.isRefreshingData=true;
        this.load();
      }
    },delay*1000);
  }
}

const adsDao=new AdsDao();
export default adsDao; //创建一个默认的数据对象，并将其导出
