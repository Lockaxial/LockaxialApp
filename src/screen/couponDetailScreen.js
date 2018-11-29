/**
*优惠券详情页面
*/
import React, { Component } from 'react';
import {
  View,Text,TouchableOpacity,ListView,ScrollView,DeviceEventEmitter,Dimensions,Image
} from 'react-native';
import QRCode from 'react-native-qrcode';

import NormalScreen from './normalScreen';
import MainStyle from '../style/mainStyle';
import trans from '../i18/trans';
import {toastX} from '../util/tools';
import Filter from '../util/filter';
import couponDao from '../model/couponDao';

const windowSize = Dimensions.get('window');
const marginSize=10;
const imageWidth=windowSize.width*1/8;
const imageRadius=imageWidth/2;

export default class CouponDetailScreen extends NormalScreen {
  constructor(props) {
    super(props);
    this.state={
      item:couponDao.getItem(props.couponId)
    }
  }

  /**
   *当此组件中显示完成后，注册事件侦听，当公告信息产生变化时，更新显示
   */
  componentDidMount() {
    this.subscription = DeviceEventEmitter.addListener('useCoupon', (data)=>this.useCoupon(data)); //注册一个reactSendImSuccess消息，触发该消息时提示
  }

  /**
   *组件删除后，一并删除事件侦听
   */
  componentWillUnmount() {
    this.subscription.remove(); //页面销毁时注销消息事
  }

  useCoupon(data){
    if(this.props.couponId==data.couponId){
      this.back();
    }
  }

  render() {
    return (
      <ScrollView style={MainStyle.screen}>
        <View style={{borderRadius:8,backgroundColor:'#FFFFFF',borderColor:'#eeeeee',borderWidth:1,marginTop:marginSize,marginLeft:marginSize,marginRight:marginSize,padding:marginSize}}>
          <View style={{flexDirection:'row',alignItems:'flex-start',marginBottom:marginSize}}>
            <View style={{flex:1,margin:5}}>
                <Image source={{uri:this.state.item.shopImage}} style={{width:imageWidth, height: imageWidth,borderRadius:imageRadius}}/>
            </View>
            <View style={{flex:4}}>
              <Text>{this.state.item.shopName}</Text>
              <Text style={{paddingTop:8,paddingBottom:8,fontSize:25,color:'#000000'}}>{this.state.item.title}</Text>
              <Text style={{fontSize:12,color:'#999999'}}>{trans('expire date')+':'+Filter.dateFilter(this.state.item.beginDate)+trans('to')+Filter.dateFilter(this.state.item.expireDate)}</Text>
              <TouchableOpacity onPress={()=>this.location(this.state.item)}>
                <Text style={{fontSize:12,color:'#999999'}}>{trans('shop address')+':'+this.state.item.address}</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={{paddingTop:15,borderTopColor:'#F2F2F2',borderTopWidth:1,alignItems: 'center',justifyContent: 'center'}}>
            <QRCode
              value={this.state.item.code}
              size={200}
              bgColor='#000000'
              fgColor='white'/>
            <Text style={{paddingTop:8,fontSize:12,color:'#999999',textAlign:'center'}}>{trans('scan coupon')}</Text>
            <Text style={{paddingTop:8,fontSize:12,color:'#999999',textAlign:'center'}}>{this.state.item.remark}</Text>
          </View>
        </View>
      </ScrollView>
    );
  }
}
