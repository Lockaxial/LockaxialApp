/**
*APP上的日期时间控件
*/
import React, { Component } from 'react';
import {
  View,Text,TouchableOpacity
} from 'react-native';
import DateTimePicker from 'react-native-modal-datetime-picker';

import Format from '../util/format';

import MainStyle from '../style/mainStyle';

export default class DatetimeWidget extends Component {
  constructor(props) {
    super(props);
    this.state={
      showDatetime:false,
      date:props.date,
      value:this.convertDate(props.date)
    };
  }

  convertDate(date){
    if(this.props.mode=='datetime'){
      return Format.fromDateToStr(date,'yyyy-MM-dd hh:mm');
    }else if(this.props.mode=='time'){
      return Format.fromDateToStr(date,'hh:mm');
    }else{
      return Format.fromDateToStr(date,'yyyy-MM-dd');
    }
  }

  showDateTimePicker=()=>{
    this.state.showDatetime=true;
    this.setState(this.state);
  }

  hideDateTimePicker=()=>{
    this.state.showDatetime=false;
    this.setState(this.state);
  }

  chooseDatetime=(date)=>{
    this.state.date=date;
    this.state.value=this.convertDate(date);
    if(this.props.onChange){
      this.props.onChange(date);
    }
    this.hideDateTimePicker();
  }

  render() {
    return (
      <View style={{marginLeft:16,marginRight:18,borderBottomColor:'#dedede',borderBottomWidth:1}}>
        <TouchableOpacity onPress={this.showDateTimePicker}>
          <Text style={[{fontSize:16,color:'black',paddingTop:10,paddingLeft:10,paddingBottom:10},this.props.style]}>{this.state.value}</Text>
        </TouchableOpacity>
        <DateTimePicker
          date={this.state.date}
          mode={this.props.mode}
          isVisible={this.state.showDatetime}
          onConfirm={this.chooseDatetime}
          onCancel={this.hideDateTimePicker}
        />
      </View>
    );
  }
}
