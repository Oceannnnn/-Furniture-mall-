const util = require('../utils/util.js');
const app = getApp()
const goLogin = (isPer) => {
  // isPer表示当前页面是否在my
  wx.showModal({
    title: '提示',
    confirmText: '确认',
    content: '为了使您获得更好的用户体验，请先登录！',
    confirmColor: '#029F53',
    success: function (res) {
      if (isPer==1){
        if (res.confirm) {
          wx.switchTab({
            url: '../my/my',
          })
        }
      }
    }
  })
}
// 带参数跳转到对应页面
const toDetails = (e, url) => {
  let id = e.currentTarget.dataset.id;
  let type = e.currentTarget.dataset.type;
  wx.navigateTo({
    url: '../' + url + '/' + url + '?id=' + id + '&type=' + type
  })
}

const toVoucher = () => {
  wx.showModal({
    title: '提示',
    confirmText: '立即使用',
    content: '恭喜你领取成功！',
    confirmColor: '#029F53',
    success: function (res) {
      if (res.confirm) {
        wx.switchTab({
          url: '../index/index'
        })
      }
    }
  })
} 
// 倒计时
const countDown = (times,type)=>{
    if (times > 0) {
      let d = 0,
        h = 0,
        m = 0,
        s = 0;
      if (times > 0) {
        // d = Math.floor(times / (60 * 60 * 24));
        h = Math.floor(times / (60 * 60)) 
        m = Math.floor(times / 60) - (d * 24 * 60) - (h * 60);
        s = Math.floor(times) - (d * 24 * 60 * 60) - (h * 60 * 60) - (m * 60);
      }
      if (h < 10) {
        h = "0" + h;
      }
      if (m < 10) {
        m = "0" + m;
      }
      if (s < 10) {
        s = "0" + s;
      }
      let str = h + ":" + m + ":" + s;
      if(type==1){
        str = h + "时" + m + "分" + s + "秒";
      }
      return str
    } else {
      return
    }
}

const unique = (arr) => { //去重
  // 遍历arr，把元素分别放入tmp数组(不存在才放)
  var tmp = new Array();
  for (var i in arr) {
    //该元素在tmp内部不存在才允许追加
    if (tmp.indexOf(arr[i]) == -1) {
      tmp.push(arr[i]);
    }
  }
  return tmp;
}
const uniqueObject = (array) => {//对象去重
debugger
  var allArr = [];    //建立新的临时数组
  for (var i = 0; i < array.length; i++) {
    var flag = true;
    for (var j = 0; j < allArr.length; j++) {
      if (array[i].priceId == allArr[j].priceId) {
        flag = false;
      };
    };
    if (flag) {
      allArr.push(array[i]);
    };
  };
  return allArr;
}

const indexOfObject = (arr, valArr) => {//删除指定数组的元素
  for (var i = 0; i < arr.length; i++) {
    for (var j = 0; j < valArr.length; j++) {
      if (arr[i].priceId == valArr[j].priceId) return i;
    }
  }
  return -1;
}

const removeObject = (arr, valArr) => {//删除指定数组的元素
  var tmp = new Array();
  var index = indexOfObject(arr, valArr);
  if (index > -1) {
    arr.splice(index, 1);
    tmp = arr
  }
  return tmp;
}

const indexOf = (arr, val) => {//删除指定数组的元素
  for (var i = 0; i < arr.length; i++) {
    if (arr[i] == val) return i;
  }
  return -1;
}

const remove = (arr, val) => {//删除指定数组的元素
  var tmp = new Array();
  var index = indexOf(arr, val);
  if (index > -1) {
    arr.splice(index, 1);
    tmp = arr
  }
  return tmp;
}

const member = () => {
  let token = app.globalData.token;
  util.http('member/info', {}, 'get', token).then(res => {
    if (res.code == 200) {
      wx.setStorage({
        key: "member",
        data: {
          balance: res.data.balance,
          integral: res.data.integral
        }
      })
      app.globalData.balance = res.data.balance;
      app.globalData.integral = res.data.integral;
    }
  })
} 

const collectFormIds = (formId) => {
  let formIds = app.globalData.globalFormIds;  // 获取全局推送码数组
  if (formId == undefined) return
  var timestamp = Date.parse(new Date());
  timestamp = timestamp / 1000;
  let data = {
    form_id: formId,
    expire_time: timestamp + 60480000  // 7天后的过期时间戳
  }
  formIds.push(data);
  app.globalData.globalFormIds = formIds;
}

const uploadFormIds = () => {
  var formIds = app.globalData.globalFormIds;  // 获取全局推送码
  if (formIds.length) {
    formIds = JSON.stringify(formIds);  // 转换成JSON字符串
    let token = app.globalData.token;
    util.http('me/saveFormIds', { formid_arr: formIds }, 'post', token).then(res => {
      if (res.code == 200) {
        app.globalData.globalFormIds = [];  // 清空当前全局推送码
      }
    })
  }
}
module.exports = {
  member: member,
  goLogin: goLogin,
  toDetails: toDetails,
  countDown: countDown,
  toVoucher: toVoucher,
  remove: remove,
  uniqueObject:uniqueObject,
  unique: unique,
  removeObject: removeObject,
  uploadFormIds: uploadFormIds,
  collectFormIds: collectFormIds
}