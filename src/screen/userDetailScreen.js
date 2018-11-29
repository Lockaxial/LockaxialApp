/**
*修改用户信息页面，上传头像
*/
import React, { Component } from 'react';
import {
  View,Text,TextInput,Image
} from 'react-native';
import {Button} from 'react-native-elements';

import NormalScreen from './normalScreen';
import CoverControl from '../component/coverControl';
import trans from '../i18/trans';
import MainStyle from '../style/mainStyle';
import {toast,toastX} from '../util/tools';
import accountDao from '../model/accountDao';

const LABEL_REALNAME='realname';
const MSG_NEED_REALNAME='need realname';
const MSG_SYSTEM_ERROR='system error';

export default class ChangePasswordScreen extends NormalScreen {
  constructor(props) {
    super(props);
    this.state={
      realname:accountDao.userDetail.realname,
      headimgurl:accountDao.userDetail.headimgurl
    };
  }

  /**
  *保存用户信息
  */
  save(){
    let _this=this;
    if(this.state.realname.length==0){
      toastX(MSG_NEED_REALNAME);
      return;
    }
    accountDao.saveUserInfo(this.state,function(result){
      if(result.code==0){
        _this.back();
      }else{
        toastX(MSG_SYSTEM_ERROR);
      }
    });
  }

  changeCover(cover){
    this.state.headimgurl=cover;
    this.setState(this.state);
  }

  render() {
    return (
      <View style={MainStyle.screen}>
        <View style={{marginTop:30,marginBottom:30,alignItems:'center'}}>
          <CoverControl coverImage={this.state.headimgurl} size={{width:90,height:90}} onChangeCover={(cover)=>this.changeCover(cover)}/>
        </View>
        <TextInput editable={false} style={MainStyle.textInput} placeholder={trans(LABEL_REALNAME)} value={this.state.realname} onChangeText={(text)=>{this.state.realname=text;this.setState(this.state);}}/>
        <View style={{paddingTop:10,paddingLeft:5,paddingRight:5,flexDirection:'row',alignItems:'center'}}>
          <View style={{flex:1}}><Button onPress={()=>this.back()} title={trans('cancel')}/></View>
          <View style={{flex:1}}><Button backgroundColor='#007aff' onPress={()=>this.save()} title={trans('confirm')}/></View>
        </View>
      </View>
    );
  }
}
