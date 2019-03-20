// pages/distributionCommission/distributionCommission.js
const app = getApp();
const util = require('../../utils/util.js');
const main = require('../../utils/main.js');
Page({
  data: {
    type: 0,//0为普通提现，1为分销提现
    id:0,
    name:"",
    accountNumber:""
  },
  onLoad(op) {
    this.setData({
      type: op.type,
    })
    if (op.type == 1) {
      wx.setNavigationBarColor({
        frontColor: '#ffffff',
        backgroundColor: '#464346'
      })
    }
    this.init()
  },
  init(){
    let token = app.globalData.token;
    let type = this.data.type;
    util.http('withdraw/index', {paytype: type}, 'post', token).then(res => {
      if (res.code == 200) {
        this.setData({
          modeList:res.data.type,
          balance: res.data.balance
        })
      }
    })
  },
  bindinput(e){
    this.setData({
      value:e.detail.value
    })
  },
  parameterTap(e) {
    var this_checked = e.currentTarget.dataset.id
    var modeList = this.data.modeList
    for (var i = 0; i < modeList.length; i++) {
      if (modeList[i].id == this_checked) {
        modeList[i].status = 0;
      }
      else {
        modeList[i].status = 1;//其他的位置为false
      }
    }
    this.setData({
      modeList: modeList,
      id: this_checked,
      name: "",
      accountNumber: ""
    })
  },
  bindName(e){
    this.setData({
      name: e.detail.value
    })
  },
  bindNumber(e) {
    this.setData({
      accountNumber: e.detail.value
    })
  },
  add(){
    let id = this.data.id;
    let value = this.data.value;
    let accountNumber = this.data.accountNumber;
    let name = this.data.name;
    let token = app.globalData.token;
    let type = this.data.type;
    if (!value){
      wx.showToast({
        title: '请输入金额！',
        icon:'none'
      })
      return
    } else if (value < 1) {
      wx.showToast({
        title: '金额不能小于1元',
        icon: 'none'
      })
      return
    } else if (id == 0) {
      wx.showToast({
        title: '请选择提现方式',
        icon: 'none'
      })
      return
    } else if (id!= 2) {
      if (name == "") {
        wx.showToast({
          title: '请填写名字',
          icon: 'none'
        })
        return
      } else if (accountNumber == "") {
        wx.showToast({
          title: '请填写账号',
          icon: 'none'
        })
        return
      }
    }
    let json = {
      paytype: type, 
      type: id,
      money: value,
      name: name,
      number:accountNumber
    }
    util.http('withdraw/add', json, 'post', token).then(res => {
      if (res.code == 200) {
        wx.showToast({
          title: '申请提现成功',
          icon: 'success',
          success(){
            wx.navigateBack()
          }
        })
      }
    })
  }
})