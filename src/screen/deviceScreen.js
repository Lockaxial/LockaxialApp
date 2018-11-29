/**
*设备列表页面
*/
import React, { Component } from 'react';
import {
  View,Text,TextInput
} from 'react-native';
import {List,ListItem} from 'react-native-elements';

import reactBridge from '../bridge/reactBridge';
import NormalScreen from './normalScreen';
import InformPane from '../component/informPane';
import PhotoScreen from './photoScreen';
import MainStyle from '../style/mainStyle';
import trans from '../i18/trans';
import {toast,toastX} from '../util/tools';
import deviceDao from '../model/deviceDao';

export default class DeviceScreen extends NormalScreen {
  constructor(props) {
    super(props);
    this.state={
      list:[]
    }
    let _this=this;
    deviceDao.init(function(result){
      _this.changeList();
    });
  }

  openDevice(index){
    if(this.props.type=='P'){
      this.openDevicePhoto();
    }else if(this.props.type=='F'){
      let deviceMac=deviceDao.list[index].deviceMac;
      deviceMac=deviceMac.replace(/\:/g,'');
      reactBridge.sendMainMessage(50001, deviceMac);
    }
  }

  openDevicePhoto(){
    let _this=this;
    if(deviceDao.list[index].deviceMac==deviceDao.deviceMac){
      _this.openScreen('PhotoScreen');
    }else{
      deviceDao.getImages(deviceDao.list[index].deviceMac,function(){
        _this.openScreen('PhotoScreen');
      });
    }
  }

  changeList(){
    this.state.list=deviceDao.list;
    this.setState(this.state);
  }

  renderNoDevice(){
    return(
      <InformPane title={trans('no device')}/>
    );
  }

  renderPhotoScreen(){
    return(
      <PhotoScreen/>
    );
  }

  renderList(){
    return(
      <View style={MainStyle.screen}>
        <List containerStyle={MainStyle.list}>
          {
            this.state.list.map((item,i)=>
              <ListItem onPress={()=>this.openDevice(i)} key={i} title={item.deviceMac}></ListItem>
            )
          }
        </List>
      </View>
    );
  }

  render() {
    if(this.state.list&&this.state.list.length==0){
      return this.renderNoDevice();
    }else if(this.state.list.length==1){
      if(this.props.type=='P'){
        return this.renderPhotoScreen();
      }
    }else{
      return this.renderList();
    }
  }
}
