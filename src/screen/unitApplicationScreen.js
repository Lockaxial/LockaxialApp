/**
*房屋申请页面
*/
import React, { Component } from 'react';
import {
  View,ScrollView,Text,DeviceEventEmitter,Picker,TextInput
} from 'react-native';
import {List,ListItem,Button} from 'react-native-elements';

import NormalScreen from './normalScreen';
import Selection from '../component/selection';
import trans from '../i18/trans';
import {toast,toastX} from '../util/tools';
import accountDao from '../model/accountDao';
import unitApplicationDao from '../model/unitApplicationDao';
import MainStyle from '../style/mainStyle';
import SmsVerifyWidget from '../component/smsVerifyWidget';
import {auth} from '../comm/appConf';
const LABEL_CHOOSE_UNIT="choose unit";
const LABEL_CITY="city";
const LABEL_COMMUNITY="community";
const LABEL_BLOCK="block";
const LABEL_UNIT="unit";
const LABEL_APPLICATION="application info";
const LABEL_NAME="name";
const LABEL_MOBILE="mobile";
const LABEL_IDENTIFY="identify";
const LABEL_USER_TYPE="user type";
const LABEL_OWNER='owner';
const LABEL_FAMILY='family';
const LABEL_TENANT='tenant';
const LABEL_OWNER_SENCE='owner sence';
const LABEL_OTHER_SENCE='other sence';
const LABEL_OWNER_MOBILE='owner mobile';
const LABEL_VERIFY_CODE='verify code';
const LABEL_SEND_CODE='send code';
const MSG_MUST_CHOOSE_UNIT='must choose unit';
const MSG_DUPLICATED_UNIT='duplicated unit';
const MSG_MUST_CHOOSE_MOBILE='must choose mobile';
const MSG_MUST_INPUT_CODE='must input code';
const MSG_APPLICATION_SENT='application sent';
const MSG_WRONG_CODE='wrong code';
const MSG_DUPLICATED_APPLICATION='duplicated application';
const MSG_INCORRECT_IDENTITY='incorrect ID card';

const  REG_IDENTITY = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/i;

export default class UnitApplicationScreen extends NormalScreen {

  constructor(props) {
    super(props);
    unitApplicationDao.clear();
    this.state={
      choosedData:unitApplicationDao.choosedData,
      unitApplication:{
        realname:accountDao.userDetail.realname,
        mobile:accountDao.userDetail.mobile,
        cardNo:"",
        unitId:0,
        communityId:0,
        userType:"O",
        code:"",
        ownerMobile:""
      },
      ownerList:[]
    }
  }

  /**
  *当此组件中显示完成后，注册一个changeUnitApplication事件侦听，当申请数据产生变化时，更新显示
  */
  componentDidMount(){
    this.subscription = DeviceEventEmitter.addListener('changeUnitApplication',(data)=>this.changeUnitApplication(data)); //注册一个changeUnitApplication消息，触发该消息时调用更新广告
  }

  /**
  *组件删除后，一并删除事件侦听
  */
  componentWillUnmount(){
    this.subscription.remove(); //页面销毁时注销消息事件
  }

  changeUnitApplication(){
    this.state.choosedData=unitApplicationDao.choosedData;
    this.state.ownerList=unitApplicationDao.ownerList;
    this.state.unitApplication.userType="O";
    if(unitApplicationDao.ownerList&&unitApplicationDao.ownerList.length>0){
      this.state.unitApplication.ownerMobile=unitApplicationDao.ownerList[0].mobile;
    }
    this.setState(this.state);
  }

  startChooseCity(){
    let _this=this;
    unitApplicationDao.initCityList(function(){
      _this.openScreen("UnitCityScreen");
    });
  }

  startChooseCommunity(){
    let _this=this;
    unitApplicationDao.initCommunityList(function(){
      _this.openScreen("UnitCommunityScreen");
    });
  }

  startChooseBlock(){
    let _this=this;
    unitApplicationDao.initBlockList(function(){
      _this.openScreen("UnitBlockScreen");
    });
  }

  startChooseUnit(){
    let _this=this;
    unitApplicationDao.initUnitList(function(){
      _this.openScreen("UnitChooseScreen");
    });
  }

  chooseUserType(type){
    if(this.state.unitApplication.userType!=type){
      this.state.unitApplication.userType=type;
      this.setState(this.state);
    }
  }

  chooseOwnerMobile(mobile){
    this.state.unitApplication.ownerMobile=mobile;
    this.setState(this.state);
  }

  saveApplication(){
    let _this=this;
    if(this.state.choosedData.unitId==0){
        this.openInfoDialog(null,trans(MSG_MUST_CHOOSE_UNIT));
        return;
    }
    for(var i=0;i<this.state.ownerList.length;i++){
        if(this.state.ownerList[i].rid==accountDao.userInfo.rid){
            this.openInfoDialog(null,trans(MSG_DUPLICATED_UNIT));
            return;
        }
    }
    if(this.state.unitApplication.userType!="O"&&!this.state.unitApplication.ownerMobile){
        this.openInfoDialog(null,trans(MSG_MUST_CHOOSE_MOBILE));
        return;
    }
    if(this.state.unitApplication.userType!="O"&&this.state.unitApplication.code==""){
        this.openInfoDialog(null,trans(MSG_MUST_INPUT_CODE));
        return;
    }
    if(unitApplicationDao.choosedData.needIdentity=='Y'){
        if(!REG_IDENTITY.test(this.state.unitApplication.cardNo)){
          this.openInfoDialog(null,trans(MSG_INCORRECT_IDENTITY));
          return;
        }
    }
    this.checkVerifyCode(this.state.unitApplication.ownerMobile,this.state.unitApplication.code,function(isSuccess){
        if(isSuccess){
            _this.state.unitApplication.unitId=_this.state.choosedData.unitId;
            _this.state.unitApplication.communityId=_this.state.choosedData.communityId;
            unitApplicationDao.saveUnitApplication(_this.state.unitApplication,function(result){
                if(result.code==0){
                    if(result.data&&result.data.length>0){
                        accountDao.addNewUnit(result.data);
                    }else if(_this.state.unitApplication.userType=="O"){
                        toastX(MSG_APPLICATION_SENT);
                    }
                    _this.back();
                }else if(result.code==1){
                    _this.openInfoDialog(null,trans(MSG_WRONG_CODE));
                }else if(result.code==3){
                    _this.openInfoDialog(null,trans(MSG_DUPLICATED_APPLICATION));
                }else{
                    _this.openInfoDialog(null,"system error");
                }
            });
        }else{
            _this.openInfoDialog(null,trans(MSG_WRONG_CODE));
        }
    });
  }

  checkVerifyCode(mobile,code,cb){
    if(this.state.unitApplication.userType=="O"){
      cb(true);
    }else{
      auth.verifySms(mobile,code,function(resultCode){
        if(resultCode==0){
          cb(true);
        }else{
          cb(false);
        }
      });
    }
  }

  onSendSms(){
    if(!this.state.unitApplication.ownerMobile){
      toastX('choose owner mobile');
      return;
    }
    auth.sendSms(this.state.unitApplication.ownerMobile,function(){});
  }

  onMobileCheck(){
    return true;
  }

  render() {
    let mobileList=[];
    for(let i=0;i<this.state.ownerList.length;i++){
      mobileList.push({key:this.state.ownerList[i].mobile,value:this.state.ownerList[i].mobile});
    }
    return (
      <View style={MainStyle.screen}>
        <ScrollView>
          <Text style={MainStyle.label}>{trans(LABEL_CHOOSE_UNIT)}</Text>
          <List containerStyle={MainStyle.list}>
            <ListItem
              title={trans(LABEL_CITY)}
              rightTitle={this.state.choosedData.city}
              onPress={()=>this.startChooseCity()}
            />
            <ListItem
              title={trans(LABEL_COMMUNITY)}
              rightTitle={this.state.choosedData.communityName}
              onPress={()=>this.startChooseCommunity()}
            />
            <ListItem
              title={trans(LABEL_BLOCK)}
              rightTitle={(this.state.choosedData.blockNo==this.state.choosedData.blockName)?this.state.choosedData.blockName:(this.state.choosedData.blockNo+'-'+this.state.choosedData.blockName)}
              onPress={()=>this.startChooseBlock()}
            />
            <ListItem
              title={trans(LABEL_UNIT)}
              rightTitle={this.state.choosedData.unitName}
              onPress={()=>this.startChooseUnit()}
            />
          </List>
          <Text style={MainStyle.label}>{trans(LABEL_APPLICATION)}</Text>
          <TextInput style={MainStyle.textInput} placeholder={trans(LABEL_NAME)} value={this.state.unitApplication.realname} onChangeText={(text)=>{this.state.unitApplication.realname=text;this.setState(this.state);}}/>
          <TextInput style={MainStyle.textInput} placeholder={trans(LABEL_MOBILE)} value={this.state.unitApplication.mobile} onChangeText={(text)=>{this.state.unitApplication.mobile=text;this.setState(this.state);}}/>
          {
            unitApplicationDao.choosedData.needIdentity=='Y'?(
              <TextInput style={MainStyle.textInput} placeholder={trans(LABEL_IDENTIFY)} value={this.state.unitApplication.cardNo} onChangeText={(text)=>{this.state.unitApplication.cardNo=text;this.setState(this.state);}}/>
            ):(null)
          }          
          <Selection data={[{key:"O",value:trans(LABEL_OWNER)},{key:"F",value:trans(LABEL_FAMILY)},{key:"R",value:trans(LABEL_TENANT)}]}
            selectedValue={this.state.unitApplication.userType}
            onValueChange={(type)=>this.chooseUserType(type)}/>

          {
            this.state.unitApplication.userType!='O'?(
              <View>
                <Text style={MainStyle.label}>{trans(LABEL_OTHER_SENCE)}</Text>
                <View>
                  <Text style={MainStyle.label}>{trans(LABEL_OWNER_MOBILE)}</Text>
                  <Selection data={mobileList}
                    selectedValue={this.state.unitApplication.ownerMobile}
                    onValueChange={(mobile)=>this.chooseOwnerMobile(mobile)}/>
                  <SmsVerifyWidget placeholder={trans(LABEL_VERIFY_CODE)} onChangeText={(text)=>{this.state.unitApplication.code=text;this.setState(this.state);}} onSendSms={()=>this.onSendSms()} onMobileCheck={()=>this.onMobileCheck()}/>
                </View>
              </View>
              ):(
                <Text style={MainStyle.label}>{trans(LABEL_OWNER_SENCE)}</Text>
              )
          }
          <View style={{paddingTop:10,paddingLeft:5,paddingRight:5,paddingBottom:20,flexDirection:'row',alignItems:'center'}}>
            <View style={{flex:1}}><Button onPress={()=>this.back()} title={trans('cancel')}/></View>
            <View style={{flex:1}}><Button backgroundColor='#007aff' title={trans('application')} onPress={()=>this.saveApplication()}/></View>
          </View>
        </ScrollView>
      </View>
    );
  }
}
