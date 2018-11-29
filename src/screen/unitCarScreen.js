/**
*房屋车辆明细页面
*/
import React, { Component } from 'react';
import {
  View,Text,TouchableOpacity,DeviceEventEmitter
} from 'react-native';
import {List,ListItem} from 'react-native-elements';

import NormalScreen from './normalScreen';
import trans from '../i18/trans';
import {toast,toastX} from '../util/tools';
import MainStyle from '../style/mainStyle';
import UnitDao from '../model/unitDao';
import Filter from '../util/filter';
import accountDao from '../model/accountDao';

const UNIT_DELETE="delete";
const UNIT_CARS="unit cars";
const MSG_DELETE_CAR="delete car confirm";
const MSG_INPUT_CAR="car NO input";
const MSG_CAR_NO="car NO format";

export default class UnitCarScreen extends NormalScreen {
  unitDao=new UnitDao(); //

  constructor(props) {
    super(props);
    let _this=this;
    this.state={
      unitCarList:[]
    }
    this.unitDao.load(accountDao.currentUnit,function(code){  //从数据库加载详细数据
      if(code==0){
        _this.loadData();
      }
    });
  }

  /**
   *当此组件中显示完成后，注册事件侦听，当公告信息产生变化时，更新显示
   */
  componentDidMount() {
      this.subscription= DeviceEventEmitter.addListener('unitCarListChanged', (data)=>this.unitCarListChanged(data)); //注册一个changeBillProfile消息，触发该消息时提示
  }

  /**
   *组件删除后，一并删除事件侦听
   */
  componentWillUnmount() {
      this.subscription.remove(); //页面销毁时注销消息事件
  }

  unitCarListChanged(data){
    for(let i=0;i<this.unitDao.unitCarList.length;i++){
      if(this.unitDao.unitCarList[i].rid==data.carId){
        this.unitDao.unitCarList[i].carStatus=data.carStatus;
        break;
      }
    }
    loadData();
  }

  /**
  *从Dao中获得最新数据，并更新页面
  */
  loadData(){
    this.state.unitCarList=this.unitDao.unitCarList;
    this.setState(this.state);
  }
  /**
  *打开新增车辆的页面
  */
  openNewCarScreen(){
    let _this=this;
    this.openInputScreen(MSG_INPUT_CAR,MSG_CAR_NO,function(carNo){
      if(carNo){
        _this.unitDao.saveUnitCar(carNo,function(code){
          if(code==0){
            _this.loadData();
          }else{
            toastX('system error');
          }
        });
      }
    });
  }

  /**
  *删除车辆
  */
  deleteCar(index){
    let _this=this;
    this.openConfirmDialog(MSG_DELETE_CAR,null,function(){
      _this.unitDao.deleteUnitCar(index,function(code){
        if(code==0){
          _this.loadData();
        }else{
          toastX('system error');
        }
      });
    });
  }

  lockOrUnlock(item){
    this.openScreen("UnitCarHistoryScreen",{
      carId:item.rid,
      carStatus:item.carStatus
    });
  }

  render() {
    return (
      <View style={MainStyle.screen}>
        <View style={{flexDirection: 'row'}}>
          <Text style={MainStyle.label}>{trans(UNIT_CARS)}</Text>
          <TouchableOpacity onPress={()=>this.openNewCarScreen()}><Text style={MainStyle.link}>{trans('add')}</Text></TouchableOpacity>
        </View>
        <List containerStyle={MainStyle.list}>
          {
            this.state.unitCarList.map((l, i) => (
              <ListItem
                key={i}
                hideChevron={true}
                title={l.carNo}
                subtitle={
                  <View style={{flexDirection: 'row'}}>
                    <Text style={MainStyle.innerLabel}>{Filter.carStateFilter(l.state)}</Text>
                    {
                       (l.state=='N'||l.state=='P')?(
                            <TouchableOpacity onPress={()=>this.deleteCar(i)}><Text style={MainStyle.innerLink}>{trans('delete')}</Text></TouchableOpacity>
                        ) : (
                            null
                        )
                    }
                    {
                       (l.state=='N')?(
                            <TouchableOpacity onPress={()=>this.lockOrUnlock(l)}><Text style={MainStyle.innerLink}>{trans('lockOrUnlock')}</Text></TouchableOpacity>
                        ) : (
                            null
                        )
                    }
                  </View>
                }
              />
            ))
          }
        </List>
      </View>
    );
  }
}
