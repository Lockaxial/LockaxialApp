/**
 *修改账户号
 */
import React, { Component } from 'react';
import {
    View,Text,TextInput,Image,TouchableOpacity
} from 'react-native';
import {Button} from 'react-native-elements';

import SmsVerifyWidget from '../component/smsVerifyWidget';
import NormalScreen from './normalScreen';
import MainStyle from '../style/mainStyle';
import trans from '../i18/trans';
import {toast,toastX} from '../util/tools';
import accountDao from '../model/accountDao';
import Format from '../util/format';
import {auth} from '../comm/appConf';

const LABEL_MOBILE='mobile';
const LABEL_VERIFY_CODE='verify code';
const LABEL_CONFIRM='confirm';
const MSG_NEED_USER='need account';
const MSG_NEED_CODE='must input code';
const MSG_WRONG_CODE='wrong code';
const MSG_DUPLICATED_ACCOUNT='duplicated account';
const MSG_REGISTER_SUCCESS='register success';
const MSG_WRONG_MOBILE='wrong mobile';
const MSG_WRONG_MOBILE_LENGTH='wrong mobile len';
const MSG_CHANGE_ACCOUNT='confirm change account';

export default class ChangeAccountScreen extends NormalScreen {
  constructor(props) {
    super(props);
    this.state={
      account:{
        mobile:"",
        code:""
      }
    };
  }

  /**
   *修改账户
   */
  changeAccount(){
    let _this=this;
    this.openConfirmDialog(null,MSG_CHANGE_ACCOUNT,function(){
      _this.changeAccountDirectly();
    });
  }

  changeAccountDirectly(){
    let _this=this;
    if(this.state.account.mobile.length==0){
      this.openInfoDialog(null,trans(MSG_NEED_USER));
      return;
    }
    if(this.state.account.code.length==0){
      this.openInfoDialog(null,trans(MSG_NEED_CODE));
      return;
    }
    auth.verifySms(this.state.account.mobile,this.state.account.code,function(verifySmsCode){
      if(verifySmsCode==0){
        accountDao.changeAccount(_this.state.account.mobile,function(result){
          if(result.code==0){
            toastX(MSG_REGISTER_SUCCESS);
            _this.back();
            accountDao.logout();
          }else if(result.code==1){
            toastX(MSG_DUPLICATED_ACCOUNT);
          }
        });
      }else{
        toastX(MSG_WRONG_CODE);
      }
    });
  }

  onSendSms(){
    auth.sendSms(this.state.account.mobile,function(){});
  }

  onMobileCheck(){
    if(this.state.account.mobile.length==11){
      if(Format.isMobileNo(this.state.account.mobile)){
        return true;
      }else{
        toastX(MSG_WRONG_MOBILE);
        return false;
      }
    }else{
      toastX(MSG_WRONG_MOBILE_LENGTH);
      return false;
    }
  }

  render() {
    return (
        <View style={MainStyle.screen}>
          <View style={{marginTop:100}}>
            <TextInput style={MainStyle.textInput} placeholder={trans(LABEL_MOBILE)} value={this.state.account.mobile} onChangeText={(text)=>{this.state.account.mobile=text;this.setState(this.state);}}/>
            <SmsVerifyWidget placeholder={trans(LABEL_VERIFY_CODE)} value={this.state.account.code} onChangeText={(text)=>{this.state.account.code=text;this.setState(this.state);}} onSendSms={()=>this.onSendSms()} onMobileCheck={()=>this.onMobileCheck()}/>
            <View style={{paddingTop:10,paddingLeft:5,paddingRight:5,flexDirection:'row',alignItems:'center'}}>
              <View style={{flex:1}}><Button onPress={()=>this.back()} title={trans('cancel')}/></View>
              <View style={{flex:1}}><Button backgroundColor='#007aff' onPress={()=>this.changeAccount()} title={trans(LABEL_CONFIRM)}/></View>
            </View>
          </View>
        </View>
    );
  }
}
