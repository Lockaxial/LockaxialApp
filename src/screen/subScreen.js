/**
*子页面基础类
*/
import BaseScreen from './baseScreen';

export default class SubScreen extends BaseScreen {
  static navigatorStyle = {
    navBarHidden: true //隐藏顶部导航
  };

  constructor(props) {
    super(props);
  }
}
