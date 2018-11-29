/**
*物业缴费
*/
import React, { Component } from 'react';
import {
  ScrollView,Text,View,TouchableOpacity
} from 'react-native';
import {List,ListItem} from 'react-native-elements';

import NormalScreen from './normalScreen';
import trans from '../i18/trans';
import {toastX,toast} from '../util/tools';
import Filter from '../util/filter';
import MainStyle from '../style/mainStyle';
import billDao from '../model/billDao';

const LABEL_MANAGE_FEE='manage fee';
const LABEL_YUAN='yuan';
const LABEL_PAY_NOW='pay now';
const LABEL_SEE_DETAIL='see detail';
const LABEL_UNPAIED='unpaied bill';
const LABEL_TOTAL='total';

export default class BillScreen extends NormalScreen {

  constructor(props) {
    super(props);
    let _this=this;
    _this.loadDataFromDao();
    billDao.init(function(result){
      if(result){
        _this.changeProfile();
      }
    });
  }

  loadDataFromDao(){
    this.state={
      unpaiedBillNumber:billDao.unpaiedBillNumber,
      unpaiedBillAmount:billDao.unpaiedBillAmount,
      list:billDao.list
    }
  }
  /**
  *更新列表数据
  */
  changeProfile(){
    this.loadDataFromDao();
    this.setState(this.state);
  }

  /**
  *打开已支付账单列表页
  */
  openBillHistoryScreen(){
    this.openScreen('BillHistoryScreen');
  }

  /**
  *打开账单详情页
  */
  openBillDetailScreen(index){
    let billId=this.state.list[index].rid;
    this.openScreen('BillDetailScreen',{
      billId:billId
    });
  }

  render() {
    return (
      <View style={MainStyle.screen}>
        <ScrollView>
          <View style={{paddingTop:20,alignItems:'center'}}>
            <Text style={{fontSize:20}}>{trans(LABEL_TOTAL)+this.state.unpaiedBillNumber+trans(LABEL_UNPAIED)}</Text>
            <Text style={{fontSize:20,color:'#da4f49',paddingTop:10,paddingBottom:15}}>{Filter.moneyFilter(this.state.unpaiedBillAmount)+' '+trans(LABEL_YUAN)}</Text>
          </View>
          <List containerStyle={MainStyle.list}>
            {
              this.state.list.map((item, i) => {
                return (
                  <ListItem onPress={()=>this.openBillDetailScreen(i)} key={i} hideChevron={true}
                    title={item.billDate}
                    rightTitle={Filter.moneyFilter(item.billTotal)+trans(LABEL_YUAN)}
                    >
                  </ListItem>
                )
              })
            }
          </List>
          <TouchableOpacity onPress={()=>this.openBillHistoryScreen()}><Text style={MainStyle.link}>{trans('BillHistoryScreen')}</Text></TouchableOpacity>
        </ScrollView>
      </View>
    );
  }
}
