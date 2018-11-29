/**
*商铺列表页面
*/
import React, { Component } from 'react';
import {
  Text,View,StyleSheet,ListView,TouchableOpacity,DeviceEventEmitter
} from 'react-native';
import {Icon} from 'react-native-elements';

import SubListScreen from './subListScreen';
import ShopPane from '../component/shopPane';
import MainStyle from '../style/mainStyle';
import trans from '../i18/trans';
import {toastX,toast} from '../util/tools';
import businessDao from '../model/businessDao';

const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

export default class ShopMain extends SubListScreen {
  shopDao=null;

  constructor(props) {
    super(props);
      this.state={
        categoryId:this.props.categoryId,
        list:ds.cloneWithRows([])
      }
      let _this=this;
      this.shopDao=businessDao.getShopDao(this.state.categoryId);
      this.shopDao.init(function(result){
        if(result){
          _this.changeList();
        }
      });
  }

  /**
  *当此组件中显示完成后，注册一个changeShopList事件侦听，当广告数据产生变化时，更新广告显示
  */
  componentDidMount(){
    this.subscription = DeviceEventEmitter.addListener('changeShopList',(data)=>this.changeShopList(data)); //注册一个changeShopList消息，触发该消息时调用更新广告
  }

  /**
  *组件删除后，一并删除事件侦听
  */
  componentWillUnmount(){
    this.subscription.remove(); //页面销毁时注销消息事件
  }

  changeShopList(data){
    let _this=this;
    if(data.categoryId!=this.state.categoryId){
      this.state.categoryId=data.categoryId;
      this.shopDao=businessDao.getShopDao(this.state.categoryId);
      this.shopDao.init(function(result){
        _this.changeList();
      });
      this.changeList();
    }else{
      this.changeList();
    }
  }

  /**
  *更新论坛列表数据
  */
  changeList(){
    this.state.list=ds.cloneWithRows(this.shopDao.list);
    this.setState(this.state);
  }

  /**
  *打开商铺详情
  */
  openShop(shopId){
    this.openScreen('ShopDetailScreen',{
      categoryId:this.state.categoryId,
      shopId:shopId
    });
  }

  /**
  *相应列表更新后的事件
  */
  onPageRefresh(){
    if(this.beforeListRefresh()){
      return;
    }
    var _this=this;
    this.shopDao.load(function(result){
      _this.afterListRefresh(result.data.length);
      _this.changeList();
    });
  }

  render() {
    return(
      <View>
        <ListView
          enableEmptySections
          dataSource={this.state.list}
          onEndReached={()=>this.onPageRefresh()}
          onEndReachedThreshold={10}
          renderFooter={()=>this.renderRooter()}
          renderRow={(item, sectionID, rowID) =>
            <ShopPane type="list" onPress={()=>this.openShop(item.rid)} key={rowID} size={{width:3,height:2}}
              categoryId={this.state.categoryId} item={item} screen={this}>
            </ShopPane>
          }>
        </ListView>
      </View>
    );
  }
}
