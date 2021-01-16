<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <!-- ：to属性直接设置path就可以跳转 -->
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <template>
        <el-table :data="rightslist" style="width: 100%" border stripe>
          <!-- 设置type属性为index即可显示从 1 开始的索引号  -->
          <el-table-column type="index"></el-table-column>
          <!--prop中的数据都是从后台返回的数据  -->
          <el-table-column prop="authName" label="权限名称"></el-table-column>
          <el-table-column prop="path" label="路径"> </el-table-column>
          <el-table-column label="权限等级">
            <template slot-scope="scope">
              <el-tag v-if="scope.row.level === '0'">一级</el-tag>
              <el-tag type="success" v-else-if="scope.row.level === '1'">二级</el-tag>
              <el-tag type="warning" v-else>三级</el-tag>
            </template>
          </el-table-column>
        </el-table>
      </template>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      rightslist: []
    }
  },
  created() {
    this.getrightslist()
  },
  methods: {
    async getrightslist() {
      const { data: res } = await this.axios.get('rights/' + 'list')
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.rightslist = res.data
    }
  }
}
</script>

<style scoped></style>
