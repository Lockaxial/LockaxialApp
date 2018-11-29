/**
*创建访客密码页面
*/
import React, { Component } from 'react';
import {
  TouchableOpacity,View,Picker,Text,TextInput
} from 'react-native';
import {ButtonGroup,Button} from 'react-native-elements';
import DatetimeWidget from '../component/datetimeWidget';

import NormalScreen from './normalScreen';
import MainStyle from '../style/mainStyle';
import trans from '../i18/trans';
import {toast,toastX} from '../util/tools';
import Format from '../util/format';
import accountDao from '../model/accountDao';
import visitorAccessDao from '../model/visitorAccessDao';

const LABELCHOOSE_LOCK='choose lock';
const LABEL_PEROID_TO='peroid to';
const LABEL_CONFIRM='confirm';
const LABEL_CANCEL='cancel';

export default class VisitorCreateScreen extends NormalScreen {
  constructor(props) {
    super(props);
    this.state={
      tabIndex:0,
      realname:'',
      mobile:'',
      enterTime:1,
      endDate:new Date(new Date().getTime()+7*24*60*60*1000)
    }
  }

  /**
  *保存一个访客密码
  */
  saveTemppKey(){
    let _this=this;
    if(this.state.tabIndex==0){
      if(!_this.state.enterTime||_this.state.enterTime<0){
          _this.openInfoDialog(null,trans('times limit large than 1'));
          return;
      }
    }else{
      if((_this.state.endDate.getTime()-new Date().getTime())>1000*60*60*24*7){
          _this.openInfoDialog(null,trans('peroid limit in 7 days'));
          return;
      }
    }
    var newKey={
        communityId:accountDao.userInfo.communityId,
        userId:accountDao.userInfo.rid,
        unitId:accountDao.userInfo.unitId,
        unitNo:accountDao.currentUnit.unitNo,
        state:"N",
        realname:this.state.realname,
        mobile:this.state.mobile,
        enterTime:this.state.enterTime,
        endDate:Format.fromDateToStr(_this.state.endDate,"yyyy-MM-dd hh:mm:ss")
    };
    visitorAccessDao.save(newKey,function(result){
      if (result.code == 0) {
          let newKey=result.newKey;
          if(_this.props.afterCreated){
            _this.props.afterCreated(newKey);
          };
          _this.back();
      }
    });
  }

  onRealnameChange(text){
    this.state.realname=text;
    this.setState(this.state);
  }

  onMobileChange(text){
    this.state.mobile=text;
    this.setState(this.state);
  }

  onEnterTimeChange(text){
    this.state.enterTime=parseInt(text);
    if(!this.state.enterTime){
      this.state.enterTime="";
    }
    this.setState(this.state);
  }

  onSwitchType(index){
    if(this.state.tabIndex!=index){
      this.state.tabIndex=index;
      if(index==0){
        this.state.enterTime=1;
      }else{
        this.state.enterTime=-1;
      }
      this.setState(this.state);
    }
  }

  chooseDatetime(date){
    this.state.endDate=date;
    this.setState(this.state);
  }

  render() {
    return (
      <View style={MainStyle.screen}>
        <TextInput style={MainStyle.textInput} maxLength={15} placeholder={trans('realname')} style={MainStyle.textInput} onChangeText={(text)=>this.onRealnameChange(text)}/>
        <TextInput style={MainStyle.textInput} maxLength={11} placeholder={trans('mobile')} style={MainStyle.textInput} onChangeText={(text)=>this.onMobileChange(text)}/>
        <ButtonGroup
          onPress={(index)=>this.onSwitchType(index)}
          selectedIndex={this.state.tabIndex}
          buttons={[trans('times limit'),trans('peroid limit')]}
          containerStyle={{height: 30}} />
        {
          this.state.tabIndex==0?(
            <TextInput style={MainStyle.textInput} maxLength={2} value={""+this.state.enterTime} placeholder={trans('can use')} style={MainStyle.textInput} onChangeText={(text)=>this.onEnterTimeChange(text)}/>
          ):(
            <DatetimeWidget date={this.state.endDate} mode="datetime" onChange={(date)=>this.chooseDatetime(date)}/>
          )
        }
        <View style={{paddingTop:10,paddingLeft:5,paddingRight:5,flexDirection:'row',alignItems:'center'}}>
          <View style={{flex:1}}><Button onPress={()=>this.back()} title={trans(LABEL_CANCEL)}/></View>
          <View style={{flex:1}}><Button backgroundColor='#007aff' onPress={()=>this.saveTemppKey()} title={trans(LABEL_CONFIRM)}/></View>
        </View>
      </View>
    );
  }
}
