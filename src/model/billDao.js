/**
*账单缴费数据类
*/
import {
  DeviceEventEmitter
} from 'react-native';
import BaseDao from './baseDao';
import ajax from '../util/ajax';
import accountDao from './accountDao';

export class BillDao extends BaseDao {
  unpaiedBillNumber=0; //未支付的账单数量
  unpaiedBillAmount=0; //未支付的账单总额
  list=[]; //未支付账单列表
  paiedList=[]; //已支付账单
  billDetailList=[]; //当前账单明细

  constructor() {
    super();
  }

  /**
  *获取账单缴费概要信息,账单数量
  */
  retrieveBillProfile(){
    let _this=this;
    if(accountDao.currentUnit){
      ajax.get('/bill/retrieveBillNumber',{},function(result){
        if(result.code==0){
          _this.unpaiedBillNumber=result.billNumber;
          DeviceEventEmitter.emit('changeBillProfile',null);
        }
      });
    }
  }

  clear(){
    this.unpaiedBillNumber=0;
    this.unpaiedBillAmount=0;
    this.list=[];
    this.paiedList=[];
    this.billDetailList=[];
    DeviceEventEmitter.emit('changeBillProfile',null);
  }
  /**
  *获取更多账单列表
  */
  load(cb){
    let _this=this;
    _this.list=[];
    _this.unpaiedBillAmount=0;
    ajax.get('/bill/retrieveBillList',{},function(result){
      if(result.code==0){
        if(_this.unpaiedBillNumber!=result.data.length){
          _this.unpaiedBillNumber=result.data.length;
          DeviceEventEmitter.emit('changeBillProfile',null);
        }
        for(var i=0;i<result.data.length;i++){
          _this.unpaiedBillAmount=_this.unpaiedBillAmount+parseFloat(result.data[i].billTotal);
          var item=result.data[i];
          _this.list.push(item);
        }
      }
      if(cb){cb(result);}
    });
  }

  /**
  *初始化账单数据
  */
  init(cb){
    this.list=[];
    if(this.list.length==0){
      this.load(cb);
    }else{
      if(cb){cb(null)}
    }
  }

  /**
  *获取更多已支付的账单列表
  */
  loadPaiedList(cb){
    let _this=this;
    ajax.get('/bill/retrievePaiedBillList',{arrayLength:_this.paiedList.length},function(result){
      if (result.code == 0) {
        for (var i = 0; i < result.data.length; i++) {
          _this.paiedList.push(result.data[i]);
        }
      }
      if(cb){cb(result);}
    });
  }

  /**
  *初始化已支付的账单数据
  */
  initPaiedList(cb){
    this.paiedList=[];
    if(this.paiedList.length==0){
      this.loadPaiedList(cb);
    }else{
      if(cb){cb(null)}
    }
  }

  /**
  *获得账单详情
  */
  retrieveBillDetail(billId,cb){
    let _this=this;
    this.billDetailList=[];
    ajax.get('/bill/retrieveBillDetail',{billId:billId},function(result){
      if(result.code==0&&result.data.length>0){
        for(var i=0;i<result.data.length;i++){
          var item=result.data[i];
          _this.billDetailList.push(item);
        }
      }
      if(cb){cb(result)}
    });
  }
}

const billDao=new BillDao();
export default billDao; //创建一个默认的数据对象，并将其导出
