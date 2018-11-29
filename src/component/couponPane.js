/**
*优惠券组件
*/
import React, { Component } from 'react';
import {
  View,Text,Image,TouchableWithoutFeedback,TouchableOpacity,Dimensions
} from 'react-native';
import { Icon } from 'react-native-elements';

import trans from '../i18/trans';
import MainStyle from '../style/mainStyle';
import Filter from '../util/filter';
import {toastX,toast} from '../util/tools';
import couponDao from '../model/couponDao';

const windowSize = Dimensions.get('window');
const marginSize=10;
const imageWidth=windowSize.width*1/8;
const imageRadius=imageWidth/2;

export default class CouponPane extends Component {
  constructor(props) {
    super(props);
    this.state={
      item:couponDao.getItem(props.couponId),
      size:{ width:imageWidth,height:(imageWidth) }, //根据窗口的尺寸，确定图片的尺寸
    }
  }

  openCouponDetail(){
    if(this.props.type=='list'){
      if(this.state.item.couponStatus==1){
        this.props.screen.openScreen('CouponDetailScreen',{
          couponId:this.state.item.couponId
        });
      }else if(this.state.item.couponStatus==2){
        toastX('used coupon');
      }else{
        toastX('invalid coupon');
      }
    }
  }

  location(item){
    this.props.screen.openScreen('MapPane',{
      lat:item.lat,
      lng:item.lng
    });
  }

  render() {
    return (
      <TouchableOpacity onPress={()=>this.openCouponDetail()}>
        <View style={{flexDirection:'row',alignItems:'flex-start',borderRadius:8,backgroundColor:'#FFFFFF',borderColor:'#eeeeee',borderWidth:1,marginTop:marginSize,marginLeft:marginSize,marginRight:marginSize,padding:marginSize}}>
          <View style={{flex:1,margin:5}}>
              <Image source={{uri:this.state.item.shopImage}} style={{width:this.state.size.width, height: this.state.size.height,borderRadius:imageRadius}}/>
          </View>
          <View style={{flex:4}}>
            <View style={{flexDirection:'row',alignItems:'flex-start'}}>
              <Text style={{flex:4}}>{this.state.item.shopName}</Text>
              <Text style={{flex:1,color:'#999999'}}>{this.state.item.couponStatus==2?trans('used'):(this.state.item.status==-1?trans('overdue'):'')}</Text>
            </View>
            <Text style={{paddingTop:8,paddingBottom:8,fontSize:25,color:'#000000'}}>{this.state.item.title}</Text>
            <Text style={{fontSize:12,color:'#999999'}}>{trans('expire date')+':'+Filter.dateFilter(this.state.item.beginDate)+trans('to')+Filter.dateFilter(this.state.item.expireDate)}</Text>
            <TouchableOpacity onPress={()=>this.location(this.state.item)}>
              <Text style={{fontSize:12,color:'#999999'}}>{trans('shop address')+':'+this.state.item.address}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  }
}
