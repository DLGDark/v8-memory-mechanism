<template>
  <div>
    <h1 class="disShow paytit">关于我 & 关于你</h1>
    <h5 class="disShow h-two">万物皆有时，比如你我相遇</h5>
    <div class="gif">
      <img src="../public/about/gif1.gif" alt="gif" />
      <img src="../public/about/gif2.gif" alt="gif" />
    </div>
    <h3>
      <span class="paytit">听说，打赏我的人最后都找到了真爱</span>
      <span style="color:#ff0000;">❤</span>
    </h3>
    <div class="payImg">
      <h3 class="paytit">微信</h3>
      <img width="200" src="../public/about/weixinPay.png" alt="微信支付" />
    </div>
    <div class="payImg">
      <h3 class="paytit">支付宝</h3>
      <img width="200" src="../public/about/zhifubaoPay.jpg" alt="支付宝支付" />
    </div>
    <div class="gif">
      <img src="../public/about/gif3.gif" alt="gif" style="margin-left:-80px;" />
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {};
  }
};
</script>

<style>
.disShow {
  display: inline-block;
}
.h-two {
  margin-left: 16px;
  color: #555;
}
.gif {
  text-align: center;
}
.gif img {
  padding: 10px 20px;
}
.payImg {
  border: 1px solid #eceaef;
  text-align: center;
  box-shadow: 4px 4px 6px #888888;
  margin-top: 36px;
}
.paytit{
  color: #000;
}
</style>