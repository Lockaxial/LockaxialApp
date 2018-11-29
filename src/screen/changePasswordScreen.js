/**
*修改密码页面
*/
import React, { Component } from 'react';
import {
  View,Text,TextInput
} from 'react-native';
import {Button} from 'react-native-elements';

import NormalScreen from './normalScreen';
import trans from '../i18/trans';
import MainStyle from '../style/mainStyle';
import {toast,toastX} from '../util/tools';
import accountDao from '../model/accountDao';

const LABEL_OLDPASSWORD='old password';
const LABEL_NEWPASSWORD='new password';
const LABEL_REPASSWORD='repassword';

const MSG_NEED_OLD='need old password';
const MSG_NEED_NEW='need new password';
const MSG_NOT_SAME='not same password';
const MSG_PASSWORD_ERROR='old password wrong';


export default class ChangePasswordScreen extends NormalScreen {
  constructor(props) {
    super(props);
    this.state={
      oldPassword:'',
      newPassword:'',
      rePassword:''
    };
  }

  /**
  *修改密码
  */
  changePassword(){
    let _this=this;
    if(this.state.oldPassword.length==0){
      toastX(MSG_NEED_OLD);
      return;
    }
    if(this.state.newPassword.length==0){
      toastX(MSG_NEED_NEW);
      return;
    }
    if(this.state.rePassword!=this.state.newPassword){
      toastX(MSG_NOT_SAME);
      return;
    }
    accountDao.changePassword(this.state.oldPassword,this.state.newPassword,function(result){
      if(result.code==0){
        _this.back();
      }else if(result.code==1){
        toastX(MSG_PASSWORD_ERROR);
      }
    });
  }

  render() {
    return (
      <View style={MainStyle.screen}>
        <TextInput style={MainStyle.textInput} placeholder={trans(LABEL_OLDPASSWORD)} secureTextEntry onChangeText={(text)=>{this.state.oldPassword=text;this.setState(this.state);}}/>
        <TextInput style={MainStyle.textInput} placeholder={trans(LABEL_NEWPASSWORD)} secureTextEntry onChangeText={(text)=>{this.state.newPassword=text;this.setState(this.state);}}/>
        <TextInput style={MainStyle.textInput} placeholder={trans(LABEL_REPASSWORD)} secureTextEntry onChangeText={(text)=>{this.state.rePassword=text;this.setState(this.state);}}/>
        <View style={{paddingTop:10,paddingLeft:5,paddingRight:5,flexDirection:'row',alignItems:'center'}}>
          <View style={{flex:1}}><Button onPress={()=>this.back()} title={trans('cancel')}/></View>
          <View style={{flex:1}}><Button backgroundColor='#007aff' onPress={()=>this.changePassword()} title={trans('confirm')}/></View>
        </View>
      </View>
    );
  }
}
