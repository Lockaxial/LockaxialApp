/**
*优惠券列表页面
*/
import React, { Component } from 'react';
import {
  Text,View,StyleSheet,ListView,TouchableOpacity,DeviceEventEmitter
} from 'react-native';
import {Icon} from 'react-native-elements';

import SubListScreen from './subListScreen';
import CouponPane from '../component/couponPane';
import MainStyle from '../style/mainStyle';
import trans from '../i18/trans';
import {toastX,toast} from '../util/tools';
import couponDao from '../model/couponDao';

const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

export default class CouponMain extends SubListScreen {

  constructor(props) {
    super(props);
      this.state={
        shopId:this.props.shopId,
        list:ds.cloneWithRows([])
      }
      let _this=this;
      couponDao.init(this.props.shopId,function(result){
        if(result){
          _this.changeList();
        }
      });
  }

  /**
   *当此组件中显示完成后，注册事件侦听，当公告信息产生变化时，更新显示
   */
  componentDidMount() {
      let _this = this;
      this.subscription = DeviceEventEmitter.addListener('useCoupon', (data)=>this.useCoupon(data)); //注册一个reactSendImSuccess消息，触发该消息时提示
  }

  /**
   *组件删除后，一并删除事件侦听
   */
  componentWillUnmount() {
      this.subscription.remove(); //页面销毁时注销消息事
  }

  useCoupon(data){
    couponDao.useCoupon(data.couponId);
    this.changeList();
  }

  /**
  *更新论坛列表数据
  */
  changeList(){
    this.state.list=ds.cloneWithRows(couponDao.list);
    this.setState(this.state);
  }

  /**
  *相应列表更新后的事件
  */
  onPageRefresh(){
    if(this.beforeListRefresh()){
      return;
    }
    var _this=this;
    couponDao.load(function(result){
      _this.afterListRefresh(result.data.length);
      _this.changeList();
    });
  }

  render() {
    return(
      <View style={{marginBottom:45}}>
        <ListView
          enableEmptySections
          dataSource={this.state.list}
          onEndReached={()=>this.onPageRefresh()}
          onEndReachedThreshold={10}
          renderFooter={()=>this.renderRooter()}
          renderRow={(item, sectionID, rowID) =>
            <CouponPane type="list" key={rowID} size={{width:3,height:2}}
               couponId={item.couponId} screen={this.props.screen}>
            </CouponPane>
          }>
        </ListView>
      </View>
    );
  }
}
