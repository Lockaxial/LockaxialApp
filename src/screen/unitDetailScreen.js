/**
*房屋明细页面
*/
import React, { Component } from 'react';
import {
  ScrollView,View,Text,TouchableOpacity
} from 'react-native';
import {List,ListItem} from 'react-native-elements';

import NormalScreen from './normalScreen';
import trans from '../i18/trans';
import {toast,toastX} from '../util/tools';
import MainStyle from '../style/mainStyle';
import UnitDao from '../model/unitDao';
import Filter from '../util/filter';
import accountDao from '../model/accountDao';

const UNIT_DELETE="delete";
const UNIT_TYPE="unit type";
const UNIT_AREA="unit area";
const UNIT_MEMBERS="unit members";
const UNIT_CARS="unit cars";
const MSG_DELETE_MEMBER="delete member confirm";
const MSG_DELETE_CAR="delete car confirm";
const MSG_DELETE_UNIT="delete unit confirm";
const MSG_INPUT_CAR="car NO input";
const MSG_CAR_NO="car NO format";
const MSG_DELETE_UNIT_SUCCESS="delete unit success";

export default class UnitDetailScreen extends NormalScreen {
  static navigatorButtons = {
    rightButtons: [
      {
        title: trans(UNIT_DELETE), // for a textual button, provide the button title (label)
        id: UNIT_DELETE // id for this button, given in onNavigatorEvent(event) to help understand which button was clicked
      }
    ]
  };

  unitDao=new UnitDao(); //

  constructor(props) {
    super(props);
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    let _this=this;
    this.state={
      item:props.item,  //从上页传递过来的参数
      unitMemberList:[],
      unitCarList:[]
    }
    this.unitDao.load(props.item,function(code){  //从数据库加载详细数据
      if(code==0){
        _this.loadData();
      }
    });
  }

  /**
  *处理顶部导航条中的按钮事件
  */
  onNavigatorEvent(event) { // this is the onPress handler for the two buttons together
    if (event.type == 'NavBarButtonPress') { // this is the event type for button presses
      if (event.id == UNIT_DELETE) { // this is the same id field from the static navigatorButtons definition
        this.deleteUnit();
      }
    }
  }

  /**
  *删除房屋
  */
  deleteUnit(){
    let _this=this;
    this.openConfirmDialog(null,MSG_DELETE_UNIT,function(){
      _this.unitDao.delete(function(result){
        if(result.code==0){
          toastX(MSG_DELETE_UNIT_SUCCESS);
          _this.back();
        }else{
          toastX('system error');
        }
      });
    });
  }

  /**
  *从Dao中获得最新数据，并更新页面
  */
  loadData(){
    this.state.unitMemberList=this.unitDao.unitMemberList;
    this.state.unitCarList=this.unitDao.unitCarList;
    this.setState(this.state);
  }
  /**
  *打开新增成员的页面
  */
  openNewMemberScreen(){
    let _this=this;
    this.openInputScreen('create unit member','member name',function(realname){
      if(realname){
        _this.unitDao.saveUnitMember(realname,function(code){
          if(code==0){
            _this.loadData();
          }else{
            toastX('system error');
          }
        });
      }
    });
  }

  /**
  *删除成员
  */
  deleteMember(index){
    let _this=this;
    this.openConfirmDialog(MSG_DELETE_MEMBER,null,function(){
      _this.unitDao.deleteUnitMember(index,function(code){
        if(code==0){
          _this.loadData();
        }else{
          toastX('system error');
        }
      });
    });
  }

  /**
  *删除车辆
  */
  deleteCar(index){
    let _this=this;
    this.openConfirmDialog(MSG_DELETE_CAR,null,function(){
      _this.unitDao.deleteUnitCar(index,function(code){
        if(code==0){
          _this.loadData();
        }else{
          toastX('system error');
        }
      });
    });
  }

  render() {
    return (
      <ScrollView style={MainStyle.screen}>
        <Text style={MainStyle.label}>{this.state.item.unitName}</Text>
        <List containerStyle={MainStyle.list}>
          <ListItem
            title={trans(UNIT_AREA)}
            hideChevron={true}
            rightTitle={this.state.item.unitArea+trans('square meter')}/>
          <ListItem
            title={trans(UNIT_TYPE)}
            hideChevron={true}
            rightTitle={Filter.unitTypeFilter(this.state.item.unitType)}/>
        </List>
        <View style={{flexDirection: 'row'}}>
          <Text style={MainStyle.label}>{trans(UNIT_MEMBERS)}</Text>
          <TouchableOpacity onPress={()=>this.openNewMemberScreen()}><Text style={MainStyle.link}>{trans('create unit member')}</Text></TouchableOpacity>
        </View>
        <List containerStyle={MainStyle.list}>
          {
            this.state.unitMemberList.map((l, i) => (
              <ListItem
                roundAvatar
                avatar={l.headimgurl?{uri:l.headimgurl}:(require('../image/default.png'))}
                key={i}
                hideChevron={true}
                title={l.realname}
                subtitle={
                  <View style={{flexDirection: 'row'}}>
                    <Text style={MainStyle.innerLabel}>{Filter.userTypeFilter(l.userType)}</Text>
                    {
                       (l.userType=='O')?(
                            null
                        ) : (
                            <TouchableOpacity onPress={()=>this.deleteMember(i)}><Text style={MainStyle.innerLink}>{trans('delete')}</Text></TouchableOpacity>
                        )
                    }
                  </View>
                }
              />
            ))
          }
        </List>
      </ScrollView>
    );
  }
}
