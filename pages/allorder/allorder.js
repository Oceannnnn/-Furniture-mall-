// pages/allorder/allorder.js
const app = getApp();
const util = require('../../utils/util.js');
const main = require('../../utils/main.js');
Page({
  data: {
    triangle:1,
    currentId: 0,
    page: 1,
    onBottom: true,
    orderList: [],
    status:0,//0表示普通订单，2表示拼团,3表示分销
  },
  onLoad(op) {
    this.init(op)
    main.uploadFormIds();
  },
  init(op){
    let HeaderList = [{
      name: "全部",
      id: 0,
      type:"all"
    }, {
      name: "待付款",
        id: 1,
        type: "pay"
    }, {
      name: "待发货",
        id: 2,
        type: "deliver"
    }, {
      name: "待收货",
        id: 3,
        type: "receive"
    }, {
      name: "待评价",
        id: 4,
        type: "evaluate"
      }, {
        name: "已退款",
        id: 5,
        type: "refund"
      }]
    if (op.type == 2) {
      wx.setNavigationBarTitle({
        title: "我的拼团"
      })
      HeaderList = [{
        name: "全部",
        id: 0,
        type: "all"
      }, {
          name: "待成团",
          id: 1,
          type: "group"
        }, {
        name: "待付款",
          id: 2,
          type: "pay"
      }, {
        name: "待发货",
          id: 3,
          type: " deliver"
      }, {
        name: "待收货",
          id: 4,
          type: "receive"
      }, {
        name: "待评价",
          id: 5,
          type: "evaluate"
        }, {
          name: "已退款",
          id: 6,
          type: "refund"
        }]
    } else if (op.type == 3) {
      wx.setNavigationBarTitle({
        title: "分销订单"
      })
      wx.setNavigationBarColor({
        frontColor: '#ffffff',
        backgroundColor: '#464346'
      })
      HeaderList = [{
        name: "全部",
        id: 0,
        type: "all"
      }, {
          name: "待付款",
          id: 1,
          type: "pay"
      },{
        name: "已付款",
          id: 2,
          type: "deliver"
      }, {
        name: "已完成",
          id: 3,
          type: "finish"
      }]
    }
    this.setData({
      currentId: op.id,
      HeaderList: HeaderList,
      status: op.type,
      allorderType: op.allorder
    })
    this.orderList(op.allorder, 1)
  },
  orderList(type,page){
    let json = {
      type: type,
      size: 10,
      page: page,
      orderType: this.data.status
    }
    let list = this.data.orderList;
    let token = app.globalData.token;
    util.http('order/index', json, 'post',token).then(res => {
      if (res.code == 200) {
        if (res.data != '') {
          for (let item of res.data) {
            list.push(item)
          }
          this.setData({
            orderList: list
          })
        } else {
          if (page > 1) {
            wx.showToast({
              title: '没有数据啦！',
              icon: 'none',
              duration: 2000
            })
            this.data.onBottom = false;
          }
        }
      }
    })
  },
  onReachBottom() {
    let page = this.data.page + 1;
    this.setData({
      page: page
    })
    if (this.data.onBottom) {
      this.orderList(this.data.allorderType,this.data.page);
    }
  },
  toList(e) {
    let id = e.currentTarget.dataset.id;
    let type = e.currentTarget.dataset.type;
    this.setData({
      currentId: id,
      page: 1,
      onBottom: true,
      allorderType: type,
      orderList: []
    })
    this.orderList(type,1)
  },
  comment(e) {
    let id = e.currentTarget.dataset.id;
    let order_no = e.currentTarget.dataset.order_no;
    let goodslist = e.currentTarget.dataset.goodslist;
    goodslist = JSON.stringify(goodslist)
    wx.navigateTo({
      url: '../comment/comment?id=' + id + '&order_no=' + order_no + '&goodslist=' + goodslist,
    })
  },
  confirm(e) {
    let id = e.currentTarget.dataset.id;
    let type = e.currentTarget.dataset.type;
    let token = app.globalData.token;
    let url = "", content = "", title="";
    if(type=="s"){//删除订单
      url = "order/del";
      content = "您确定要删除订单吗？";
      title = '已删除';
    }else if(type=="q"){//取消订单
      url = "order/cancel";
      content = "您确定要取消订单吗？";
      title = '已取消';
    } else if (type == "h") {//确认收货
      url = "order/confirm";
      content = "请您收到货后再点击“确定”，否则可能钱货两空！";
      title = '成功确认收货！';
    }
    let that = this;
    wx.showModal({
      content: content,
      confirmColor: '#029F53',
      success: function (res) {
        if (res.confirm) {
          util.http(url, {id:id}, 'post', token).then(res => {
            if(res.code==200){
              wx.showToast({
                title: title,
                icon:'success'
              })
              that.refresh();
            }
          })
        }
      }
    })
  },
  remind(e) {//提醒发货
    let id = e.currentTarget.dataset.id;
    let token = app.globalData.token;
    util.http('order/remind', { id: id }, 'post', token).then(res => {
      if (res.code == 200) {
        wx.showToast({
          title: '已提醒',
          icon: 'success'
        })
      }
    })
  },
  logistics(e) {
    main.toDetails(e, "logistics")
  },
  orderDetails(e) {
    let formId = e.detail.formId;
    main.collectFormIds(formId);
    main.toDetails(e,"orderDetails")
  },
  toListDetails(e) {
    let formId = e.detail.formId;
    main.collectFormIds(formId);
    main.toDetails(e, "goodsDetails")
  },
  refresh() {
    this.setData({
      page: 1,
      onBottom: true,
      orderList: []
    })
    this.orderList(this.data.allorderType, 1)
  },
  onShareAppMessage(res) {
    let index = res.target.dataset.index;
    let orderList = this.data.orderList;
    let id = orderList[index].product_list[0].product_id;
    let title = "一起来拼团吧！"
    let path = '/pages/index/index'
    if (res.from === 'button') {
      path = '/pages/goodsDetails/goodsDetails?id=' + id;
    }else{
      path = '/pages/index/index'
    }
    return {
      title: title,
      path: path
    }
  },
  onPullDownRefresh() {
    wx.showNavigationBarLoading() //在标题栏中显示加载
    this.refresh();
    setTimeout(function () {
      // complete
      wx.hideNavigationBarLoading() //完成停止加载
      wx.stopPullDownRefresh() //停止下拉刷新
    }, 1500);
  }
})