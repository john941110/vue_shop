<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <!-- ：to属性直接设置path就可以跳转 -->
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
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
      </el-row>
      <!-- 表格区域 -->
      <template>
        <el-table :data="orderlist" style="width: 100%" border stripe>
          <!-- 设置type属性为index即可显示从 1 开始的索引号  -->
          <el-table-column type="index"></el-table-column>
          <!--prop中的数据都是从后台返回的数据  -->
          <el-table-column prop="order_number" label="订单编号"></el-table-column>
          <el-table-column prop="order_price" label="订单价格"> </el-table-column>
          <el-table-column prop="order_pay" label="是否付款">
            <template slot-scope="scope">
              <el-tag type="danger" v-if="scope.row.pay_status === '0'">未付款</el-tag>
              <el-tag type="success" v-if="scope.row.pay_status === '1'">已付款</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="is_send" label="是否发货"> </el-table-column>
          <el-table-column prop="create_time" label="下单时间">
            <!-- 利用时间过滤器从新编译时间的格式 -->
            <template slot-scope="scope">
              {{ scope.row.create_time | dateFormat }}
            </template>
          </el-table-column>
          <!-- 操作栏 -->
          <el-table-column label="操作" width="140px">
            <template>
              <!-- 修改按钮 -->
              <el-tooltip effect="dark" content="修改订单地址" placement="top" :enterable="false">
                <el-button type="primary" icon="el-icon-edit" size="mini" @click="changeorder"></el-button>
              </el-tooltip>

              <!-- 物流信息 -->
              <el-tooltip effect="dark" content="物流信息" placement="top" :enterable="false">
                <el-button type="success" icon="el-icon-location" size="mini" @click="logistics"></el-button>
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
        :page-sizes="[5, 10, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
    <!-- 修改地址弹窗 -->
    <el-dialog title="修改地址" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <!-- 表单区域 -->
      <el-form :model="editruleForm" :rules="editrules" ref="refeditForm" label-width="70px">
        <el-form-item label="省市区/县" prop="address1" label-width="100px">
          <el-cascader v-model="editruleForm.address1" :options="citydata"></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2" label-width="100px">
          <el-input v-model="editruleForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <!-- 按钮区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <!-- 点击确定，执行编辑用户函数 -->
        <el-button type="primary" @click="editDialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 时间线 -->
    <el-dialog title="物流进度" :visible.sync="DialogVisible" width="50%">
      <el-timeline reverse>
        <el-timeline-item v-for="(activity, index) in activities" :key="index" :timestamp="activity.time">
          {{ activity.context }}
        </el-timeline-item>
      </el-timeline>
      <!-- 按钮区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="DialogVisible = false">取 消</el-button>
        <!-- 点击确定，执行编辑用户函数 -->
        <el-button type="primary" @click="DialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import citydata from './citydata.js'
export default {
  data() {
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 5
      },
      orderlist: [],
      total: 0,
      editDialogVisible: false,
      editruleForm: {
        address1: [],
        address2: ''
      },
      editrules: {
        address1: [{ required: true, message: '请选择省市区县', trigger: 'blur' }],
        address2: [{ required: true, message: '请填写详细地址', trigger: 'blur' }]
      },
      citydata,
      activities: [],
      DialogVisible: false
    }
  },
  methods: {
    async getlist() {
      const { data: res } = await this.axios.get('orders', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.orderlist = res.data.goods
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
    // 修改订单地址
    changeorder() {
      this.editDialogVisible = true
    },
    editDialogClosed() {
      this.$refs.refeditForm.resetFields()
    },
    // 物流信息
    async logistics() {
      const { data: res } = await this.axios.get('/kuaidi/804909574412544580')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.activities = res.data
      this.DialogVisible = true
    }
  },
  created() {
    this.getlist()
  }
}
</script>

<style scoped>
.el-cascader {
  width: 100%;
}
</style>
