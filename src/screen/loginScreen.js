/**
*登录页面,当检测未登录时，显示此页面进行登录
*/
import React, { Component } from 'react';
import {
  View,Text,TextInput,Image
} from 'react-native';
import {Button} from 'react-native-elements';

import NormalScreen from './normalScreen';
import MainStyle from '../style/mainStyle';
import trans from '../i18/trans';
import {toast,toastX} from '../util/tools';
import accountDao from '../model/accountDao';

const LABEL_ACCOUNT='account';
const LABEL_PASSWORD='password';
const LABEL_SIGN_UP='sign up';
const LABEL_REGISTER='register';
const LABEL_LOGIN='login';
const MSG_USER_ERROR='no account';
const MSG_PASSWORD_ERROR='password wrong';

export default class LoginScreen extends NormalScreen {
  constructor(props) {
    super(props);
    this.state={
      account:accountDao.account
    };
  }

  /**
  *根据用户名及密码，登录APP
  */
  login(){
    let _this=this;
    if(this.state.account.username.length==0){
      toastX(MSG_USER_ERROR);
      return;
    }
    accountDao.login(this.state.account.username,this.state.account.password,function(result){
      if(result.code==0){
        _this.back();
      }else if(result.code==1){
        toastX(MSG_USER_ERROR);
      }else if(result.code==2){
        toastX(MSG_PASSWORD_ERROR);
      }
    });
  }

  register(){
      this.openScreen('RegisterScreen');
  }

  render() {
    return (
      <View style={MainStyle.screen}>
        <View style={{marginTop:100}}>
          <TextInput style={MainStyle.textInput} placeholder={trans(LABEL_ACCOUNT)} value={this.state.account.username} onChangeText={(text)=>{this.state.account.username=text;this.setState(this.state);}}/>
          <TextInput style={MainStyle.textInput} placeholder={trans(LABEL_PASSWORD)} secureTextEntry value={this.state.account.password} onChangeText={(text)=>{this.state.account.password=text;this.setState(this.state);}}/>
          <View style={{paddingTop:10,paddingLeft:5,paddingRight:5,flexDirection:'row',alignItems:'center'}}>
            <View style={{flex:1}}><Button onPress={()=>this.register()} title={trans(LABEL_REGISTER)}/></View>
            <View style={{flex:1}}><Button backgroundColor='#007aff' onPress={()=>this.login()} title={trans(LABEL_SIGN_UP)}/></View>
          </View>
        </View>
      </View>
    );
  }
}
