/**
*商铺详情页面
*/
import React, { Component } from 'react';
import {
  View,Text,TouchableOpacity,ListView,ScrollView,DeviceEventEmitter,Dimensions,Image
} from 'react-native';
import {ButtonGroup} from 'react-native-elements';

import NormalListScreen from './normalListScreen';
import GoodsMain from './goodsMain';
import CouponMain from './couponMain';
import ShopPane from '../component/shopPane';
import CarouselBanner from '../component/carouselBanner';
import MainStyle from '../style/mainStyle';
import trans from '../i18/trans';
import {toastX} from '../util/tools';
import businessDao from '../model/businessDao';
import accountDao from '../model/accountDao';
import Filter from '../util/filter';

const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2}); //用于产生list的数据源
const windowSize = Dimensions.get('window');
const LABEL_SHOP_INFO='shop info';
const LABEL_GOODS_INFO='goods info';
const LABEL_COUPON_INFO='coupon info';

export default class ShopDetailScreen extends NormalListScreen {
  shopDao=null;

  constructor(props) {
    super(props);
    let _this=this;
    this.shopDao=businessDao.getShopDao(this.props.categoryId);
    this.state={
      tabIndex:0,
      item:this.shopDao.getItem(this.props.shopId),
    };
  }

  /**
  *当此组件中显示完成后，注册一个changeShop事件侦听，当广告数据产生变化时，更新广告显示
  */
  componentDidMount(){
    this.subscription = DeviceEventEmitter.addListener('changeShop',(data)=>this.changeShop(data)); //注册一个changeShop消息，触发该消息时调用更新广告
  }

  /**
  *组件删除后，一并删除事件侦听
  */
  componentWillUnmount(){
    this.subscription.remove(); //页面销毁时注销消息事件
  }

  changeShop(data){
    if(data.categoryId==this.props.categoryId && data.shopId==this.props.shopId){
      this.setState(this.state);
    }
  }

  changeTabIndex(tabIndex){
    if(this.state.tabIndex!=tabIndex){
      this.state.tabIndex=tabIndex;
      this.setState(this.state);
    }
  }

  renderShopInfo(){
    return (
      <View>
        {
          (this.state.item.images&&this.state.item.images.length>0)?(
            <CarouselBanner images={this.state.item.images} size={{width:200,height:100}} startRefresh delay={5}>
            </CarouselBanner>
          ):(
            null
          )
        }
        <ShopPane categoryId={this.props.categoryId} item={this.state.item} size={{width:3,height:2}} screen={this}>
        </ShopPane>
        <View style={{margin:10}}>
          <Text>{this.state.item.remark}</Text>
        </View>
      </View>
    );
  }

  renderGoodsInfo(){
    return (
      <GoodsMain shopId={this.props.shopId} screen={this}/>
    );
  }

  renderCouponInfo(){
    return (
      <CouponMain shopId={this.props.shopId} screen={this}/>
    );
  }

  render() {
    return (
      <View style={MainStyle.screen}>
        <ButtonGroup
          onPress={(index)=>this.changeTabIndex(index)}
          selectedIndex={this.state.tabIndex}
          buttons={[trans(LABEL_SHOP_INFO),trans(LABEL_GOODS_INFO),trans(LABEL_COUPON_INFO)]}
          containerStyle={{height: 30}} />
        {
          this.state.tabIndex==0?(
            this.renderShopInfo()
          ):(
            this.state.tabIndex==1?(
              this.renderGoodsInfo()
            ):(
              this.renderCouponInfo()
            )
          )
        }
      </View>
    );
  }
}
