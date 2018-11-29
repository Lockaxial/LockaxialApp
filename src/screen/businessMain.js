/**
*周边商圈子页面
*/
import React, { Component } from 'react';
import {
  Text,View,StyleSheet,ScrollView,TouchableOpacity,DeviceEventEmitter
} from 'react-native';

import SubScreen from './subScreen';
import ShopMain from './shopMain';
import MainStyle from '../style/mainStyle';
import trans from '../i18/trans';
import businessDao from '../model/businessDao';
import accountDao from '../model/accountDao';
import TabBar from '../component/tabBar';
import InformPane from '../component/informPane';

export default class BusinessMain extends SubScreen {
  constructor(props) {
    super(props);
      this.state={
        communityId:accountDao.userInfo.communityId,
        initialized:false,
        list:[],
        currentCategoryId:0
      }
      let _this=this;
      businessDao.init(function(result){
        if(result){
          _this.changeList();
        }
      });
  }

  /**
  *当此组件中显示完成后，注册一个changeUserAccount事件侦听，当公告信息产生变化时，更新显示
  */
  componentDidMount(){
    this.subscription = DeviceEventEmitter.addListener('changeUserAccount',(data)=>this.changeUserAccount(data)); //注册一个changeUserAccount消息，触发该消息时调用更新公告栏
  }

  /**
  *组件删除后，一并删除事件侦听
  */
  componentWillUnmount(){
    this.subscription.remove(); //页面销毁时注销消息事件
  }

  changeUserAccount(){
    if(this.state.communityId!=accountDao.userInfo.communityId){
      this.state.communityId=accountDao.userInfo.communityId;
      this.refresh();
    }
  }

  refresh(){
    let _this=this;
    businessDao.clear();
    if(accountDao.userInfo.communityId==0){
      this.state.initialized=false;
      this.state.list=[];
      this.setState(this.state);
    }else{
      businessDao.init(function(result){
        if(result){
          _this.changeList();
        }
      });
    }
  }

  onChangeTab(index){
    if(this.state.currentCategoryId!=this.state.list[index].rid){
      this.state.currentCategoryId=this.state.list[index].rid;
      this.setState(this.state);
      DeviceEventEmitter.emit('changeShopList',{categoryId:this.state.currentCategoryId});
    }
  }

  /**
  *更新论坛列表数据
  */
  changeList(){
    this.state.list=businessDao.list;
    this.state.initialized=true;
    if(this.state.list.length>0){
      this.state.currentCategoryId=this.state.list[0].rid;
    }
    this.setState(this.state);
  }

  render() {
    if(accountDao.userInfo.communityId==0){
      return(
        <InformPane title={trans('no community')}/>
      );
    }else if(!this.state.initialized){
      return(
        <InformPane title={trans('loading')}/>
      );
    }else if(this.state.list.length==0){
      return(
        <InformPane title={trans('no shop category')}/>
      );
    }else{
      let tabTitles=[];
      for(let i=0;i<this.state.list.length;i++){
        tabTitles.push(this.state.list[i].categoryName);
      }
      return (
        <View style={MainStyle.subScreen}>
          <TabBar items={tabTitles}
            callback={(index)=>this.onChangeTab(index)}
            backgroundColor={MainStyle.tabBar.backgroundColor}
            textColor={MainStyle.tabBar.textColor}
            selectedTextColor={MainStyle.tabBar.selectedTextColor}
            itemSpacing={MainStyle.tabBar.itemSpacing}
            height={MainStyle.tabBar.height}
          />
          <ShopMain categoryId={this.state.currentCategoryId} navigator={this.props.navigator}/>
          {/* <ScrollableTabView
            style={{marginTop: 0}}
            tabBarUnderlineStyle={{backgroundColor:'#007aff'}}
            tabBarActiveTextColor ='#007aff'
            renderTabBar={() => <ScrollableTabBar/>}>
            {
              this.state.list.map((item,i)=>
                <ShopMain key={item.rid} tabLabel={item.categoryName} item={item} navigator={this.props.navigator}/>
              )
            }
          </ScrollableTabView> */}
        </View>
      );
    }
  }
}
