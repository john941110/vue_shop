<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <!-- ：to属性直接设置path就可以跳转 -->
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 头部搜索区域 -->
      <el-row :gutter="20">
        <el-col :span="8"
          ><div>
            <!-- 给搜索框双向绑定数据 设置清空属性  绑定@clear事件，执行获取商品数据，恢复商品数据 -->
            <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getlist">
              <!-- 给搜索按钮绑定点击事件，会自动获取input框中绑定的数据，保存执行获取相应数据的商品 -->
              <el-button slot="append" icon="el-icon-search" @click="getlist"></el-button>
            </el-input></div
        ></el-col>
        <el-col :span="4"
          ><div>
            <el-button type="primary" @click="goAddpage">添加商品</el-button>
          </div></el-col
        >
      </el-row>
      <!-- 表格区域 -->
      <template>
        <el-table :data="goodslist" style="width: 100%" border stripe>
          <!-- 设置type属性为index即可显示从 1 开始的索引号  -->
          <el-table-column type="index"></el-table-column>
          <!--prop中的数据都是从后台返回的数据  -->
          <el-table-column prop="goods_name" label="商品名称"></el-table-column>
          <el-table-column prop="goods_price" label="商品价格(元)" width="110px"> </el-table-column>
          <el-table-column prop="goods_weight" label="商品重量" width="110px"> </el-table-column>
          <el-table-column prop="add_time" label="创建时间" width="140px">
            <!-- 利用时间过滤器从新编译时间的格式 -->
            <template slot-scope="scope">
              {{ scope.row.add_time | dateFormat }}
            </template>
          </el-table-column>
          <!-- 操作栏 -->
          <el-table-column label="操作" width="140px">
            <template slot-scope="scope">
              <!-- 修改按钮 -->
              <el-button type="primary" icon="el-icon-edit" size="mini"></el-button>
              <!-- 删除按钮 -->
              <el-button type="danger" icon="el-icon-delete" size="mini" @click="delgoods(scope.row.goods_id)"></el-button>
            </template>
          </el-table-column>
        </el-table>
      </template>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 5
      },
      goodslist: [],
      total: 0
    }
  },
  methods: {
    async getlist() {
      const { data: res } = await this.axios.get('goods', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.goodslist = res.data.goods
      this.total = res.data.total
    },
    // 监测分页区域中，每页多少条数据，然后赋值给变量queryInfo.pagesize，然后发起获取数据的请求，从新渲染页面
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getlist()
    },
    // 监测当前显示第几页，然后赋值给变量queryInfo.pagenum，然后发起获取数据的请求，从新渲染页面
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getlist()
    },
    // 根据id删除本行数据
    delgoods(id) {
      this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          // 点击确认按钮，调用根据id删除属性的接口。删除成功后从新获取数据，刷新页面
          const { data: res } = await this.axios.delete(`goods/${id}`)
          if (res.meta.status !== 200) {
            return this.$message.error(res.meta.msg)
          }
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
          this.getlist()
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    },
    // 点击添加商品，用编程式导航跳转到/goods/add这个地址，index.js需要导入添加商品这个新页面。
    goAddpage() {
      this.$router.push('/goods/add')
    }
  },
  created() {
    this.getlist()
  }
}
</script>

<style scoped></style>
