<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <!-- ：to属性直接设置path就可以跳转 -->
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="addkind">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 表单区域 -->
      <!-- 根据全局组件tree-table。data是展示数据集合，columns是数据的展示方法 -->
      <tree-table class="tree" :data="kindlist" :columns="columns" show-index border index-text="#" :show-row-hover="false" :selection-type="false" :expand-type="false">
        <!-- 是否有效区域 -->
        <template slot="isok" slot-scope="scope">
          <i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color: lightgreen;"></i>
          <i class="el-icon-error" v-else style="color: red;"></i>
        </template>
        <!-- 排序区域 -->
        <template slot="tag" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag type="success" v-else-if="scope.row.cat_level === 1">二级</el-tag>
          <el-tag type="warning" v-else>三级</el-tag>
        </template>
        <!-- 按钮区域 -->
        <template slot="button">
          <!-- 编辑按钮 -->
          <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
          <!-- 删除按钮 -->
          <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
        </template>
      </tree-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="querInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="querInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
    <!-- 添加商品分类区域 -->
    <el-dialog title="添加商品分类" :visible.sync="addDialogVisible" width="50%" @close="addCateDialogClosed">
      <el-form :model="addInfo" :rules="addrules" ref="addCateFormRef" label-width="100px">
        <el-form-item label="分类名称" prop="cat_name">
          <!-- v-model绑定的是addInfo数据中心的cat_name，这个addInfo数据是向服务器提交的数据，所以输入框的内容发生改变，则addInfo的cat_name属性发生改变，则向服务器提交的数据也会发生改变。  -->
          <el-input v-model="addInfo.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <!-- v-model是选中数据的id值，:options是级联菜单所要展示的数据，:props 是数据分类的依据，expand-trigger是选择的类型，（点击选择或者触摸选择） -->
          <el-cascader v-model="selectedKeys" :options="fatherkind" :props="cascaderProps" @change="parentCateChanged" clearable></el-cascader>
        </el-form-item>
      </el-form>
      <!-- 按钮区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <!-- 点击确定，执行添加用户函数 -->
        <el-button type="primary" @click="add">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 所有种类的列表
      kindlist: [],
      // 获取种类数据请求时携带的参数
      querInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      total: 0,
      addDialogVisible: false,
      // 所有父级种类
      fatherkind: [],
      addrules: {
        cat_name: { required: true, message: '请输入分类名称', trigger: 'blur' }
      },
      // 树状图的数据分类
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          type: 'template',
          template: 'isok'
        },
        {
          label: '排序',
          type: 'template',
          template: 'tag'
        },
        {
          label: '操作',
          type: 'template',
          template: 'button'
        }
      ],
      // 添加分类时所提交的数据
      addInfo: {
        // 将要添加的分类的名称
        cat_name: '',
        // 父级分类的Id
        cat_pid: 0,
        // 分类的等级，默认要添加的是1级分类
        cat_level: 0
      },
      // 级联菜单的数据分类，value是数据库的唯一标志，label是展示的内容，children是父子节点嵌套
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover',
        checkStrictly: true
      },
      // 选中的父级分类的Id数组
      selectedKeys: []
    }
  },
  methods: {
    // 监测分页区域中，每页多少条数据，然后赋值给变量queryInfo.pagesize，然后发起获取数据的请求，从新渲染页面
    handleSizeChange(newSize) {
      this.querInfo.pagesize = newSize
      this.getkindlist()
    },
    // 监测当前显示第几页，然后赋值给变量queryInfo.pagenum，然后发起获取数据的请求，从新渲染页面
    handleCurrentChange(newPage) {
      this.querInfo.pagenum = newPage
      this.getkindlist()
    },
    // 获取所有数据列表，返回的数据赋值给kindlist
    async getkindlist() {
      const { data: res } = await this.axios.get('categories', {
        params: this.querInfo
      })
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.kindlist = res.data.result
      this.total = res.data.total
    },
    // 当请求参数中type: 2时，获取所有父级分类的数据，赋值给fatherkind中，用于联级菜单。
    async getfatherlist() {
      const { data: res } = await this.axios.get('categories', {
        params: { type: 2 }
      })
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.fatherkind = res.data
    },
    // 级联菜单发生变化时，触发此函数。如果菜单没有数据则selectedKeys.length=0，则就让addInfo中的父级id和等级变成0，表明添加的是一级分类。如果菜单中有数据则selectedKeys.length > 0 ，则addInfo的id值等于数组中最后一个id，等级为菜单数据的长度
    parentCateChanged() {
      // 如果 selectedKeys 数组中的 length 大于0，证明选中的父级分类
      // 反之，就说明没有选中任何父级分类
      if (this.selectedKeys.length > 0) {
        // 父级分类的Id
        this.addInfo.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        // 为当前分类的等级赋值
        this.addInfo.cat_level = this.selectedKeys.length
      } else {
        // 父级分类的Id
        this.addInfo.cat_pid = 0
        // 为当前分类的等级赋值
        this.addInfo.cat_level = 0
      }
    },
    // 点击添加分类按钮，获取所有父级分类数据，打开弹窗
    addkind() {
      this.getfatherlist()
      this.addDialogVisible = true
    },
    // 点击确定，先预验证，通过了就调用添加接口，然后渲染数据，关闭弹窗
    add() {
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.axios.post('categories', this.addInfo)
        if (res.meta.status !== 201) {
          return this.$message.error(res.meta.msg)
        }
        this.$message.success(res.meta.msg)
        this.getkindlist()
        this.addDialogVisible = false
      })
    },
    // 关闭弹窗时清空数据
    addCateDialogClosed() {
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
      this.addInfo.cat_level = 0
      this.addInfo.cat_pid = 0
    }
  },
  created() {
    this.getkindlist()
  }
}
</script>

<style scoped>
.el-cascader,
.el-input {
  width: 100%;
}
.tree {
  margin: 20px 0;
}
</style>
