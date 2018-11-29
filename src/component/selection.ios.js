/**
*APP上的日期时间控件
*/
import React, { Component } from 'react';
import {
  View,Text,TouchableOpacity,Picker
} from 'react-native';

import MainStyle from '../style/mainStyle';
import trans from '../i18/trans';

export default class Selection extends Component {
  constructor(props) {
    super(props);
    this.state={
      showSelection:false,
      key:this.props.selectedValue,
      value:this.convertValue(this.props.selectedValue)
    };
  }

  showPicker=()=>{
    if(this.props.data&&this.props.data.length>1){
      this.state.showSelection=true;
      this.setState(this.state);
    }
  }

  hidePicker=()=>{
    this.state.showSelection=false;
    this.setState(this.state);
  }

  convertValue(key){
    let thisValue=null;
    if(this.props.data){
      for(let i=0;i<this.props.data.length;i++){
        if(this.props.data[i].key==key){
          thisValue=this.props.data[i].value;
          break;
        }
      }
    }
    return thisValue;
  }

  chooseOption(key){
    this.state.key=key;
    this.state.value=this.convertValue(key);
    this.props.onValueChange(key);
    this.hidePicker();
  }

  render() {
    return (
      <View style={{marginLeft:16,marginRight:18,borderBottomColor:'#dedede',borderBottomWidth:1}}>
        <TouchableOpacity onPress={this.showPicker}>
          <Text style={[{fontSize:16,color:'black',paddingTop:10,paddingLeft:10,paddingBottom:10},this.props.style]}>{this.state.value}</Text>
        </TouchableOpacity>
        {
          this.state.showSelection?(
            <View>
              <TouchableOpacity onPress={this.hidePicker}>
                <Text style={MainStyle.link}>{trans('cancel')}</Text>
              </TouchableOpacity>
              <Picker style={MainStyle.selection}
                selectedValue={this.state.key}
                onValueChange={(data)=>{this.chooseOption(data)}}>
                {
                  this.props.data.map((item,i)=>
                    <Picker.Item value={item.key} key={i} label={item.value} />
                  )
                }
              </Picker>
            </View>
          ):(
            null
          )
        }
      </View>
    );
  }
}
