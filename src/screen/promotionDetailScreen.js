/**
*物业公告详情页面
*/
import React, { Component } from 'react';
import {
  View,Text,ScrollView,Image,Dimensions,TouchableOpacity
} from 'react-native';
import {Card} from 'react-native-elements';

import NormalScreen from './normalScreen';
import ContentPane from '../component/contentPane';
import MainStyle from '../style/mainStyle';
import trans from '../i18/trans';
import {toastX} from '../util/tools';
import PromotionDao from '../model/promotionDao';
import Filter from '../util/filter';

const windowSize = Dimensions.get('window');
const marginSize=10;
const imageWidth=windowSize.width*1/8;
const imageRadius=imageWidth/2;

export default class PromotionDetailScreen extends NormalScreen {
  promotionDao=null;

  constructor(props) {
    super(props);
    let _this=this;
    this.state={
      item:{}
    };
    promotionDao=new PromotionDao();
    promotionDao.load(this.props.promotionId,function(result){
      if(result.code==0){
        _this.state.item=result.data;
        _this.setState(_this.state);
      }
    });
  }

  location(item){
    this.props.screen.openScreen('MapPane',{
      lat:item.lat,
      lng:item.lng
    });
  }

  render() {
    return (
      <ScrollView style={MainStyle.screen}>
        <View style={{padding:marginSize,backgroundColor:'#ff4343'}}>
            <View style={{flexDirection:'row',alignItems:'flex-start',marginBottom:marginSize}}>
              <View style={{flex:1,margin:5}}>
                  <Image source={{uri:this.state.item.shopImage}} style={{width:imageWidth, height: imageWidth,borderRadius:imageRadius}}/>
              </View>
              <View style={{flex:4}}>
                <Text style={{paddingBottom:8,fontSize:25,color:'#FFFFFF'}}>{this.state.item.title}</Text>
                <Text style={{color:'#FFFFFF'}}>{this.state.item.shopName}</Text>
                <Text style={{fontSize:12,color:'#FFFFFF'}}>{trans('promotion date')+':'+this.state.item.startDate+trans('to')+this.state.item.endDate}</Text>
                <TouchableOpacity onPress={()=>this.location(this.state.item)}>
                  <Text style={{fontSize:12,color:'#FFFFFF'}}>{trans('shop address')+':'+this.state.item.address}</Text>
                </TouchableOpacity>
              </View>
            </View>
          <View>
            <Text style={{paddingTop:6,fontSize:12,color:'#FFFFFF'}}>{this.state.item.remark}</Text>
          </View>
        </View>
        {
          this.state.item.images?(
            this.state.item.images.map((image,i)=>
              <Image source={{uri:image}} key={i} style={{width:windowSize.width,height:windowSize.width}}></Image>
            )
          ):(
            null
          )
        }
      </ScrollView>
    );
  }
}
