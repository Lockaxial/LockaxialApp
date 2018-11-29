/**
*优惠券数据类
*/
import {
  DeviceEventEmitter
} from 'react-native';

import BaseDao from './baseDao';
import ajax from '../util/ajax';

export class CouponDao extends BaseDao {
  list=[];
  shopId=0;

  constructor() {
    super();
  }

  /**
  *获取更多优惠券列表
  */
  load(cb){
    let _this=this;
    ajax.get('/shop/retrieveCouponList',{shopId:_this.shopId,arrayLength:_this.list.length},function(result){
      if (result.code == 0) {
        for (var i = 0; i < result.data.length; i++) {
          _this.list.push(result.data[i]);
        }
      }
      if(cb){cb(result);}
    });
  }

  /**
  *初始化商铺数据
  */
  init(shopId,cb){
    this.list=[];
    this.shopId=shopId;
    if(this.list.length==0){
      this.load(cb);
    }else{
      if(cb){cb(null)}
    }
  }

  getItem(couponId){
    let item=null;
    for(let i=0;i<this.list.length;i++){
      if(this.list[i].couponId==couponId){
        item=this.list[i];
        break;
      }
    }
    return item;
  }

  useCoupon(couponId){
    let item=this.getItem(couponId);
    item.couponStatus=2;
  }

  doUseCoupon(couponCode){
    ajax.get('/shop/useCoupon',{couponCode:couponCode},function(result){
      if (result.code == 0) {

      }
    });
  }
}

const couponDao=new CouponDao();
export default couponDao; //创建一个默认的数据对象，并将其导出
