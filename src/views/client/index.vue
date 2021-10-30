<template>
  <div class="app-container">

    <div class="filter-container">
      <el-row :gutter="32">
        <el-col :span="10" :offset="3">
          <el-input
            v-model="listQuery.wd"
            placeholder="请输入：C端ID/用户名称/访问秘钥"
            class="filter-item grid-content bg-purple"
            @keyup.enter.native="handleFilter"
          />
        </el-col>
        <el-col :span="2">
          <el-button
            v-waves
            class="filter-item grid-content bg-purple"
            type="primary"
            icon="el-icon-search"
            @click="handleFilter"
          >
            搜索
          </el-button>
        </el-col>
        <el-col :span="3" :offset="5">
          <el-button
            v-waves
            style="float: right;"
            class="filter-item grid-content bg-purple"
            type="primary"
            icon="el-icon-circle-plus-outline"
            @click="handleOpen('')"
          >
            添加
          </el-button>
        </el-col>
      </el-row>
    </div>

    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
    >
      <el-table-column align="center" label="序号" width="80">
        <template slot-scope="scope">
          {{ scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column v-if="false" align="center" label="C端ID" width="120">
        <template slot-scope="scope">
          {{ scope.row.clientId }}
        </template>
      </el-table-column>
      <el-table-column label="C端名称" align="center" min-width="180">
        <template slot-scope="scope">
          {{ scope.row.clientName }}
        </template>
      </el-table-column>
      <el-table-column label="访问秘钥" align="center" min-width="280">
        <template slot-scope="scope">
          <span>{{ scope.row.accessKey }}</span>
        </template>
      </el-table-column>
      <el-table-column label="使用端口数" align="center" min-width="100">
        <template slot-scope="scope">
          {{ scope.row.usePortNum }}
        </template>
      </el-table-column>
      <el-table-column label="加入时间" align="center" min-width="160">
        <template slot-scope="scope">
          {{ dateFormat(scope.row.joinTime) }}
        </template>
      </el-table-column>
      <el-table-column label="用户状态" align="center" min-width="100">
        <template slot-scope="scope">
          <div v-html="showSate(scope.row)" />
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="240" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button v-if="row.enabled==1" size="mini" type="warning" round @click="handSwitch(row)">停用</el-button>
          <el-button v-if="row.enabled==0" size="mini" type="success" round @click="handSwitch(row)">启用</el-button>
          <el-button size="mini" type="primary" round @click="handleOpen(row.clientId)">编辑</el-button>
          <el-button size="mini" type="danger" round @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      @pagination="getList"
    />

    <el-dialog :title="dialogTitle" width="36%" :visible.sync="dialogFormVisible" :close-on-click-modal="false" @close="handleCancel">
      <el-form ref="dialogForm" :model="dialogForm" :rules="formRules">
        <el-form-item label="C端名称" prop="clientName" :label-width="dialogFormLabelWidth">
          <el-input v-model="dialogForm.clientName" placeholder="C端名称，必填，建议使用邮箱" />
        </el-form-item>
        <el-form-item label="访问秘钥" prop="accessKey" :label-width="dialogFormLabelWidth">
          <el-input v-model="dialogForm.accessKey" placeholder="访问秘钥，可选，默认系统会自动生成" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="handleCancel">取 消</el-button>
        <el-button type="primary" @click="handleSave">确 定</el-button>
      </div>
    </el-dialog>
  </div>

</template>

<script>
import waves from '@/directive/waves'
import { validClient } from '@/utils/validate'
import { fetchList, get, save, teleswitch, del } from '@/api/client'
import Pagination from '@/components/Pagination'
import moment from 'moment'

export default {
  components: { Pagination },
  directives: { waves },
  data() {
    const validateClientName = (rule, value, callback) => {
      if (value.length < 2 || value.length > 24) {
        return callback(new Error('长度在 2 到 24 个字符'))
      }
      validClient(this.dialogForm.clientId, value, 1).then(fail => {
        if (fail) {
          return callback(new Error('名称[' + value + ']已被占用'))
        }
        return callback()
      })
    }
    const validateAccessKey = (rule, value, callback) => {
      const len = value.length
      if (len === 0) { return callback() }
      if (len < 16 || len > 32) {
        return callback(new Error('长度在 16 到 32 个字符'))
      }
      validClient(this.dialogForm.clientId, value, 2).then(fail => {
        if (fail) {
          return callback(new Error('此秘钥已被使用'))
        }
        return callback()
      })
    }
    return {
      listLoading: true,
      total: 1,
      listQuery: {
        page: 1,
        limit: 10,
        wd: undefined,
        sort: 'id'
      },
      list: [{
        clientId: 0,
        accessKey: '',
        enabled: 0,
        usePortNum: 0,
        joinTime: '0',
        clientName: '',
        state: 0,
        apply: 0,
        modified: '0'
      }],
      dialogTitle: '',
      dialogFormVisible: false,
      dialogFormLabelWidth: '120px',
      dialogForm: {
        clientId: 0,
        clientName: '',
        accessKey: ''
      },
      formRules: {
        clientName: [{ required: true, trigger: 'blur', validator: validateClientName }],
        accessKey: [{ required: false, trigger: 'blur', validator: validateAccessKey }]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    handleFilter() {
      this.getList()
    },
    getList() {
      this.listLoading = true
      fetchList(this.listQuery).then(response => {
        this.list = response.data.items
        this.total = response.data.total
      }).catch(error => {
        console.log(error)
      }).finally(() => {
        this.listLoading = false
      })
    },
    // 新增或编辑C端dialog
    handleOpen(clientId) {
      if (clientId <= 0) {
        this.dialogTitle = '新增C端'
        this.dialogFormVisible = true
      } else {
        get({ 'clientId': clientId }).then(response => {
          this.dialogForm = response.data.item
          this.dialogTitle = '编辑 · ' + this.dialogForm.clientName
          this.dialogFormVisible = true
        }).catch(error => {
          this.$message.error(error)
        })
      }
    },
    // 保存新增或编辑C端dialog
    handleSave() {
      this.$refs.dialogForm.validate(valid => {
        if (valid) {
          save(this.dialogForm).then(response => {
            this.$notify({ type: 'success', title: '完成', message: response.msg })
          }).catch(error => {
            this.$notify.error({ title: '错误', message: error })
            console.log(error)
          }).finally(() => {
            this.handleCancel()
            this.getList()
          })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    // 关闭新增或编辑C端dialog
    handleCancel() {
      this.dialogForm = { clientId: 0, clientName: '', accessKey: '' }
      this.dialogFormVisible = false
      this.$refs.dialogForm.resetFields()
    },
    handSwitch(row) {
      let enabled = row['enabled']
      const tipMsg = enabled === 1 ? '停用' : '启用'
      this.$confirm('此操作将' + tipMsg + '该C端, 是否继续?', '提示', {
        confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
      }).then(() => {
        if (enabled === 1) { enabled = 0 } else { enabled = 1 }
        teleswitch({ accessKey: row['accessKey'], clientId: row['clientId'], enabled: enabled }).then(() => {
          this.$message({ type: 'success', message: '处理成功!' })
          row['enabled'] = enabled
        })
      }).catch(() => {
        this.$message({ type: 'info', message: '操作已取消' })
      })
    },
    handleDelete(row) {
      this.$confirm('此操作将删除该端口映射, 是否继续?', '提示', {
        confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
      }).then(() => {
        del({ accessKey: row['accessKey'], clientId: row['clientId'] }).then(() => {
          this.$message({ type: 'success', message: '处理成功!' })
          this.getList()
        })
      }).catch(() => {
        this.$message({ type: 'info', message: '操作已取消' })
      })
    },
    dateFormat(date) {
      if (date === undefined) {
        return ''
      }
      return moment(date).format('YYYY-MM-DD HH:mm:ss')
    },
    showSate(row) {
      let state = row['state']
      if (state === 0) {
        state = '<span class="nat-font-gray">离线</span>'
      }
      if (state === 1) {
        state = '<span class="nat-font-green">在线</span>'
      }
      return state
    }
  }
}
</script>
<style scoped>
  .filter-container {
    padding-bottom: 10px;
  }
  .filter-item {
    display: inline-block;
    vertical-align: middle;
    margin-bottom: 10px;
  }
</style>
