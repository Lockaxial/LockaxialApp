/**
*APP上的选择控件
*/
import React, { Component } from 'react';
import {
  Picker
} from 'react-native';
import MainStyle from '../style/mainStyle';

export default class Selection extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Picker style={MainStyle.selection}
        selectedValue={this.props.selectedValue}
        onValueChange={this.props.onValueChange}>
        {
          this.props.data.map((item,i)=>
            <Picker.Item value={item.key} key={i} label={item.value} />
          )
        }
      </Picker>
    );
  }
}
