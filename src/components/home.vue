<template>
  <el-container class="bg">
    <!-- 头部区域 -->
    <el-header>
      <div>
        <img src="../assets/heima.png" class="logo" />
        <span class="logofont">电商后台管理系统</span>
      </div>
      <!-- 退出按钮，绑定退出事件 -->
      <el-button type="info" @click="out">退出</el-button>
    </el-header>
    <!-- 侧边栏区域 -->
    <el-container>
      <!-- 加一个判断条件，如果isCollapse值为true的话侧边栏的宽度为64px。如果isCollapse值为false的话侧边栏的宽度为200px -->
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <!-- 侧边栏伸缩按钮 -->
        <!-- 绑定toggleCollapse事件，切换isCollapse的布尔值。 -->
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <!--  default-active，当前激活菜单的index，index值必须为string。 unique-opened保持一个子菜单的展开， router开启路由模式，会以index的值为path进行页面跳转， collapse水平折叠收起菜单，因为要点击切换，所以值为isCollapse变量，默认为false。 collapse-transition关闭折叠动画-->
        <el-menu
          :default-active="activePath"
          background-color="#333744"
          text-color="#fff"
          active-text-color="#409EFF"
          unique-opened
          router
          :collapse="isCollapse"
          :collapse-transition="false"
        >
        <!-- 一级导航栏 -->
          <el-submenu
            :index="item.id + ''"
            v-for="item in asidelist"
            :key="item.id"
          >
            <template slot="title">
              <!-- 字体图标是通过设置变量，附加的一个类名 -->
              <i :class="iconsObj[item.id]"></i>
              <span v-text="item.authName"></span>
            </template>
            <!-- 二级导航栏 ，通过返回数据中的children属性遍历循环得到，因为二级导航是需要被点击跳转的，所以：index设置为真正要跳转到的端口地址。然后绑定点击事件，执行saveNavState函数，这样default-active的值就会变成真正的端口，就会得以真正的跳转-->
            <el-menu-item
              v-for="item_s in item.children"
              :key="item_s.id"
              :index="'/' + item_s.path"
              @click="saveNavState('/' + item_s.path)"
            >
              <template slot="title">
                <i class="el-icon-s-tools "></i>
                <span v-text="item_s.authName"></span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 主体区域 -->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  created() {
    // 进入页面先调用获取侧边栏函数
    this.getaside()
    // 刷新页面的时候，可以把存到sessionStorage里的activePath赋值给变量activePath，这样保证页面刷新的时候，高亮效果还保持在之前点击的导航上，且页面不会跳转的其他导航栏
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  data() {
    return {
      // 接收后台返回的侧边栏数据
      asidelist: [],
      // 设置iconsObj v-for的时候可以把一级导航的字体图标换掉
      iconsObj: {
        125: 'iconfont icon-user',
        103: 'iconfont icon-tijikongjian',
        101: 'iconfont icon-shangpin',
        102: 'iconfont icon-danju',
        145: 'iconfont icon-baobiao'
      },
      // 设置activePath 用来保存自导航的path，默认是string
      activePath: '',
      // 设置isCollapse 用来检测侧边栏的伸缩状态
      isCollapse: false
    }
  },
  methods: {
    // 点击折叠按钮，变量isCollapse的值会取反。
    toggleCollapse() {
      this.isCollapse = !this.isCollapse
    },
    // 点击退出按钮清除token，调用编程式导航跳转到login页面
    out() {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    // 获取侧边栏数据，把返回的数据保存到asidelist变量中，利用v-for可以渲染页面的侧边栏
    async getaside() {
      const { data: res } = await this.axios.get('menus')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.asidelist = res.data
    },
    // 点击导航时，将完整的地址端口传递过来，保存到页面的sessionStorage中的activePath里，然后再把端口赋值给变量activePath。这样default-active就可以获取到正确的activePath了。
    saveNavState(val) {
      window.sessionStorage.setItem('activePath', val)
      this.activePath = val
    }
  }
}
</script>

<style scoped>
.bg {
  height: 100%;
}
.el-header {
  background-color: #373d41;
  font-size: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: 0;
}
.el-aside {
  background-color: #333744;
}
.el-main {
  background-color: #eaedf1;
}
.el-menu {
  border-right: none;
}
.logo {
  vertical-align: middle;
}
.logofont {
  margin-left: 10px;
  font-size: 20px;
  color: #fff;
}
.iconfont {
  margin-right: 10px;
}
.toggle-button {
  background-color: #4a5064;
  font-size: 10px;
  line-height: 24px;
  color: #fff;
  text-align: center;
  letter-spacing: 0.2em;
  cursor: pointer;
}
</style>
