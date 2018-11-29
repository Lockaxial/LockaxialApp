/**
*商铺数据类
*/
import {
  DeviceEventEmitter
} from 'react-native';

import BaseDao from './baseDao';
import ajax from '../util/ajax';
import Format from '../util/format';

export default class GoodsDao extends BaseDao {
  list=[]; //论坛话题记录列表
  shopId=0;

  constructor(shopId) {
    super();
    this.shopId=shopId;
  }

  /**
  *获取更多商铺列表
  */
  load(cb){
    let _this=this;
    ajax.get('/shop/retrieveGoodsList',{shopId:_this.shopId,arrayLength:_this.list.length},function(result){
      if (result.code == 0) {
        for (var i = 0; i < result.data.length; i++) {
          if(result.data[i].images&&result.data[i].images.length>0){
            result.data[i].images=JSON.parse(result.data[i].images);
          }else{
            result.data[i].images=[];
          }
          if(result.data[i].cover){
            result.data[i].cover=ajax.convertImageUrl(result.data[i].cover);
          }
          for(let j=0;j<result.data[i].images.length;j++){
            result.data[i].images[j]=ajax.convertImageUrl(result.data[i].images[j]);
          }
          _this.list.push(result.data[i]);
        }
      }
      if(cb){cb(result);}
    });
  }

  /**
  *初始化商铺数据
  */
  init(cb){
    if(this.list.length==0){
      this.load(cb);
    }else{
      if(cb){cb(null)}
    }
  }

  getItem(goodsId){
    let item=null;
    for(let i=0;i<this.list.length;i++){
      if(this.list[i].rid==goodsId){
        item=this.list[i];
        break;
      }
    }
    return item;
  }
}
