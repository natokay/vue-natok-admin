<template>
  <div class="app-container">

    <div class="filter-container">
      <el-row :gutter="32">
        <el-col :span="4">
          <el-select ref="cliSelect" v-model="listQuery.wd" filterable placeholder="请选择：C端名称" style="width: 100%;">
            <el-option
              v-for="item in options"
              :key="item.accessKey"
              :label="item.clientName"
              :value="item.accessKey"
            />
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-input
            v-model="listQuery.wd"
            placeholder="请输入：访问秘钥"
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
        <el-col :span="2" :offset="9">
          <el-button
            v-waves
            style="float: right;"
            class="filter-item grid-content bg-purple"
            type="primary"
            icon="el-icon-circle-plus-outline"
            @click="handleOpen()"
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
      <el-table-column align="center" label="序号" min-width="80">
        <template slot-scope="scope">
          {{ scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column v-if="false" align="center" label="端口ID" min-width="120">
        <template slot-scope="scope">
          {{ scope.row.portId }}
        </template>
      </el-table-column>
      <el-table-column label="公网端口" align="center" min-width="120">
        <template slot-scope="scope">
          {{ scope.row.portNum }}
        </template>
      </el-table-column>
      <el-table-column label="内部地址" align="center" min-width="160">
        <template slot-scope="scope">
          <span>{{ scope.row.intranet }}</span>
        </template>
      </el-table-column>
      <el-table-column label="应用类型" align="center" min-width="100">
        <template slot-scope="scope">
          {{ scope.row.protocol }}
        </template>
      </el-table-column>
      <el-table-column label="有效天数" align="center" min-width="100">
        <template slot-scope="scope">
          {{ scope.row.validDay }}
        </template>
      </el-table-column>
      <el-table-column label="端口状态" align="center" min-width="100">
        <template slot-scope="scope">
          <div v-html="showState(scope.row)" />
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" min-width="160" show-overflow-tooltip>
        <template slot-scope="scope">
          {{ scope.row.remark }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="240" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button v-if="row.validDay <= 0||row.state<=0" size="mini" type="info" round disabled>启用</el-button>
          <el-button v-else-if="row.enabled" size="mini" type="warning" round @click="handSwitch(row,$index)">停用</el-button>
          <el-button v-else size="mini" type="success" round @click="handSwitch(row,$index)">启用</el-button>
          <el-button :disabled="row.state<=0" size="mini" type="primary" round @click="handleOpen(row,$index)">编辑</el-button>
          <el-button :disabled="row.state<=0" size="mini" type="danger" round @click="handleDelete(row,$index)">删除</el-button>
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

    <el-dialog :title="dialogTitle" :visible.sync="dialogFormVisible" :close-on-click-modal="false" @close="handleCancel">
      <el-form ref="dialogForm" :model="dialogForm" :rules="formRules">
        <el-form-item label="公网端口" prop="portNum" :label-width="dialogFormLabelWidth">
          <el-input v-model.trim="dialogForm.portNum" placeholder="公网端口，必填" />
        </el-form-item>
        <el-form-item v-show="fale" label="域名绑定" prop="domain" :label-width="dialogFormLabelWidth">
          <el-input v-model.trim="dialogForm.domain" placeholder="二级域名，可选" />
        </el-form-item>
        <el-form-item label="内网地址" prop="intranet" :label-width="dialogFormLabelWidth">
          <el-input v-model.trim="dialogForm.intranet" placeholder="内网地址，必填，格式：IP或主机名:端口" />
        </el-form-item>
        <el-form-item label="转发协议" prop="protocol" :label-width="dialogFormLabelWidth">
          <el-select ref="cliSelect" v-model="dialogForm.protocol" filterable placeholder="转发协议，必选" style="width: 100%;">
            <el-option
              v-for="proto in protocols"
              :key="proto"
              :label="proto"
              :value="proto"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="有效天数" prop="validDay" :label-width="dialogFormLabelWidth">
          <el-input v-model.trim="dialogForm.validDay" placeholder="有效时间，可选，默认7天" />
        </el-form-item>
        <el-form-item label="映射备注" prop="remark" :label-width="dialogFormLabelWidth">
          <el-input v-model.trim="dialogForm.remark" type="textarea" :rows="2" placeholder="请输入内容" />
        </el-form-item>

      </el-form>
      <div ref="dialogForm" slot="footer" class="dialog-footer">
        <el-button @click="handleCancel">取 消</el-button>
        <el-button type="primary" @click="handleSave">确 定</el-button>
      </div>
    </el-dialog>

  </div>

</template>

<script>
import waves from '@/directive/waves'
import { fetchKeys } from '@/api/client'
import { validPort } from '@/utils/validate'
import { del, fetchList, get, save, teleswitch } from '@/api/port'
import Pagination from '@/components/Pagination'

export default {
  components: { Pagination },
  directives: { waves },
  data() {
    const validatePortNum = (rule, value, callback) => {
      if (isNaN(value) || value.length <= 0) {
        return callback(new Error('端口号必须为数字值'))
      }
      if (value < 0 || value > 65535) {
        return callback(new Error('端口号范围：0~65535'))
      }
      validPort(this.dialogForm.portId, value, 1).then(fail => {
        if (fail) {
          return callback(new Error('端口号[' + value + ']已被占用'))
        }
        return callback()
      })
    }
    const validateIntranet = (rule, value, callback) => {
      const reg = /^\w+.+\w+:\d+$/
      if ((!reg.test(value)) || value.length <= 0) {
        return callback(new Error('请输入正确的内网地址'))
      }
      return callback()
    }
    const validateProtocol = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('转发协议为必选项'))
      }
      return callback()
    }
    const validateDay = (rule, value, callback) => {
      if (value && (isNaN(value) || value < 0)) {
        return callback(new Error('有效天数必须为大于0的数字值'))
      }
      if (value > 1000) {
        return callback(new Error('有效天数不能大于1000天'))
      }
      return callback()
    }
    return {
      listLoading: true,
      total: 1,
      listQuery: {
        wd: undefined,
        sort: 'id',
        page: 1,
        limit: 10
      },
      options: [],
      list: [{
        portId: 0,
        accessKey: '',
        portNum: 0,
        domain: 0,
        intranet: 0,
        protocol: 0,
        remark: '',
        expireAt: '',
        enabled: '0',
        apply: 0
      }],
      dialogTitle: '',
      dialogFormVisible: false,
      dialogFormLabelWidth: '120px',
      dialogForm: {
        portId: 0,
        accessKey: '',
        portNum: '',
        domain: '',
        intranet: '',
        protocol: '',
        remark: '',
        validDay: ''
      },
      protocols: ['http', 'https', 'tcp', 'ssh', 'telnet', 'data base', 'remote desktop'],
      formRules: {
        portNum: [{ required: true, trigger: 'blur', validator: validatePortNum }],
        intranet: [{ required: true, trigger: 'blur', validator: validateIntranet }],
        protocol: [{ required: true, trigger: 'change', validator: validateProtocol }],
        validDay: [{ required: false, trigger: 'blur', validator: validateDay }]
      }
    }
  },
  created() {
    this.handleCliKey()
    this.getList()
  },
  methods: {
    handleCliKey() {
      fetchKeys().then(response => {
        this.options = response.data.items
      }).catch(error => {
        console.log(error)
      })
    },
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
    // 新增或编辑dialog
    handleOpen(row) {
      const vm = this
      const forCli = vm.options.find(function(item) {
        return item.accessKey === vm.listQuery.wd || item.accessKey === (row && row.accessKey)
      })
      if (forCli === undefined) {
        vm.$message('请先选择C端后，再进行此操作!')
        return false
      }
      console.log(forCli)
      if (forCli.enabled <= 0) {
        vm.$message('C端已停用，不能进行此操作!')
        return false
      }
      if (!row) {
        vm.dialogForm.accessKey = forCli.accessKey
        vm.dialogTitle = '添加端口映射 · ' + forCli.clientName
        vm.dialogFormVisible = true
      } else {
        get({ 'portId': row.portId }).then(response => {
          vm.dialogForm = response.data.item
          vm.dialogTitle = '编辑端口映射 · ' + forCli.clientName
          vm.dialogFormVisible = true
        }).catch(error => {
          vm.$message.error(error)
        })
      }
    },
    // 保存新增或编辑dialog
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
    // 关闭新增或编辑dialog
    handleCancel() {
      this.dialogForm = { portId: 0, accessKey: '' }
      this.dialogFormVisible = false
      this.$refs.dialogForm.resetFields()
    },
    handSwitch(row) {
      let enabled = row['enabled']
      const tipMsg = enabled === 1 ? '停用' : '启用'
      this.$confirm('此操作将' + tipMsg + '该端口映射, 是否继续?', '提示', {
        confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
      }).then(() => {
        if (enabled === 1) { enabled = 0 } else { enabled = 1 }
        teleswitch({ accessKey: row['accessKey'], portId: row['portId'], enabled: enabled }).then(() => {
          row['enabled'] = enabled
          this.$message({ type: 'success', message: '处理成功!' })
        })
      }).catch(() => {
        this.$message({ type: 'info', message: '操作已取消' })
      })
    },
    handleDelete(row) {
      this.$confirm('此操作将删除该端口映射, 是否继续?', '提示', {
        confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
      }).then(() => {
        del({ accessKey: row['accessKey'], portId: row['portId'] }).then(() => {
          this.$message({ type: 'success', message: '处理成功!' })
          this.getList()
        })
      }).catch(() => {
        this.$message({ type: 'info', message: '操作已取消' })
      })
    },
    showState(row) {
      let state = ''
      if (row['state'] <= 0) {
        state = '<span class="nat-font-warn">C端已停用</span>'
      } else if (row['validDay'] <= 0) {
        state = '<span class="nat-font-red">过期</span>'
      } else if (!row['enabled']) {
        state = '<span class="nat-font-gray">关闭</span>'
      } else {
        state = '<span class="nat-font-green">正常</span>'
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
