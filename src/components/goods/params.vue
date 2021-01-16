<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <!-- ：to属性直接设置path就可以跳转 -->
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 警告区域 -->
      <el-row>
        <el-alert title="注意：只允许为第三级分类设置相关参数！" type="warning" show-icon :closable="false"> </el-alert>
      </el-row>
      <!-- 选择框区域 -->
      <el-row class="chose">
        <span>选择商品分类：</span>
        <el-cascader v-model="selectedKeys" :options="kindlist" :props="cascaderProps" @change="parentCateChanged"></el-cascader>
      </el-row>
      <!-- 参数展示区域 -->
      <template>
        <!-- v-model绑定的是tab中的name属性, -->
        <el-tabs v-model="activeName" type="card" @tab-click="handleClick">
          <!-- 动态参数区域 -->
          <el-tab-pane label="动态参数" name="many">
            <!-- 添加参数按钮区域 -->
            <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible = true">添加参数</el-button>
            <!-- 添加动态参数表单区域 -->
            <el-table :data="manyTableData" border stripe>
              <!-- 展开列 -->
              <!-- 展开列的每一列就是manyTableData数组中的一个数据，所以就用模板插槽，包裹这个tag组件，在插槽中可以获取这一列数据，数据就是编译过后的attr_vals属性。然后在tag组件for循环渲染出来 -->
              <el-table-column type="expand">
                <template slot-scope="scope">
                  <!-- 循环渲染Tag标签 -->
                  <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable @close="handleClose(i, scope.row)">{{ item }}</el-tag>
                  <!-- 输入的文本框，当渲染数据的时候，就会给每行数据绑定一个独有的inputVisible验证属性和双向数据绑定的变量，这样的话就保证了点击哪一行的输入框，输入提交的数据就只会传到那一行的后台数据。 -->
                  <el-input
                    class="input-new-tag"
                    v-if="scope.row.inputVisible"
                    v-model="scope.row.inputValue"
                    ref="saveTagInput"
                    size="small"
                    @keyup.enter.native="handleInputConfirm(scope.row)"
                    @blur="handleInputConfirm(scope.row)"
                  >
                  </el-input>
                  <!-- 添加按钮 -->
                  <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                </template>
              </el-table-column>
              <!-- 索引列 -->
              <el-table-column type="index"></el-table-column>
              <!-- prop属性是表格里展示的内容，这里绑定成为获取到后台数据的attr_name值 -->
              <el-table-column label="参数名称" prop="attr_name"></el-table-column>
              <!-- 操作列 -->
              <el-table-column label="操作">
                <template slot-scope="scope">
                  <el-button size="mini" type="primary" icon="el-icon-edit" @click="editkindinfo(scope.row.attr_id)">编辑</el-button>
                  <el-button size="mini" type="danger" icon="el-icon-delete" @click="delkindinfo(scope.row.attr_id)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
          <!-- 静态属性区域 -->
          <el-tab-pane label="静态属性" name="only">
            <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible = true">添加属性</el-button>
            <!-- 添加静态属性表单区域 -->
            <el-table :data="onlyTableData" border stripe>
              <!-- 展开列 -->
              <el-table-column type="expand">
                <template slot-scope="scope">
                  <!-- 循环渲染Tag标签 -->
                  <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable @close="handleClose(i, scope.row)">{{ item }}</el-tag>
                  <!-- 输入的文本框，当渲染数据的时候，就会给每行数据绑定一个独有的inputVisible验证属性和双向数据绑定的变量，这样的话就保证了点击哪一行的输入框，输入提交的数据就只会传到那一行的后台数据。 -->
                  <el-input
                    class="input-new-tag"
                    v-if="scope.row.inputVisible"
                    v-model="scope.row.inputValue"
                    ref="saveTagInput"
                    size="small"
                    @keyup.enter.native="handleInputConfirm(scope.row)"
                    @blur="handleInputConfirm(scope.row)"
                  >
                  </el-input>
                  <!-- 添加按钮 -->
                  <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                </template>
              </el-table-column>
              <!-- 索引列 -->
              <el-table-column type="index"></el-table-column>
              <el-table-column label="参数名称" prop="attr_name"></el-table-column>
              <el-table-column label="操作">
                <template slot-scope="scope">
                  <el-button size="mini" type="primary" icon="el-icon-edit" @click="editkindinfo(scope.row.attr_id)">编辑</el-button>
                  <el-button size="mini" type="danger" icon="el-icon-delete" @click="delkindinfo(scope.row.attr_id)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </template>
    </el-card>
    <!-- 添加属性弹窗区域 -->
    <!-- title动态变化，用运算属性得出titleText的最新值，然后显示在页面。因为用的是变量，所以要给title前加冒号，表示添加新属性-->
    <el-dialog :title="'添加' + titleText" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
      <el-form :model="addform" :rules="addrules" ref="addFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <!-- 此处绑定的是即将提交给后台的数据中的attr_name属性，输入框里的数据改变，证明即将添加的属性也同时改变 -->
          <el-input v-model="addform.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <!-- 按钮区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <!-- 点击确定，执行添加用户函数 -->
        <el-button type="primary" @click="addparam">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑弹出框 -->
    <el-dialog :title="'编辑' + titleText" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <el-form :model="editform" :rules="editrules" ref="editFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <!-- 此处绑定的是即将提交给后台的数据中的attr_name属性，输入框里的数据改变，证明即将添加的属性也同时改变 -->
          <el-input v-model="editform.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <!-- 按钮区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <!-- 点击确定，执行编辑用户函数 -->
        <el-button type="primary" @click="editparam">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 所有分类列表
      kindlist: [],
      // 级联菜单的数据分类
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover'
      },
      selectedKeys: [],
      activeName: 'many',
      // 所选三级分类的id
      cateId: 0,
      // 判断按钮是否可点击
      isBtnDisabled: true,
      // many列表的数据
      manyTableData: [],
      // only列表的数据
      onlyTableData: [],
      // 判断添加属性弹窗是否可以打开
      addDialogVisible: false,
      addrules: {
        attr_name: {
          required: true,
          message: '请输入参数名称',
          trigger: 'blur'
        }
      },
      // 添加属性时，后台需要的数据。和表单的:model属性绑定，发起添加请求时也会用到此变量。
      addform: {
        attr_name: ''
      },
      editDialogVisible: false,
      editform: {},
      editrules: {
        attr_name: {
          required: true,
          message: '请输入参数名称',
          trigger: 'blur'
        }
      }
    }
  },
  methods: {
    // 获取所有数据列表赋值给kindlist
    async getkindlist() {
      const { data: res } = await this.axios.get('categories')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.kindlist = res.data
    },
    // 当级联菜单发生变化时，把级联菜单绑定的数据selectedKeys数组里的最后一个id数赋值给cateId，这样就可以选择到所选数据的id了
    parentCateChanged() {
      this.cateId = this.selectedKeys[this.selectedKeys.length - 1]
      // 当级联菜单发生变化时，按钮可被点击。
      this.isBtnDisabled = false
      // 获取cateId的详细参数，渲染到页面。
      this.getkindinfo()
    },
    // 根据cateId获取次分类的详细参数，然后把获取到的数据赋值给manyTableData，用来渲染表格使用
    async getkindinfo() {
      // 如果选择的不是三级分类，那么就清空表单，按钮禁用，清空输入框数据。
      if (this.selectedKeys.length !== 3) {
        this.selectedKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        this.isBtnDisabled = true
        return
      }
      const { data: res } = await this.axios.get(`categories/${this.cateId}/attributes`, {
        params: { sel: this.activeName }
      })
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      // 请求成功后把数据用for循环处理，把数据里的每一项里的attr_vals属性的值转换成数组。以便展开列渲染数据
      res.data.forEach(item => {
        // 判断每一项数组里是否为空，空的话就返回空数组，不为空的话，就用逗号进行分割。饭后再把返回的值重新赋值给数据的attr_vals属性，这样页面渲染的时候就把数据格式分析好了
        item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : []
        // 在循环处理数据的时候，就给每一行数据里的添加按钮绑定一个控制文本框的显示与隐藏，这样当点击本行的按钮时才不会错点开其他行的输入框
        item.inputVisible = false
        // 在循环处理数据的时候，就给每一行数据里的添加按钮绑定一个文本框中输入的值，这样当书屋完成，提交数据的时候，就只会把数据提交到本行id的属性中。
        item.inputValue = ''
      })
      // 判断数据，如果点击的activeName是many的话，就把数据赋值给manyTableData，如果是only的话就把数据赋值给onlyTableData，以便渲染不同的表格
      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    },
    // tab被选中时也要触发数据请求
    handleClick() {
      this.getkindinfo()
    },
    // 添加属性，预验证，通过了就调用接口添加属性，成功后更新数据，关闭弹窗
    addparam() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.axios.post(`categories/${this.cateId}/attributes`, {
          attr_name: this.addform.attr_name,
          attr_sel: this.activeName
        })
        if (res.meta.status !== 201) {
          return this.$message.error(res.meta.msg)
        }
        this.$message.success(res.meta.msg)
        this.getkindinfo()
        this.addDialogVisible = false
      })
    },
    // 关闭弹窗时清空数据
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    // 根据行数据，编辑提交参数。
    async saveAttrVals(row) {
      const { data: res } = await this.axios.put(
        `categories/${this.cateId}/attributes/${row.attr_id}`,
        // 请求时需要的数据就是这一行的数据，所以attr_name就等于item.attr_name，但是因为后台接收的attr_vals数据是字符串，所以我们又要把已经转换成数组的数据再转换回字符串，用逗号分割。
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(',')
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.$message.success(res.meta.msg)
    },
    // 点击关闭按钮，传递该属性的id值和在数组中的index值。
    handleClose(i, row) {
      // 利用数组的删除方法，删除数据，返回值就是删除后的结果。因为双向数据绑定，所以数据删除了页面上也就少了。
      row.attr_vals.splice(i, 1)
      // 删除属性成功，此时页面已经删除，但是数据库没有删除这个数据，所以要调用根据id编辑属性的接口，把这次的数据更新传给后台。
      this.saveAttrVals(row)
    },
    // 点击添加按钮，本行绑定的控制输入框显示的变量为true，然后根据refs，获取到该组件，调用focus事件自动获取光标
    showInput(row) {
      row.inputVisible = true
      this.$nextTick(() => {
        this.$refs.saveTagInput.focus()
      })
    },
    // 当失去光标或者按下enter的时候，会执行这个函数。
    handleInputConfirm(row) {
      // 失去光标后，如果本行输入框的值，通过trim（）函数处理过之后，length还是为0的话，证明本次没有输入有效参数。那么就将输入框的值改成空，隐藏输入框，且return出去，终止这次操作。
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      // 如果没有return，则证明输入的内容，则需要将输入框的内容，添加到本行数据的attr_vals值中，因为tag是用这个参数渲染出来的。然后清空输入框，隐藏输入框。
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false
      // 更改数组的数据成功之后，此时页面已经添加上去了，但是数据库没有添加这个数据，所以要调用根据id编辑属性的接口，把这次的数据更新传给后台。
      this.saveAttrVals(row)
    },
    // 点击编辑按钮，根据传来本行的id，来调用接口，获取本行的数据，把本行的attr_name赋值给输入框文本。然后打开编辑弹框。
    async editkindinfo(id) {
      const { data: res } = await this.axios.get(`categories/${this.cateId}/attributes/${id}`, {
        // activeName会根据tab的切换而更改值，所以attr_sel永远都是this.activeName
        params: { attr_sel: this.activeName }
      })
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      // 将请求到的本行数据全部赋值给editform、这样的话，点击确定修改的按钮，就可以使用本行保存到editform的数据了
      this.editform = res.data
      this.editDialogVisible = true
    },
    // 关闭弹窗，清空里面的内容和验证规则
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    // 点击确认按钮，先预验证，通过后调用接口，接口用到的数据就是刚才根据id查询到保存到editform的数据。调用接口成功后，更新列表，从新渲染页面。关闭弹窗。
    editparam() {
      this.$refs.editFormRef.validate(async check => {
        if (!check) return
        const { data: res } = await this.axios.put(`categories/${this.cateId}/attributes/${this.editform.attr_id}`, {
          attr_name: this.editform.attr_name,
          attr_sel: this.activeName
        })
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg)
        }
        this.$message.success(res.meta.msg)
        this.getkindinfo()
        this.editDialogVisible = false
      })
    },
    delkindinfo(id) {
      this.$confirm('此操作将永久删除该属性, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          // 点击确认按钮，调用根据id删除属性的接口。删除成功后从新获取数据，刷新页面
          const { data: res } = await this.axios.delete(`categories/${this.cateId}/attributes/${id}`)
          if (res.meta.status !== 200) {
            return this.$message.error(res.meta.msg)
          }
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
          this.getkindinfo()
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    }
  },
  created() {
    this.getkindlist()
  },
  computed: {
    // 动态计算标题的文本
    titleText() {
      if (this.activeName === 'many') {
        return '动态参数'
      }
      return '静态属性'
    }
  }
}
</script>

<style scoped>
.chose {
  margin: 20px 0;
}
.input-new-tag {
  width: 120px;
}
</style>
