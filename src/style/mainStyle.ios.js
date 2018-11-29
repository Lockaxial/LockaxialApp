/**
*APP端的主要风格
*/
import {
  Dimensions
} from 'react-native';

const windowSize = Dimensions.get('window');

export default MainStyle={
  screen:{},
  subScreen:{marginTop:20},
  list:{marginTop:0,borderTopWidth:0,borderBottomWidth:0},
  label:{paddingTop:10,paddingLeft:16,paddingBottom:10},
  link:{paddingTop:10,paddingLeft:16,paddingBottom:10,paddingRight:10,color:'#007aff'},
  innerLabel:{paddingTop:10,paddingLeft:10},
  innerLink:{paddingTop:10,paddingLeft:10,paddingRight:10,color:'#007aff'},
  textInput:{marginLeft:16,marginRight:16,height:50},
  selection:{marginLeft:16,marginRight:16},
  subtitleView: {
    paddingLeft: 10,
    paddingTop: 5
  },
  subtitleText: {
    color: 'grey'
  },
  paneHeader:{
    marginTop:10,
    marginLeft:10,
    marginRight:10,
    flexDirection:'row'
  },
  paneContent:{
    marginTop:6,
    marginLeft:10,
    marginRight:10,
    paddingBottom:10,
    borderBottomColor:'#eeeeee',
    borderBottomWidth:1
  },
  paneFooter:{
    flexDirection:'row',
    alignItems:'center',
    margin:10
  },
  tabBar:{
    backgroundColor:"#eeeeee",
    textColor:"#999999",
    selectedTextColor:"#007aff",
    firstItemSpacing:20,
    itemSpacing:30,
    height:30
  }
}
