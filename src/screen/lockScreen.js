/**
*社区门禁，打开门禁清单，直接开门
*/
import React, { Component } from 'react';
import {
  View,ListView,Text,DeviceEventEmitter
} from 'react-native';
import {List,ListItem} from 'react-native-elements';

import NormalScreen from './normalScreen';
import trans from '../i18/trans';
import {toastX,toast} from '../util/tools';
import accountDao from '../model/accountDao';
import MainStyle from '../style/mainStyle';
import reactBridge from '../bridge/reactBridge';

const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2}); //用于产生list的数据源
const LOCK_LIST='lock list';
const BLE_LOCK_LIST='ble lock list';

export default class LockScreen extends NormalScreen {
  constructor(props) {
    super(props);
    this.state={
      bleList:[],
      list:ds.cloneWithRows(accountDao.communityLockList)
    };
  }

  /**
   *当此组件中显示完成后，注册事件侦听，当公告信息产生变化时，更新显示
   */
  componentDidMount() {
      this.subscription1 = DeviceEventEmitter.addListener('findBleDevice', (data)=>this.onNewBleDevice(data));
      this.subscription2 = DeviceEventEmitter.addListener('openBleLockFailed', (data)=>this.openBleLockFailed(data));
      this.subscription3 = DeviceEventEmitter.addListener('openBleLockSuccess', (data)=>this.openBleLockSuccess(data));
      reactBridge.sendMainMessage(60001, null);
  }

  /**
   *组件删除后，一并删除事件侦听
   */
  componentWillUnmount() {
      this.subscription1.remove();
      this.subscription2.remove();
      this.subscription3.remove();
      reactBridge.sendMainMessage(60006, null);
  }

  isInBleList(data){
    var result=false;
    for(var i=0;i<this.state.bleList.length;i++){
      var thisName="NPBLE-"+this.state.bleList[i].lockKey;
      thisName=thisName.toUpperCase();
      if(thisName==data.deviceName.toUpperCase()){
        result=true;
        break;
      }
    }
    return result;
  }

  onNewBleDevice(data){
    if(this.isInBleList(data)){
      return;
    }
    for(var i=0;i<accountDao.communityLockList.length;i++){
      var thisName="NPBLE-"+accountDao.communityLockList[i].lockKey;
      thisName=thisName.toUpperCase();
      if(thisName==data.deviceName.toUpperCase()){
        this.state.bleList.push(accountDao.communityLockList[i]);
        if(this.state.bleList.length==1){
          this.openBleLock(0);
        }
        toastX('new ble lock');
        this.setState(this.state);
        break;
      }
    }
  }

  openBleLockFailed(data){
    if(data.code==5){
      toastX('time out');
    }else if(data.code!=10){
      toastX('cannot connect to BLE');
    }else if(data.code==10){
      toastX('access invalid');
    }
  }

  openBleLockSuccess(data){
    toastX('open ble lock success');
  }
  /**
  *打开选择的门禁
  */
  openLock(rowID){
    console.log("select Item RowId = "+rowID);
    var item=accountDao.communityLockList[rowID];
    var append="";
    if(accountDao.currentUnit&&accountDao.currentUnit.unitNo){
      append="-"+accountDao.currentUnit.unitNo;
    }
    console.log("send open door item info = "+item.lockKey+append);
    reactBridge.sendMainMessage(20033,item.lockKey+append);  //向原生部分发送消息，打开指定的门禁
  }

  openBleLock(rowID){
    var item=this.state.bleList[rowID];
    var append="";
    if(accountDao.currentUnit&&accountDao.currentUnit.unitNo){
      append="-"+accountDao.userDetail.username+"-"+accountDao.currentUnit.unitNo;
    }
    reactBridge.sendMainMessage(60002,item.lockKey+append);  //向原生部分发送消息，打开指定的门禁
  }

  render() {
    return (
      <View style={MainStyle.screen}>
        {
          this.state.bleList.length>0?(
            <View>
              <Text style={MainStyle.label}>{trans(BLE_LOCK_LIST)}</Text>
              <List containerStyle={MainStyle.list}>
                {
                  this.state.bleList.map((item,i)=>
                    <ListItem onPress={()=>this.openBleLock(i)} key={i}
                      title={item.lockName}>
                    </ListItem>
                  )
                }
              </List>
          </View>
          ):(null)
        }

        <Text style={MainStyle.label}>{trans(LOCK_LIST)+(accountDao.rtcStatus!=10?('('+trans('network error')+')'):'')}</Text>
        <List containerStyle={MainStyle.list}>
          <ListView
            enableEmptySections
            dataSource={this.state.list}
            renderRow={(item, sectionID, rowID) =>
                    <ListItem onPress={()=>this.openLock(rowID)} key={rowID}
                      title={item.lockName}>
                    </ListItem>
                }>
          </ListView>
        </List>
      </View>
    );
  }
}
