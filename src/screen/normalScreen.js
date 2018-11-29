/**
*子页面基础类
*/
import BaseScreen from './baseScreen';

export default class NormalScreen extends BaseScreen {
  static navigatorStyle = {
    //navBarTextColor: '#007aff', // change the text color of the title (remembered across pushes)
    //navBarBackgroundColor: '#f7f7f7', // change the background color of the nav bar (remembered across pushes)
    //navBarButtonColor: '#007aff', // change the button colors of the nav bar (eg. the back button) (remembered across pushes)
    tabBarHidden: true //隐藏底部导航条
  };

  constructor(props) {
    super(props);
  }
}
