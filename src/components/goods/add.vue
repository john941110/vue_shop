<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <!-- ：to属性直接设置path就可以跳转 -->
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <!-- 警告区域 -->
      <el-row>
        <el-alert title="添加商品信息！" type="info" show-icon :closable="false" center> </el-alert>
      </el-row>
      <!-- 步骤条 -->
      <!-- active -->
      <el-steps :space="200" :active="activeName - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- tabs标签页 -->
      <el-form :model="infoform" :rules="inforules" ref="inforef" label-width="100px" label-position="top">
        <!-- before-leave是切换页面之前做的判断，如果条件选择了三级分类，才可以切换到下一个tab标签页 -->
        <el-tabs v-model="activeName" @tab-click="handleClick" tab-position="left" :before-leave="isok">
          <!-- 基本信息tab -->
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="infoform.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="infoform.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="infoform.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="infoform.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader v-model="infoform.goods_cat" :options="kindlist" :props="cascaderProps" @change="parentCateChanged"></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <!-- 商品参数tab -->
          <el-tab-pane label="商品参数" name="1">
            <!-- 一个el-form-item就是一项动态参数，所以在el-form-item里面循环渲染manyTableData，label就是每一个item的 attr_name值-->
            <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
              <!-- 复选框组里面绑定的数据是每一项动态参数的attr_vals属性。 -->
              <el-checkbox-group v-model="item.attr_vals">
                <!-- 循环动态参数的attr_vals属性，把数组中的每一个数据渲染到复选框中。循环出来的每一项就是显示在每一个复选框的内容。 -->
                <el-checkbox :label="item1" v-for="(item1, i) in item.attr_vals" :key="i" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <!-- 商品属性tab -->
          <!-- 循环渲染onlyTableData数据，label显示的是attr_name的值，输入框的内容显示的是attr_vals -->
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" prop="goods_name" v-for="item in onlyTableData" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <!-- 上传图片tab -->
          <!-- 因为上传图片功能用的不是我们设置好的axios。所以我们要从新设置请求头headers和请求的真实地址 所以action和headers是必选项-->
          <el-tab-pane label="商品图片" name="3">
            <el-upload :action="url" :headers="headers" :on-preview="handlePreview" :on-remove="handleRemove" :on-success="handleSuccess" list-type="picture">
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <!-- 文本编辑tab -->
          <el-tab-pane label="商品内容" name="4">
            <quill-editor v-model="infoform.goods_introduce"></quill-editor>
            <!-- 添加商品的按钮 -->
            <el-button type="primary" class="btnAdd" @click="add">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 图片预览的弹出框 -->
    <el-dialog title="图片预览" :visible.sync="previewVisible" width="50%">
      <span>
        <!-- 点击图片预览，里面就显示一张图片。地址是动态变化的，所以要加冒号。 -->
        <img :src="previewPath" class="previewImg" />
      </span>
    </el-dialog>
  </div>
</template>

<script>
var _ = require('lodash')
export default {
  data() {
    return {
      activeName: '0',
      // 添加商品接口所需要的数据。
      infoform: {
        // 双向数据绑定在基本信息tab的输入框中
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        // 商品所属的分类数组,级联菜单里的数据
        goods_cat: [],
        // 图片的数组
        pics: [],
        // 商品的详情描述
        goods_introduce: '',
        attrs: []
      },
      inforules: {
        goods_name: {
          required: true,
          message: '请输入商品名称',
          trigger: 'blur'
        },
        goods_price: {
          required: true,
          message: '请输入商品价格',
          trigger: 'blur'
        },
        goods_weight: {
          required: true,
          message: '请输入商品重量',
          trigger: 'blur'
        },
        goods_number: {
          required: true,
          message: '请输入商品数量',
          trigger: 'blur'
        },
        goods_cat: {
          required: true,
          message: '请选择商品分类',
          trigger: 'blur'
        }
      },
      // 级联菜单的配置属性
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover'
      },
      kindlist: [],
      // 级联菜单里所选的最终类的id
      cateId: 0,
      // 动态参数的数据
      manyTableData: [],
      // 静态属性的数据
      onlyTableData: [],
      // 上传图片的URL地址，后台的真实地址加上图片上传的路径upload
      url: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 图片上传组件的headers请求头对象,必须是对象格式。
      headers: { Authorization: window.sessionStorage.getItem('token') },
      // 点击预览图片时，判断是否弹出显示框的变量
      previewVisible: false,
      // 图片的地址
      previewPath: ''
    }
  },
  methods: {
    // 获取所有数据列表赋值给kindlist,用来渲染级联菜单
    async getkindlist() {
      const { data: res } = await this.axios.get('categories')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.kindlist = res.data
    },
    // 当级联菜单发生变化时，把级联菜单绑定的数据infoform.goods_cat数组里的最后一个id数赋值给cateId，这样就可以选择到所选数据的id了
    parentCateChanged() {
      // 如果选择的不是三级分类，清空输入框数据。把当前输入框数据的第三级分类的id赋值给cateId。
      if (this.infoform.goods_cat.length !== 3) {
        this.infoform.goods_cat = []
        return
      }
      this.cateId = this.infoform.goods_cat[this.infoform.goods_cat.length - 1]
    },
    // 默认的显示标签页是activeName===“0”，然后判断如果即将离开的标签页是0 , 并且级联菜单里的数据长度不等于3。那么将不允许切换tab栏。
    isok(activeName, oldActiveName) {
      // console.log('即将离开的标签页名字是：' + oldActiveName)
      // console.log('即将进入的标签页名字是：' + activeName)
      // return false
      if (oldActiveName === '0' && this.infoform.goods_cat.length !== 3) {
        this.$message.error('请先选择商品分类！')
        return false
      }
    },
    // 获取分类数据列表，判断this.activeName是不是等于1，如果等于1，证明点击的是动态参数tab，如果是2的话，证明点击的是静态属性tab。那么就发送请求，把数据分别保存到不同的变量中。
    async handleClick() {
      if (this.activeName === '1') {
        const { data: res } = await this.axios.get(`categories/${this.cateId}/attributes/`, {
          params: { sel: 'many' }
        })
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        // 获取数据成功后，就把数据根据循环一遍，把每份数据里面的attr_vals属性转换成数组类型，以便循环渲染到页面。
        res.data.forEach(item => {
          // 判断每一项数组里是否为空，空的话就返回空数组，不为空的话，就用逗号进行分割。饭后再把返回的值重新赋值给数据的attr_vals属性，这样页面渲染的时候就把数据格式分析好了
          item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : []
          // 数据处理好之后再把处理过的数据赋值给manyTableData，用来渲染动态参数tab
          this.manyTableData = res.data
        })
      } else if (this.activeName === '2') {
        const { data: res } = await this.axios.get(`categories/${this.cateId}/attributes/`, {
          params: { sel: 'only' }
        })
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.onlyTableData = res.data
      }
    },
    // file代表的是点击的那张图片
    // 点击已经上传到页面上的图片时执行的函数。点击图片跳出弹窗，预览图片.将图片的response属性中的data里面的url赋值给previewPath。然后将控制弹窗的变量改为true。这样就可以在预览框显示该图片
    handlePreview(file) {
      this.previewPath = file.response.data.url
      this.previewVisible = true
    },
    // 照片上传到数据库之后，
    handleSuccess(response) {
      // 1.因为后台要求请求时pics数据是一个数组，每一项都是一个以pic为属性，图片地址为值的对象。所以要对 拼接得到一个图片信息对象
      const picInfo = { pic: response.data.tmp_path }
      // 2. 将图片信息对象，push 到传递给后台的pics数组中
      this.infoform.pics.push(picInfo)
    },
    // 删除已经上传的到页面的图片时执行的函数
    handleRemove(file) {
      // console.log(file)
      // 1. 把该图片的路径赋值给filePath，用来下一步的判断。
      const filePath = file.response.data.tmp_path
      // 2. 从infoform.pics 数组中，找到这个图片对应的索引值,使用findIndex。findIndex()里面的参数是个函数，首先会遍历数组，如果数组中有这个键为pic，值为filePath的对象，那么就返回这个元素在数组中的索引号i，如果没有的话，返回值 i= -1.

      const i = this.infoform.pics.findIndex(val => val.pic === filePath)
      // 3. 调用数组的 splice 方法，利用得到的索引i，把图片信息对象，从 pics 数组中移除
      this.infoform.pics.splice(i, 1)
    },
    // 点击添加按钮，调用预验证。预验证通过后调用添加商品接口。完成添加商品
    add() {
      this.$refs.inforef.validate(async valid => {
        if (!valid) return this.$message.error('请填写必要的表单项！')
        // 利用lodash的cloneDeep函数，克隆一份数据。改变这份数据中的goods_cat，将数组通过join的方式转变成字符串。提交数据的时候就提交克隆之后的数据
        var form = _.cloneDeep(this.infoform)
        form.goods_cat = form.goods_cat.join(',')
        // 准备动态参数的数据，给manyTableData进行循环，每一项数据生成一个对象。对象第一个键为attr_id的值为数据中attr_id，第二个键为attr_value的值为数据中心attr_vals的字符串。然后把循环出来的每一项添加到infoform.attrs这个数组中，然后再赋值给form。进行最后数据的提交
        this.manyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(',')
          }
          this.infoform.attrs.push(newInfo)
        })
        // 准备静态属性
        this.onlyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          this.infoform.attrs.push(newInfo)
        })
        form.attrs = this.infoform.attrs
        // 数据准备好之后，进行ajax提交。成功后跳转至商品列表页面。
        const { data: res } = await this.axios.post('goods', form)
        if (res.meta.status !== 201) return this.$message.error(res.meta.msg)
        this.$message.success(res.meta.msg)
        this.$router.push('/goods')
      })
    }
  },
  created() {
    this.getkindlist()
  }
}
</script>

<style scoped>
.el-steps {
  margin: 20px 0;
}
.previewImg {
  width: 100%;
}
.btnAdd {
  margin-top: 15px;
}
</style>
