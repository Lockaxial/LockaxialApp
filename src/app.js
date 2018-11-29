/**
 *整个APP应用的入口,初始化首页面
 */
import {
    Platform,BackAndroid
} from 'react-native';
import {Navigation} from 'react-native-navigation';
import Icon from 'react-native-vector-icons/Iconfont';
import trans from './i18/trans';
import {toast,toastX} from './util/tools';
import {registerScreens} from './main';
import reactBridge from './bridge/reactBridge';
import appConf from './comm/appConf';

reactBridge.sendMainMessage(10000, appConf.APPLICATION_SERVER);
//注册所有页面
registerScreens();

var housekeeperIcon;
var forumIcon;
var centerIcon;

export default class App {
    constructor() {
        this.createIcons().then(() => {
            this.startApp();
        }).catch((error) => {
            console.error(error);
        });
    }

    createIcons() {
        return new Promise(function (resolve, reject) {
            Promise.all(
                [
                    Icon.getImageSource('home', 30),
                    Icon.getImageSource('shangquangoucheng', 30),
                    Icon.getImageSource('person', 30),
                ]
            ).then((values) => {
                housekeeperIcon = values[0];
                forumIcon = values[1];
                centerIcon = values[2];
                resolve(true);
                resolve(true);
            }).catch((error) => {
                console.log(error);
                reject(error);
            }).done();
        });
    };

    createTabs() {
        let tabs = [
            {
                label: trans('housekeeper'),
                screen: 'ResidentMain',
                icon: housekeeperIcon,
                selectedIcon: housekeeperIcon
            },
            // {
            //   label:trans('community forum'),
            //   screen: 'ForumMain',
            //   icon: forumIcon,
            //   selectedIcon: require('./image/three_selected.png')
            // },
            {
                label: trans('business'),
                screen: 'BusinessMain',
                icon: forumIcon,
                selectedIcon: forumIcon
            },
            {
                label: trans('personal center'),
                screen: 'CenterMain',
                icon: centerIcon,
                selectedIcon: centerIcon
            }
        ];
        return tabs;
    };

    startApp() {
        // 启动APP
        Navigation.startTabBasedApp({
            tabs: this.createTabs(),
            appStyle: {
                tabBarBackgroundColor: '#eeeeee',
                tabBarButtonColor: '#999999',
                tabBarSelectedButtonColor: '#007aff',
                screenBackgroundColor: '#F2F2F2'
            },
            animationType: 'fade'
        });
    }
}

var app = new App();
//添加回车监控，联系回车两次则退出APP
var systemExitTryTime = 0;
const MSG_BACK_EXIT = 'back exit';
BackAndroid.addEventListener('hardwareBackPress', function () {
    //  if (!this.onMainScreen()) {
    //    this.goBack();
    //    return true;
    //  }
    if (systemExitTryTime == 0) {
        systemExitTryTime = 1;
        toastX(MSG_BACK_EXIT);
        setTimeout(function () {
            systemExitTryTime = 0;
        }, 3000);
        return true;
    } else {
        systemExitTryTime = 0;
        //return false;
        
        //xiaozd add
        reactBridge.sendMainMessage(70000, null);
        return true;
    }
});
