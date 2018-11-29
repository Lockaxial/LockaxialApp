/**
*房屋出入历史页面
*/
import React, { Component } from 'react';
import {
  View,Text,TouchableOpacity,Button,DeviceEventEmitter
} from 'react-native';
import {List,ListItem} from 'react-native-elements';

import NormalScreen from './normalScreen';
import trans from '../i18/trans';
import {toast,toastX} from '../util/tools';
import MainStyle from '../style/mainStyle';
import Filter from '../util/filter';
import UnitDao from '../model/unitDao';

export default class UnitCarHistoryScreen extends NormalScreen {
  unitDao=new UnitDao(); //

  constructor(props) {
    super(props);
    let _this=this;
    this.state={
      carStatus:this.props.carStatus,
      unitCarHistoryList:[]
    }
    this.unitDao.retrieveCarHistory(props.carId,function(result){  //从数据库加载详细数据
      if(result.code==0&&result.data){
        _this.loadData(result.data);
      }
    });
  }

  /**
  *从Dao中获得最新数据，并更新页面
  */
  loadData(list){
    this.state.unitCarHistoryList=list;
    this.setState(this.state);
  }

  lockOrUnlock(){
    let orderNo=this.state.unitCarHistoryList[0].parkOrderNo;
    let _this=this;
    if(this.props.carStatus=='N'){
      _this.unitDao.lockCar(_this.props.carId,orderNo,function(result){
        if(result.code==0){
          _this.state.carStatus='L';
          _this.setState(_this.state);
          DeviceEventEmitter.emit('unitCarListChanged',{carId:_this.props.carId,carStatus:'L'});
        }else{
          toastX('lock car fail');
        }
      });
    }else{
      _this.unitDao.unlockCar(_this.props.carId,orderNo,function(result){
        if(result.code==0){
          _this.state.carStatus='N';
          _this.setState(_this.state);
          DeviceEventEmitter.emit('unitCarListChanged',{carId:_this.props.carId,carStatus:'N'});
        }else{
          toastX('unlock car fail');
        }
      });
    }
  }

  render() {
    let buttonCaption='lock';
    if(this.state.carStatus=='L'){
      buttonCaption='unlock';
    }
    let buttonDisable=true;
    if(this.state.unitCarHistoryList.length>0&&this.state.unitCarHistoryList[0].ParkOrderStatus_No=="200"){
      buttonDisable=false;
    }
    return (
      <View style={MainStyle.screen}>
        <Button
          onPress={()=>this.lockOrUnlock()}
          title={trans(buttonCaption)}
          color="#841584"
          disabled={buttonDisable}
          accessibilityLabel="Learn more about this purple button"
        />
        <List containerStyle={MainStyle.list}>
          {
            this.state.unitCarHistoryList.map((l, i) => (
              <ListItem
                key={i}
                hideChevron={true}
                title={l.Parking_Name+l.ParkOrder_EnterGateName}
                subtitle={
                  <View style={{flexDirection: 'row'}}>
                    <Text style={MainStyle.innerLabel}>{l.ParkOrderStatus_Name}</Text>
                    <Text style={MainStyle.innerLabel}>{l.ParkOrder_EnterTime}</Text>
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
