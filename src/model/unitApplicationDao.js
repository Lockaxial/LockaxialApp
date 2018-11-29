/**
*房屋申请相关数据类
*/
import {
  DeviceEventEmitter
} from 'react-native';

import BaseDao from './baseDao';
import ajax from '../util/ajax';
import {toast} from '../util/tools';

export class UnitApplicationDao extends BaseDao {
  cityList=[];
  communityList=[];
  blockList=[];
  unitList=[];
  ownerList=[];

  choosedData={
    city:null,
    communityId:0,
    communityName:null,
    needIdentity:'N',
    blockId:0,
    blockName:null,
    blockNo:null,
    unitId:0,
    unitName:null
  }

  constructor() {
    super();
  }

  clear(){
    this.cityList=[];
    this.communityList=[];
    this.blockList=[];
    this.unitList=[];
    this.ownerList=[];
    this.choosedData={
      city:null,
      communityId:0,
      communityName:null,
      needIdentity:'N',
      blockId:0,
      blockName:null,
      blockNo:null,
      unitId:0,
      unitName:null
    }
  }
  /**
  *从服务器中获取城市数据
  */
  loadCityList(cb){
    let _this=this;
    ajax.get('/unit/retrieveCityList',{},function(result){
      if(result.code==0){
          for(var i=0;i<result.data.length;i++){
            var item=result.data[i];
            _this.cityList.push(item);
          }
      }
      if(cb){cb();}
    });
  }

  /**
  *初始化城市数据
  */
  initCityList(cb){
    if(this.cityList.length==0){
      this.loadCityList(cb);
    }else{
      if(cb){cb()}
    }
  }

  /**
  *从服务器中获取社区数据
  */
  loadCommunityList(cb){
    let _this=this;
    ajax.get('/unit/retrieveCommunityList',{city:this.choosedData.city,arrayLength:this.communityList.length},function(result){
      if(result.code==0){
          for(var i=0;i<result.data.length;i++){
            var item=result.data[i];
            _this.communityList.push(item);
          }
      }
      if(cb){cb();}
    });
  }

  /**
  *初始化社区数据
  */
  initCommunityList(cb){
    if(this.communityList.length==0&&this.choosedData.city){
      this.loadCommunityList(cb);
    }else{
      if(cb){cb()}
    }
  }

  /**
  *从服务器中获取楼栋数据
  */
  loadBlockList(cb){
    let _this=this;
    ajax.get('/unit/retrieveBlockList',{communityId:this.choosedData.communityId,arrayLength:this.blockList.length},function(result){
      if(result.code==0){
          for(var i=0;i<result.data.length;i++){
            var item=result.data[i];
            _this.blockList.push(item);
          }
      }
      if(cb){cb();}
    });
  }

  /**
  *初始化楼栋数据
  */
  initBlockList(cb){
    if(this.blockList.length==0&&this.choosedData.communityId>0){
      this.loadBlockList(cb);
    }else{
      if(cb){cb()}
    }
  }

  /**
  *从服务器中获取房屋数据
  */
  loadUnitList(cb){
    let _this=this;
    ajax.get('/unit/retrieveBlockUnitList',{blockId:this.choosedData.blockId,arrayLength:this.unitList.length},function(result){
      if(result.code==0){
          for(var i=0;i<result.data.length;i++){
            var item=result.data[i];
            _this.unitList.push(item);
          }
      }
      if(cb){cb();}
    });
  }

  /**
  *初始化房屋数据
  */
  initUnitList(cb){
    if(this.unitList.length==0&&this.choosedData.blockId>0){
      this.loadUnitList(cb);
    }else{
      if(cb){cb()}
    }
  }

  /**
  *从服务器中获取房屋业主数据
  */
  loadOwnerList(cb){
    let _this=this;
    ajax.get('/user/retrieveUnitOwnerList',{blockUnitId:this.choosedData.unitId},function(result){
      if(result.code==0){
          for(var i=0;i<result.data.length;i++){
            var item=result.data[i];
            _this.ownerList.push(item);
          }
      }
      if(cb){cb();}
    });
  }

  /**
  *初始化房屋业主数据
  */
  initOwnerList(cb){
    if(this.ownerList.length==0&&this.choosedData.unitId>0){
      this.loadOwnerList(cb);
    }else{
      if(cb){cb()}
    }
  }

  /**
  *当城市改变后，需要清空下面所有数据
  */
  changeCity(index){
    if(this.cityList[index].city!=this.choosedData.city){
      this.choosedData.city=this.cityList[index].city;
      this.choosedData.communityId=0;
      this.choosedData.communityName=null;
      this.choosedData.needIdentity='N';
      this.communityList=[];
      this.choosedData.blockId=0;
      this.choosedData.blockName=null;
      this.choosedData.blockNo=null;
      this.blockList=[];
      this.choosedData.unitId=0;
      this.choosedData.unitName=null;
      this.unitList=[];
      this.ownerList=[];
      DeviceEventEmitter.emit('changeUnitApplication',"");
    }
  }

  /**
  *当社区改变后，需要清空下面所有数据
  */
  changeCommunity(index){
    if(this.communityList[index].rid!=this.choosedData.communityId){
      this.choosedData.communityId=this.communityList[index].rid;
      this.choosedData.communityName=this.communityList[index].communityName;
      this.choosedData.needIdentity=this.communityList[index].needIdentity;
      this.choosedData.blockId=0;
      this.choosedData.blockName=null;
      this.choosedData.blockNo=null;
      this.blockList=[];
      this.choosedData.unitId=0;
      this.choosedData.unitName=null;
      this.unitList=[];
      this.ownerList=[];
      DeviceEventEmitter.emit('changeUnitApplication',"");
    }
  }

  /**
  *当楼栋改变后，需要清空下面所有数据
  */
  changeBlock(index){
    if(this.blockList[index].rid!=this.choosedData.blockId){
      this.choosedData.blockId=this.blockList[index].rid;
      this.choosedData.blockName=this.blockList[index].blockName;
      this.choosedData.blockNo=this.blockList[index].blockNo;
      this.choosedData.unitId=0;
      this.choosedData.unitName=null;
      this.unitList=[];
      this.ownerList=[];
      DeviceEventEmitter.emit('changeUnitApplication',"");
    }
  }

  /**
  *当房屋改变后，需要清空下面所有数据
  */
  changeUnit(index){
    if(this.unitList[index].rid!=this.choosedData.unitId){
      this.choosedData.unitId=this.unitList[index].rid;
      this.choosedData.unitName=this.unitList[index].unitName;
      this.ownerList=[];
      this.initOwnerList(function(){
        DeviceEventEmitter.emit('changeUnitApplication',null);
      });
    }
  }

  saveUnitApplication(application,cb){
    ajax.post('/user/sendUnitApplication',{unitApplication:application},function(result){
        cb(result);
    });
  }
}

const unitApplicationDao=new UnitApplicationDao();
export default unitApplicationDao; //创建一个默认的数据对象，并将其导出
