/**
*周边商家数据类
*/
import BaseDao from './baseDao';
import ajax from '../util/ajax';
import Format from '../util/format';
import accountDao from './accountDao';
import ShopDao from './shopDao';

export class BusinessDao extends BaseDao {
  list=[]; //周边商家类别列表
  shopDaoList=[]; //周边商家列表

  constructor() {
    super();
  }

  /**
  *获取更多周边商家类别列表
  */
  load(cb){
    let _this=this;
    ajax.get('/shop/retrieveCategoryList',{},function(result){
      if (result.code == 0) {
        for (var i = 0; i < result.data.length; i++) {
          _this.list.push(result.data[i]);
        }
      }
      if(cb){cb(result);}
    });
  }

  /**
  *初始化周边商家类别
  */
  init(cb){
    if(this.list.length==0){
      this.load(cb);
    }else{
      if(cb){cb(null)}
    }
  }

  clear(){
    this.list=[];
    this.shopDaoList=[];
  }
  /**
  *获得shopDao
  */
  getShopDao(categoryId){
    let shopDao=this.shopDaoList[categoryId];
    if(!shopDao){
      shopDao=new ShopDao(categoryId);
      this.shopDaoList[categoryId]=shopDao;
    }
    return shopDao;
  }
}

const businessDao=new BusinessDao();
export default businessDao; //创建一个默认的数据对象，并将其导出
