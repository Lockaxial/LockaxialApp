/**
*通知公告数据类
*/
import {
  DeviceEventEmitter
} from 'react-native';
import BaseDao from './baseDao';
import ajax from '../util/ajax';
import accountDao from './accountDao';

export class NoticeDao extends BaseDao {
  unreadNoticeNumber=0; //未读的通知公告数量
  list=[]; //通知公告列表
  item=null; //当前公告

  constructor() {
    super();
  }

  /**
  *获取通知公告概要信息,包括前面20条信息，未读数量
  */
  retrieveNoticeProfile(){
    let _this=this;
    if(accountDao.currentUnit){
      ajax.get('/notice/retrieveNoticeProfile',{},function(result){
        if(result.code==0){
          _this.unreadNoticeNumber=result.noticeNumber;
          _this.list=result.data;
          DeviceEventEmitter.emit('changeNoticeProfile',null);
        }
      });
    }
  }

  clear(){
    this.unreadNoticeNumber=0;
    this.list=[];
    DeviceEventEmitter.emit('changeNoticeProfile',null);
  }
  /**
  *获取更多通知公告列表
  */
  load(cb){
    let _this=this;
    ajax.get('/notice/retrieveNoticeList',{arrayLength:_this.list.length},function(result){
      if (result.code == 0) {
        for (var i = 0; i < result.data.length; i++) {
          _this.list.push(result.data[i]);
        }
      }
      if(cb){cb(result);}
    });
  }

  /**
  *对于已经访问的条目，进行状态更新（已读还是未读），并修改未读数量
  */
  updateAccessStatus(item){
    let _this=this;
    if(!item.accessId){
      ajax.get('/notice/accessNotice', {
          noticeId:item.rid
      }, function (result) {
        if (result.code == 0) {
          item.accessId=result.accessId;
          DeviceEventEmitter.emit('changeNoticeList',null);
          if(_this.unreadNoticeNumber>=1){
            _this.unreadNoticeNumber--;
            DeviceEventEmitter.emit('changeNoticeProfile',null);
          }
        }
      });
    }
  }
}

const noticeDao=new NoticeDao();
export default noticeDao; //创建一个默认的数据对象，并将其导出
