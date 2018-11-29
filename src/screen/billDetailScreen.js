/**
*物业账单明细
*/
import React, { Component } from 'react';
import {
  View,Text
} from 'react-native';

import NormalScreen from './normalScreen';
import trans from '../i18/trans';
import Filter from '../util/filter';
import MainStyle from '../style/mainStyle';
import billDao from '../model/billDao';
import accountDao from '../model/accountDao';

const LABEL_YUAN='yuan';
const LABEL_FEE_NAME='fee name';
const LABEL_FEE_RATE='fee rate';
const LABEL_FEE_QUANTITY='quantity';
const LABEL_FEE_AMOUNT='amount';

export default class BillListScreen extends NormalScreen {

  constructor(props) {
    super(props);
    let _this=this;
    this.state={
      list:[]
    };
    billDao.retrieveBillDetail(props.billId,function(result){
      if(result){
        _this.state.list=billDao.billDetailList;
        _this.setState(_this.state);
      }
    });
  }

  render() {
    return (
      <View style={MainStyle.screen}>
        <Text style={MainStyle.label}>{accountDao.currentUnit.unitName}</Text>
        <View>
          <View style={{flexDirection:'row',justifyContent:'center'}}>
            <View style={{flex:1}}><Text style={MainStyle.label}>{trans(LABEL_FEE_NAME)}</Text></View>
            <View style={{flex:1}}><Text style={MainStyle.label}>{trans(LABEL_FEE_RATE)}</Text></View>
            <View style={{flex:1}}><Text style={MainStyle.label}>{trans(LABEL_FEE_QUANTITY)}</Text></View>
            <View style={{flex:1}}><Text style={MainStyle.label}>{trans(LABEL_FEE_AMOUNT)}</Text></View>
          </View>
          {
            this.state.list.map((item,i)=>
            <View key={i} style={{flexDirection:'row',justifyContent:'center'}}>
              <View style={{flex:1}}><Text style={MainStyle.label}>{item.feeName}</Text></View>
              <View style={{flex:1}}><Text style={MainStyle.label}>{Filter.rateFilter(item.feeRate,item.feeType)}</Text></View>
              <View style={{flex:1}}><Text style={MainStyle.label}>{Filter.quantityFilter(item.quantity,item.feeType)}</Text></View>
              <View style={{flex:1}}><Text style={MainStyle.label}>{Filter.moneyFilter(item.feeTotal)+trans(LABEL_YUAN)}</Text></View>
            </View>
            )
          }
        </View>
      </View>
    );
  }
}
