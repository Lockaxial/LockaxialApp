/**
*登录页面,当检测未登录时，显示此页面进行登录
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
import {auth} from '../comm/appConf';
import Format from '../util/format';

const LABEL_MOBILE='mobile';
const LABEL_PASSWORD='password';
const LABEL_REPASSWORD='repassword';
const LABEL_VERIFY_CODE='verify code';
const LABEL_REALNAME='realname';
const LABEL_REGISTER='register';
const MSG_NEED_USER='need account';
const MSG_NEED_PASSWORD='need password';
const MSG_NOTSAME_PASSWORD='not same password';
const MSG_NEED_REALNAME='need realname';
const MSG_NEED_CODE='must input code';
const MSG_WRONG_CODE='wrong code';
const MSG_DUPLICATED_ACCOUNT='duplicated account';
const MSG_REGISTER_SUCCESS='register success';
const MSG_WRONG_MOBILE='wrong mobile';
const MSG_WRONG_MOBILE_LENGTH='wrong mobile len';

export default class RegisterScreen extends NormalScreen {
  constructor(props) {
    super(props);
    this.state={
      account:{
        mobile:"",
        realname:"",
        password:"",
        repassword:"",
        code:""
      }
    };
  }

  /**
  *注册账户
  */
  register(){
    let _this=this;
    if(this.state.account.mobile.length==0){
        this.openInfoDialog(null,trans(MSG_NEED_USER));
        return;
    }
    if(this.state.account.realname.length==0){
        this.openInfoDialog(null,trans(MSG_NEED_REALNAME));
        return;
    }
    if(this.state.account.password.length==0){
        this.openInfoDialog(null,trans(MSG_NEED_PASSWORD));
        return;
    }
    if(this.state.account.password!=this.state.account.repassword){
        this.openInfoDialog(null,trans(MSG_NOTSAME_PASSWORD));
        return;
    }
    if(this.state.account.code.length==0){
        this.openInfoDialog(null,trans(MSG_NEED_CODE));
        return;
    }
    auth.verifySms(this.state.account.mobile,this.state.account.code,function(verifySmsCode){
      if(verifySmsCode==0){
        accountDao.register(_this.state.account,function(result){
          if(result.code==0){
            toastX(MSG_REGISTER_SUCCESS);
            _this.back();
          }else if(result.code==1){
            toastX(MSG_DUPLICATED_ACCOUNT);
          }
        });
      }else{
        toastX(MSG_WRONG_CODE); //验证码失效
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
          {/* <Image source={require('../image/logo.png')} style={{ alignSelf: 'center', marginTop: 30, marginBottom: 10,width:80,height:80 }} /> */}
          <TextInput style={MainStyle.textInput} placeholder={trans(LABEL_MOBILE)} value={this.state.account.mobile} onChangeText={(text)=>{this.state.account.mobile=text;this.setState(this.state);}}/>
          <SmsVerifyWidget placeholder={trans(LABEL_VERIFY_CODE)} value={this.state.account.code} onChangeText={(text)=>{this.state.account.code=text;this.setState(this.state);}} onSendSms={()=>this.onSendSms()} onMobileCheck={()=>this.onMobileCheck()}/>
          <TextInput style={MainStyle.textInput} placeholder={trans(LABEL_PASSWORD)} secureTextEntry value={this.state.account.password} onChangeText={(text)=>{this.state.account.password=text;this.setState(this.state);}}/>
          <TextInput style={MainStyle.textInput} placeholder={trans(LABEL_REPASSWORD)} secureTextEntry value={this.state.account.repassword} onChangeText={(text)=>{this.state.account.repassword=text;this.setState(this.state);}}/>
          <TextInput style={MainStyle.textInput} placeholder={trans(LABEL_REALNAME)} value={this.state.account.realname} onChangeText={(text)=>{this.state.account.realname=text;this.setState(this.state);}}/>
          <View style={{paddingTop:10,paddingLeft:5,paddingRight:5,flexDirection:'row',alignItems:'center'}}>
            <View style={{flex:1}}><Button onPress={()=>this.back()} title={trans('cancel')}/></View>
            <View style={{flex:1}}><Button backgroundColor='#007aff' onPress={()=>this.register()} title={trans(LABEL_REGISTER)}/></View>
          </View>
        </View>
      </View>
    );
  }
}
