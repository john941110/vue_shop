<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <!-- ：to属性直接设置path就可以跳转 -->
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 头部搜索区域 -->
      <!-- gutter是同一row（行）中行col（列）之间的距离， span是表示当前这一列占几等分。一行被分成24等分。:span="8"的意思是这一列的长度是总长的8/24份-->
      <el-row :gutter="20">
        <el-col :span="8"
          ><div>
            <!-- 给搜索框双向绑定数据 设置清空属性  绑定@clear事件，执行获取用户数据，恢复用户数据 -->
            <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getusers">
              <!-- 给搜索按钮绑定点击事件，会自动获取input框中绑定的数据，保存执行获取相应数据的用户 -->
              <el-button slot="append" icon="el-icon-search" @click="getusers"></el-button>
            </el-input></div
        ></el-col>
        <el-col :span="4"
          ><div>
            <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
          </div></el-col
        >
      </el-row>
      <!-- 表格区域 -->
      <!-- el-table元素中注入data对象数组后，在el-table-column中用prop属性来对应对象中的键名即可填入数据，所以userslist是从后台获取到的数据-->
      <!-- stripe属性可以创建带斑马纹的表格   border属性可以添加边框 -->
      <template>
        <el-table :data="userslist" style="width: 100%" border stripe>
          <!-- 设置type属性为index即可显示从 1 开始的索引号  -->
          <el-table-column type="index"></el-table-column>
          <!--prop中的数据都是从后台返回的数据  -->
          <el-table-column prop="username" label="姓名"></el-table-column>
          <el-table-column prop="email" label="邮箱"> </el-table-column>
          <el-table-column prop="mobile" label="电话"> </el-table-column>
          <el-table-column prop="role_name" label="角色"> </el-table-column>
          <el-table-column prop="mg_state" label="状态">
            <!-- 设置slot-scope="scope" 可以通过scope.row获取这一行的数据-->
            <!-- v-model="scope.row.mg_state" 双向绑定了这一行的状态 ,switch 状态发生变化时执行change事件，同时scope.row.mg_state会发生改变。 然后将这一行数据传递过去，进行ajax请求修改数据-->
            <template slot-scope="scope">
              <el-switch v-model="scope.row.mg_state" active-color="#13ce66" inactive-color="#ff4949" @change="userStateChanged(scope.row)"> </el-switch>
            </template>
          </el-table-column>
          <!-- 操作栏 -->
          <el-table-column label="操作" width="180px">
            <template slot-scope="scope">
              <!-- 修改按钮 -->
              <el-button type="primary" icon="el-icon-edit" size="mini" @click="editusershow(scope.row.id)"></el-button>
              <!-- 删除按钮 -->
              <el-button type="danger" icon="el-icon-delete" size="mini" @click="delusershow(scope.row.id)"></el-button>
              <!-- 分配角色按钮 ，选中会有弹出信息提示-->
              <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
                <el-button type="warning" icon="el-icon-setting" size="mini" @click="roleusershow(scope.row)"></el-button>
              </el-tooltip>
            </template>
          </el-table-column>
        </el-table>
      </template>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
      <!-- 添加用户区域 -->
      <!-- :visible.sync="布尔值"   布尔值为false时，弹窗关闭。值为true时，弹窗弹出。调用关闭弹窗事件，关闭弹窗重置表单-->
      <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
        <!-- 添加用户表单区域 ,ref是为了获取整个表单这个元素或组件,rules是验证规则的属性,model储存的是是整个表单的数据-->
        <el-form :model="addruleForm" :rules="addrules" ref="refaddForm" label-width="70px">
          <!-- prop是验证规则的名称  -->
          <el-form-item label="用户名" prop="username">
            <el-input v-model="addruleForm.username"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="addruleForm.password"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="addruleForm.email"></el-input>
          </el-form-item>
          <el-form-item label="电话" prop="mobile">
            <el-input v-model="addruleForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <!-- 按钮区域 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <!-- 点击确定，执行添加用户函数 -->
          <el-button type="primary" @click="adduser">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 编辑用户区域 -->
      <el-dialog title="编辑用户" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
        <!-- 表单区域 -->
        <el-form :model="editruleForm" :rules="addrules" ref="refeditForm" label-width="70px">
          <el-form-item label="用户名">
            <el-input v-model="editruleForm.username" disabled></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="editruleForm.email"></el-input>
          </el-form-item>
          <el-form-item label="电话" prop="mobile">
            <el-input v-model="editruleForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <!-- 按钮区域 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <!-- 点击确定，执行编辑用户函数 -->
          <el-button type="primary" @click="edituser">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 分配角色区域 -->
      <el-dialog title="分配角色" :visible.sync="rolesDialogVisible" width="50%" @close="roleDialogClosed">
        <!-- 内容区域 -->
        <p>
          <span>当前的用户:</span>
          <!-- rolesinfo就是所选择的这一行的所有数据集合  -->
          <span v-text="rolesinfo.username"></span>
        </p>
        <p>
          <span>当前的角色:</span>
          <span v-text="rolesinfo.role_name"></span>
        </p>
        <p>
          <span>分配新角色:</span>
          <span>
            <!-- 双向数据绑定rolesid变量，选到哪个角色，rolesid就是相应角色的id值，然后通过分配角色接口，把这个rolesid值传给后台。 -->
            <el-select v-model="rolesid" placeholder="请选择">
              <el-option v-for="item in roleslist" :key="item.id" :label="item.roleName" :value="item.id"> </el-option>
            </el-select>
          </span>
        </p>
        <!-- 按钮区域 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="rolesDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="roleuser">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    // 自定义验证邮箱的正则表达式,rule是规则本身，value是验证的数据，callback验证后的操作
    var checkEmail = (rule, value, callback) => {
      // 定义正则表达式regEmail
      const regEmail = /^\w+@\w+(\.\w+)+$/
      // regEmail.test(value) 如果验证通过，就执行回调函数,正常显示成功状态
      if (regEmail.test(value)) {
        return callback()
      }
      //没有验证通过，则返回一个错误提示，固定在callback函数中用new Error（“错误信息”）
      callback(new Error('请输入合法的邮箱'))
    }
    var checkMobile = (rule, value, callback) => {
      const regMobile = /^1[34578]\d{9}$/
      if (regMobile.test(value)) {
        return callback()
      }
      //返回一个错误提示
      callback(new Error('请输入合法的手机号码'))
    }
    return {
      // 设置queryInfo，发起get请求需要带的参数。
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 2
      },
      // 总数据条数
      total: 0,
      // 返回的用户数据
      userslist: [],
      // 添加用户弹窗是否显示，用addDialogVisible变量来控制，默认不显示，值为false。
      addDialogVisible: false,
      // 编辑用户弹窗是否显示，用editDialogVisible变量来控制，默认不显示，值为false。
      editDialogVisible: false,
      addruleForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      editruleForm: {},
      // 设置变量用来储存添加用户表单的正则验证。
      addrules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 3, max: 15, message: '长度在 3 到 15 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          // 自定义的验证规则，用validator属性来表示。
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入电话', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 分配角色弹窗是否显示，用rolesDialogVisible变量来控制，默认不显示，值为false。
      rolesDialogVisible: false,
      // 设置rolesinfo，保存选中这一行的数据，以便在页面显示
      rolesinfo: {},
      // 设置roleslist，保存从角色列表接口获取到的数据，以便在el-select中使用
      roleslist: [],
      // 设置rolesid，用来保存选中角色的id
      rolesid: ''
    }
  },
  created() {
    // 页面加载时就获取用户数据
    this.getusers()
  },
  methods: {
    // 设置获取用户的请求函数
    async getusers() {
      const { data: res } = await this.axios.get('users', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      // 把数据的总数量赋值给total变量
      this.total = res.data.total
      // 把用户数据赋值给userslist变量，用来渲染整个列表
      this.userslist = res.data.users
    },
    // 监测分页区域中，每页多少条数据，然后赋值给变量queryInfo.pagesize，然后发起获取数据的请求，从新渲染页面
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getusers()
    },
    // 监测当前显示第几页，然后赋值给变量queryInfo.pagenum，然后发起获取数据的请求，从新渲染页面
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getusers()
    },
    // 监测开关状态，改变后台的状态值，如果调用接口失败，就把值改为取反值。如果调用接口成功，就把传递过来的mg_state值赋值给mg_state
    async userStateChanged(userinfo) {
      const { data: res } = await this.axios.put(`users/${userinfo.id}/state/${userinfo.mg_state}`)
      if (res.meta.status !== 200) {
        // 如果调用接口失败，就把值改为取反值
        userinfo.mg_state = !userinfo.mg_state
        return this.$message.error(res.meta.msg)
      }
      // 调用接口成功，则返回成功的消息
      this.$message.success(res.meta.msg)
    },
    // 监听添加用户对话框的关闭事件,表单关闭，则执行resetFields，重置表单并移除校验效果
    addDialogClosed() {
      this.$refs.refaddForm.resetFields()
    },
    // 点击确定按钮，执行添加用户事件。先用validate属性进行表单的预验证功能，如果预验证通过，就可以进行请求接口，然后返回成功消息，调用获取用户数据函数，将addDialogVisible改为false，从而关闭表单。
    adduser() {
      this.$refs.refaddForm.validate(async check => {
        if (!check) return
        const { data: res } = await this.axios.post('users', this.addruleForm)
        if (res.meta.status !== 201) {
          return this.$message.error(res.meta.msg)
        }
        this.$message.success(res.meta.msg)
        this.getusers()
        this.addDialogVisible = false
      })
    },
    // 点击编辑按钮，调用根据id获取用户信息接口。把此用户信息赋值给editruleForm，用来渲染编辑表单输入框的数据，然后editDialogVisible值改为true，打开编辑用户弹窗
    async editusershow(id) {
      const { data: res } = await this.axios.get('users/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.editruleForm = res.data
      this.editDialogVisible = true
    },
    // 监听编辑用户对话框的关闭事件,表单关闭，则执行resetFields，重置表单并移除校验效果
    editDialogClosed() {
      this.$refs.refeditForm.resetFields()
    },
    // 点击确定按钮，执行编辑用户事件。先用validate属性进行表单的预验证功能，如果预验证通过，就可以进行请求接口，然后返回成功消息，调用获取用户数据函数，将editDialogVisible改为false，从而关闭表单。
    edituser() {
      this.$refs.refeditForm.validate(async check => {
        if (!check) return
        const { data: res } = await this.axios.put('users/' + this.editruleForm.id, {
          email: this.editruleForm.email,
          mobile: this.editruleForm.mobile
        })
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg)
        }
        this.$message.success(res.meta.msg)
        this.getusers()
        this.editDialogVisible = false
      })
    },
    // 点击删除按钮，调用$confirm会弹出提示框，返回值是一个promise，点击取消执行.catch的函数。点击确认，执行.then里的函数
    delusershow(id) {
      this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          // 点击确认按钮，调用根据id删除用户的接口。删除成功后从新获取数据，刷新页面
          const { data: res } = await this.axios.delete(`users/${id}`)
          if (res.meta.status !== 200) {
            return this.$message.error(res.meta.msg)
          }
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
          this.getusers()
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    },
    // 点击分配角色按钮，将这一行数据赋值给变量rolesinfo，这样就可以在页面中显示。然后调用获取所有角色的接口，赋值给roleslist，以便选择框里有所有角色的选项。然后打开弹窗
    async roleusershow(item) {
      this.rolesinfo = item
      const { data: res } = await this.axios.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.roleslist = res.data
      this.rolesDialogVisible = true
    },
    // 点击确定，调用分配角色接口。rolesinfo.id是该角色的id，rolesid是选项框所选择的角色id。调用接口成功后，从新获取用户列表，关闭弹窗。
    async roleuser() {
      const { data: res } = await this.axios.put(`users/${this.rolesinfo.id}/role`, {
        rid: this.rolesid
      })
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.$message.success(res.meta.msg)
      this.getusers()
      this.rolesDialogVisible = false
    },
    // 关闭弹窗，清空rolesid，rolesinfo这两个变量。以防下次打开按钮，选项框还是之前的值。
    roleDialogClosed() {
      this.rolesid = ''
      this.rolesinfo = {}
    }
  }
}
</script>

<style scoped>
span {
  margin-left: 20px;
}
</style>
