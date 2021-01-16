<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <!-- ：to属性直接设置path就可以跳转 -->
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="addroles = true">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 表单区域 -->
      <template>
        <el-table :data="roleslist" style="width: 100%" border stripe row-key="id">
          <!-- 标签展开列 -->
          <el-table-column type="expand">
            <template slot-scope="props">
              <!-- 渲染一级标签 -->
              <el-row v-for="(item1, i1) in props.row.children" :key="item1.id" :class="['bottombd', i1 === 0 ? 'topbd' : '', 'mind']">
                <el-col :span="5">
                  <!-- 添加关闭icon 并添加关闭事件，并传递此行数据和相应数据的id -->
                  <el-tag closable @close="handleClose(props.row, item1.id)">{{ item1.authName }}</el-tag>
                  <i class="el-icon-caret-right"></i>
                </el-col>
                <el-col :span="19">
                  <!-- 渲染二级标签 -->
                  <el-row :key="item2.id" v-for="(item2, i2) in item1.children" :class="[i2 === 0 ? '' : 'topbd', 'mind']">
                    <el-col :span="6">
                      <el-tag type="success" closable @close="handleClose(props.row, item2.id)">{{ item2.authName }}</el-tag>
                      <i class="el-icon-caret-right"></i>
                    </el-col>
                    <el-col :span="18">
                      <!-- 渲染三级标签 -->
                      <el-tag type="warning" :key="item3.id" v-for="item3 in item2.children" closable @close="handleClose(props.row, item3.id)">{{ item3.authName }}</el-tag>
                    </el-col>
                  </el-row>
                </el-col>
              </el-row>
            </template>
          </el-table-column>
          <!-- 设置type属性为index即可显示从 1 开始的索引号  -->
          <el-table-column type="index"></el-table-column>
          <!--prop中的数据都是从后台返回的数据  -->
          <el-table-column prop="roleName" label="角色名称"></el-table-column>
          <el-table-column prop="roleDesc" label="角色描述"> </el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <!-- 修改按钮 -->
              <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
              <!-- 删除按钮 -->
              <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
              <!-- 分配权限按钮 -->
              <el-button type="warning" icon="el-icon-setting" size="mini" @click="showroles(scope.row)">分配权限</el-button>
            </template>
          </el-table-column>
        </el-table>
      </template>
      <!-- 分配权限弹窗 -->
      <el-dialog title="分配权限" :visible.sync="dialogVisible" width="50%" @close="closedialog">
        <!-- 树型结构 -->
        <!-- node-key，每个树节点用来作为唯一标识的属性，整棵树应该是唯一的。因为我们的数据treedata里唯一标识本来就是id，所以我们就用“id”来表示这个唯一标识-->
        <el-tree :data="treedata" :props="defaultProps" show-checkbox node-key="id" default-expand-all :default-checked-keys="keyarr" ref="treeRef"></el-tree>
        <span slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="makeroles">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      roleslist: [],
      dialogVisible: false,
      treedata: [],
      defaultProps: {
        children: 'children',
        label: 'authName'
      },
      keyarr: [],
      roleId: ''
    }
  },
  created() {
    this.getroleslist()
  },
  methods: {
    async getroleslist() {
      const { data: res } = await this.axios.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.roleslist = res.data
    },
    addroles() {},
    // 点击tag标签的关闭icon，执行该函数。先根据this.$confirm弹出是否删除的弹窗。点击确认则调用删除角色指定权限接口。
    handleClose(item, id) {
      this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          const { data: res } = await this.axios.delete(`roles/${item.id}/rights/${id}`)
          if (res.meta.status !== 200) {
            return this.$message.error(res.meta.msg)
          }
          this.$message({
            type: 'success',
            message: res.meta.msg
          })
          // 调用成功后如果用getroleslist从新渲染数据的话，会导致页面刷新，展开栏就会关闭。所以调用成功后，把后台返回的最新数据直接赋值给item.children
          item.children = res.data
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    },
    // 点击分配权限按钮，获取所有权限列表的数据和该角色拥有权限数据的id，此处调用两个接口
    async showroles(item) {
      // 把该角色的权限id保存到变量roleId中，以便添加权限时使用
      this.roleId = item.id
      const { data: res } = await this.axios.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      // 把所有权限的数据赋值给treedata变量，渲染tree初始样式
      this.treedata = res.data
      // 获取该角色的三级权限的id，得到的id会添加到变量keyarr里面，自动渲染到tree页面上。
      this.getallkeys(item, this.keyarr)
      // 打开弹窗
      this.dialogVisible = true
    },
    // 利用递归，获取所有三级权限的id，利用for循环，key是所有的数据，arr是一个数组。给所有数据进行for循环，如果key里面没有children属性的话，证明key是三级权限，那就将这个key用arr.push的方法添加到数组中，如果key有children属性的话，就继续执行循环。
    getallkeys(key, arr) {
      if (!key.children) {
        return arr.push(key.id)
      }
      key.children.forEach(key1 => {
        this.getallkeys(key1, arr)
      })
    },
    // 监听弹窗的关闭事件，关闭时将keyarr数据清空，否则再次点击分配角色按钮时会，keyarr数组中还是上次操作时赋的值。
    closedialog() {
      this.keyarr = []
    },
    // 点击确认，调用角色授权接口，授权成功后从新渲染页面。
    async makeroles() {
      // 通过this.$refs.treeRef调用选中和半选中节点的id，通过展开运算符添加到一个新数组keys中，然后通过join分割成字符串保存到keystr。
      const keys = [...this.$refs.treeRef.getCheckedKeys(), ...this.$refs.treeRef.getHalfCheckedNodes()]
      const keystr = keys.join(',')
      const { data: res } = await this.axios.post(`roles/${this.roleId}/rights`, {
        rids: keystr
      })
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.$message.success(res.meta.msg)
      this.getroleslist()
      this.dialogVisible = false
    }
  }
}
</script>

<style scoped>
.topbd {
  border-top: 1px solid #ccc;
}
.bottombd {
  border-bottom: 1px solid #ccc;
}
.mind {
  display: flex;
  align-items: center;
}
.el-tag {
  margin: 8px;
}
</style>
