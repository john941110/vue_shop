<template>
  <div class="login_bg">
    <div class="login_box">
      <!-- 头像区域 -->
      <div class="avatar_box">
        <img src="../assets/logo.png" alt="" />
      </div>
      <!-- 表单区域 -->
      <!-- 通过:model的办法给表单设置属性，属性名是什么，下面的变量就要定义成什么 -->
      <!-- 通过:rules的办法给表单设置验证规则，属性名是什么，下面的变量就要定义成什么 -->
      <!-- 通过 ref设置的属性可以 用this.$refs.xxx 固定样式来获取到这个元素,或者这个vue实例-->
      <el-form class="from_box" :model="form" :rules="rules" ref="rule">
        <!-- 通过 prop="username"  绑定验证的规则 -->
        <el-form-item prop="username">
          <!-- v-model双向数据绑定 ， prefix-icon 给 input 前后添加字体图标-->
          <el-input prefix-icon="iconfont icon-user" v-model="form.username"></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input prefix-icon="iconfont icon-3702mima" v-model="form.password" type="password"></el-input>
        </el-form-item>
        <el-form-item class="btns">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="warning" @click="reback">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 设置表单的数据，以便用来提交
      form: {
        username: 'admin',
        password: '123456'
      },
      // 设置验证规则，验证的规则名称和结构中prop的属性和from中相应表单的属性名要一致
      rules: {
        username: [
          { required: true, message: '请输入登录名称', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入登录密码', trigger: 'blur' },
          { min: 3, max: 12, message: '长度在 3 到 12 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    reback() {
      // resetFields是element-ui 给的api， xxx.resetFields（），对整个表单进行重置，将所有字段值重置为初始值并移除校验结果
      // this.$refs.rule 代表的是这整个表单
      this.$refs.rule.resetFields()
    },
    login() {
      // 点击登录执行函数，通过ajax调用接口
      // validate是element-ui 给的api,  xxx.validate(),对整个表单进行校验的方法，参数为一个回调函数。该回调函数会在校验结束后被调用，并传入两个参数：是否校验成功和未通过校验的字段。若不传入回调函数，则会返回一个 promise
      this.$refs.rule.validate(async check => {
        // ajax中的回调函数尽量使用箭头函数，以防this指向问题。
        // check是个变量，表示布尔值。如果!check，表示返回值是false，则不发起ajax请求
        if (!check) return
        // 发起post请求，携带的数据格式和this.form一样，所以就使用this.form
        // 用es6新语法，async await 直接返回的就是 promise 中的data，后台返回的数据就在data中。然后用解构新语法，{}。等号右边就是返回的data，解构到{ data: res }的res就是后台返回的真实数据。
        const { data: res } = await this.axios.post('login', this.form)
        // 如果返回数据中meta.status不是200 则表示登陆失败，则要弹出一个消息框。直接使用element-ui的api组件
        if (res.meta.status !== 200) return this.$message.error('登陆失败')
        // 如果返回数据中meta.status是200，则表示登陆成功，则把返回的token储存到window.sessionStorage中
        window.sessionStorage.setItem('token', res.data.token)
        // 然后通过编程式导航的办法，跳转到home页面
        // 在 Vue 实例内部，你可以通过 $router 访问路由实例。因此你可以调用 this.$router.push('接口地址)
        this.$message.success('登陆成功')
        this.$router.push('/home')
      })
    }
  }
}
</script>

<style scoped>
.login_bg {
  background-color: #2b4b6b;
  height: 100%;
}
.login_box {
  width: 450px;
  height: 300px;
  background-color: #fff;
  border-radius: 3px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
.avatar_box {
  height: 130px;
  width: 130px;
  border: 1px solid #eee;
  border-radius: 50%;
  padding: 10px;
  box-shadow: 0 0 10px #ddd;
  position: absolute;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #fff;
}
img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: #eee;
}
.from_box {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
}
.btns {
  display: flex;
  justify-content: flex-end;
}
</style>
