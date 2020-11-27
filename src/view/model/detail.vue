<template>
  <default-layout id="detail" show-back-btn>
    <template slot="btn-inner">
      <el-button type="primary" class="iconfont icon-baocun"> 导出模型</el-button>
      <el-button v-if="!modelForm.status" type="primary" class="iconfont icon-xiugai" @click="editModel"> 修改模型信息</el-button>
      <el-button type="danger" class="iconfont icon-shanchu" @click="delModel"> 删除模型</el-button>
    </template>
    <div>
      <p class="list-title">{{modelForm.modelName}}
        <el-switch
          v-model="modelForm.status"
          @change="statusChange"
          active-color="#13ce66"
          inactive-color="#C8C9CC">
        </el-switch>
        <span v-if="modelForm.status" style="font-size: 12px;color: #139C43;font-weight: 400;">启用中</span>
        <span v-else style="font-size: 12px;color:#969799;font-weight: 400;">禁用中</span>
      </p>
      <div class="tabs-inner" v-loading="loading.page">
        <el-tabs v-model="activeName" type="card">
          <el-tab-pane name="first">
            <span slot="label"><img src="../../assets/images/rule-tree.png" style="width: 14px;height: 14px;margin-right: 4px;vertical-align: middle" alt=""> 规则树</span>
            <div style="padding: 15px 15px 0;">
              <div>
                <span class="list-title"><img src="../../assets/images/process.png" alt="" style="vertical-align: middle;width: 18px;height: 18px;"> 控制属性</span>
                <span class="model-name">当前显示：</span>
                <el-dropdown type="primary" trigger="click" placement="bottom" @command="handleClick">
                  <span class="el-dropdown-link" style="cursor:pointer;text-decoration: underline;">
                    {{currentModel}}<i class="el-icon-arrow-down el-icon--right"></i>
                  </span>
                  <el-dropdown-menu slot="dropdown" v-if="modelList.length">
                    <el-dropdown-item v-for="item in modelList" :key="item.id"  :command="item.id">
                      {{item.name}}
                      <el-button v-if="!modelForm.status" type="text" @click.stop.prevent="menuDelClick(item.id)" style="color: #FB6283;float: right;margin-left: 10px;">删除</el-button>
                      <el-button v-if="!modelForm.status" type="text" @click.stop.prevent="menuEditClick(item)" style="float: right;margin-left: 20px;">编辑</el-button>
                      <div style="clear: both;"></div>
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
                <span class="model-name" style="margin-left: 20px;">是否启用：</span>
                <el-radio-group v-model="banPcik" :disabled="modelForm.status" @change="banPcikChange">
                  <el-radio :label="1">是</el-radio>
                  <el-radio :label="0">否</el-radio>
                </el-radio-group>
                <a class="btn" v-if="!modelForm.status" href="javascript:;" @click="quickTest" style="margin-left: 20px;margin-right: 20px;">
                  <img src="../../assets/images/quick-test.png" style="width: 16px;height: 16px;vertical-align: middle;margin-bottom: 1px;" alt=""> 快速测试</a>
                <el-button v-if="!modelForm.status" type="primary" size="mini" icon="iconfont icon-baocun" @click="saveData"> 保存配置</el-button>
                <el-button v-if="!modelForm.status" type="primary" size="mini" icon="iconfont icon-fero-plus" style="float: right;" @click="addRules">新增规则组</el-button>
                <!--<el-dropdown type="primary" placement="bottom" trigger="click" @command="handleClick" style="float:right;">-->
                  <!--<el-button type="primary" size="mini" icon="iconfont icon-weibiaoti">切换规则组</el-button>-->
                  <!--<el-dropdown-menu slot="dropdown" v-if="modelList.length">-->
                    <!--<el-dropdown-item v-for="item in modelList" :key="item.id"  :command="item.id">-->
                      <!--{{item.name}}-->
                      <!--<el-button v-if="!modelForm.status" type="text" @click.stop.prevent="menuDelClick(item.id)" style="color: #FB6283;margin-left: 10px;float: right;">删除</el-button>-->
                      <!--<el-button v-if="!modelForm.status" type="text" @click.stop.prevent="menuEditClick(item)" style="margin-left: 20px;float: right;">编辑</el-button>-->
                      <!--<div style="clear: both;"></div>-->
                    <!--</el-dropdown-item>-->
                  <!--</el-dropdown-menu>-->
                <!--</el-dropdown>-->
              </div>
              <div style="clear: both;"></div>
              <div v-if="modelList.length" class="d3-canvas" style="height: calc(100vh - 260px);">
                <div style="height: calc(100% - 30px);padding-top: 15px;padding-bottom: 15px;">
              <mindmap
              v-model="mmdata"
              :gps="options.gps.value"
              :fitView="options.fitView.value"
              :draggable="options.draggable.value"
              :keyboard="options.keyboard.value"
              :showNodeAdd="options.showNodeAdd.value"
              :contextMenu="options.contextMenu.value"
              :nodeClick="options.nodeClick.value"
              :zoomable="options.zoomable.value"
              :showUndo="options.showUndo.value"
              :xSpacing="xSpacing"
              :ySpacing="ySpacing"
              :strokeWidth="strokeWidth"
              :status="modelForm.status"
              :treeId="treeId"
              @delRulesTree="delRulesTree"
              ref="mindmap"
              ></mindmap>
              </div>
              </div>
              <div v-else style="height: calc(100vh - 260px);text-align: center;line-height: calc(100vh - 260px);color: #969799;font-size: 14px;">暂 无 数 据</div>
            </div>
          </el-tab-pane>
          <el-tab-pane name="second">
            <span slot="label"><img src="../../assets/images/rule-set.png" style="width: 14px;height: 14px;margin-right: 4px;vertical-align: middle" alt=""> 规则集</span>
          </el-tab-pane>
          <el-tab-pane name="third">
            <span slot="label"><img src="../../assets/images/score-card.png" style="width: 14px;height: 14px;margin-right: 4px;vertical-align: middle" alt=""> 评分卡</span>
          </el-tab-pane>
          <el-tab-pane name="fourth">
            <span slot="label"><img src="../../assets/images/strategy.png" style="width: 14px;height: 14px;margin-right: 4px;vertical-align: middle" alt=""> 策略卡</span>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
    <el-dialog :title="title" :visible.sync="dialog.add" :close-on-click-modal="false" class="middle-dialog">
      <div class="form-area">
        <div class="form-inner">
          <el-form ref="form" :model="addForm" :rules="rules" label-width="120px" label-position="left">
            <el-form-item prop="rulesName" label="规则组名称：">
              <el-input v-model="addForm.rulesName"></el-input>
            </el-form-item>
          </el-form>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelAdd">取 消</el-button>
        <el-button type="primary" @click="confirmAdd">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="修改模型信息" :visible.sync="dialog.edit" :close-on-click-modal="false" class="middle-dialog">
      <div class="form-area">
        <div class="form-inner">
          <el-form ref="editForm" :model="modelForm" :rules="modelRules" label-width="120px" label-position="left">
            <el-form-item prop="modelName" label="模型名称：">
              <el-input v-model="modelForm.modelName"></el-input>
            </el-form-item>
            <el-form-item prop="modelVar" label="模型变量：">
              <el-select v-model="modelForm.modelVar" @remove-tag="removeTag" @change="modelVarChange" multiple placeholder="请选择">
                <el-option
                  v-for="item in options1"
                  :key="item.value"
                  :label="item.label"
                  :disabled="item.disabled"
                  :value="item.value">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item prop="description" label="模型描述：">
              <el-input type="textarea" rows="3" v-model="modelForm.description"></el-input>
            </el-form-item>
          </el-form>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelEdit">取 消</el-button>
        <el-button type="primary" @click="confirmEdit">确 定</el-button>
      </div>
    </el-dialog>
  </default-layout>
</template>
<script>
import mindmap from '../../components/MindMap'
export default {
  components: {
    mindmap
  },
  data () {
    return {
      showSource: false,
      onboarding: 0,
      length: 3,
      mmdata: [],
      items: [
        { title: 'template' },
        { title: 'script' }
      ],
      options: {
        gps: { value: true },
        fitView: { value: true },
        keyboard: { value: true },
        draggable: { value: true },
        showNodeAdd: { value: true },
        contextMenu: { value: true },
        nodeClick: { value: true },
        zoomable: { value: true },
        showUndo: { value: true }
      },
      xSpacing: 60,
      ySpacing: 20,
      strokeWidth: 1,
      activeName: 'first',
      currentModel: '',
      banPcik: 0,
      dialog: {
        add: false,
        edit: false
      },
      addForm: {
        rulesName: ''
      },
      rules: {
        rulesName: [
          {required: true, message: '请输入规则组名称', trigger: 'blur'},
          this.rulesToolkit.rules.range({name: '规则组名称', max: 30})
        ]
      },
      modelForm: {
        status: false,
        modelName: '金润保理业务',
        modelVar: []
      },
      defaultModelVar: [],
      cloneModelVar: [],
      modelRules: {
        modelName: [
          this.rulesToolkit.rules.required({name: '模型名称'}),
          this.rulesToolkit.rules.range({name: '模型名称', max: 20})
        ],
        modelVar: [
          this.rulesToolkit.rules.required({name: '模型变量'})
        ],
        description: [
          this.rulesToolkit.rules.range({name: '模型描述', max: 150})
        ]
      },
      modelList: [],
      treeId: '',
      options1: [{
        value: '选项1',
        label: '黄金糕'
      }, {
        value: '选项2',
        label: '双皮奶',
        disabled: true
      }, {
        value: '选项3',
        label: '蚵仔煎',
        disabled: true
      }, {
        value: '选项4',
        label: '龙须面'
      }, {
        value: '选项5',
        label: '北京烤鸭'
      }],
      title: '新建规则组',
      loading: {
        page: false
      }
    }
  },
  created () {
    this.loading.page = true
    window.setTimeout(() => {
      // this.mmdata = [{'name': '新建节点', 'children': []}]
      this.mmdata = [
        {
          'name': '规则组名称',
          'children': [
            {
              'name': '选择变量一',
              'children': [
                {
                  'name': '力度     风险提示性',
                  'children': [
                  ],
                  'form': {
                    'nodeType': 'FZLD',
                    'resultsValue': 3
                  }
                },
                {
                  'name': '等于     选择变量二',
                  'children': [
                  ],
                  'form': {
                    'nodeType': 'TJ',
                    'condition': 'EQ',
                    'conVarType': 'BL',
                    'varLibrary': 1,
                    'varGroup': 2,
                    'variable': 2
                  }
                }
              ],
              'form': {
                'varLibrary': 1,
                'varGroup': 1,
                'variable': 1
              }
            },
            {
              'name': '选择变量二',
              'children': [
              ],
              'form': {
                'varLibrary': 2,
                'varGroup': 2,
                'variable': 2
              }
            }
          ],
          'form': {
            'name': '规则组名称'
          }
        }
      ]
      this.loading.page = false
    }, 2000)
  },
  mounted () {
    let result = ['选项2', '选项3']
    this.modelForm.modelVar = [...result]
    this.defaultModelVar = [...result]
    // 调用接口获取完规则组列表后  有数据取列表第一条数据的id 给 treeId
    this.getModelList()
  },
  methods: {
    // 决策树删除顶级节点
    delRulesTree (id) {
      this.mmdata = [{'name': '新建节点', 'children': []}]
      this.$message.success('删除成功')
    },
    getModelList () {
      // this.modelList = []
      this.modelList = [
        {id: 1, name: '贷前规则组七'},
        {id: 2, name: '贷前规则组一'},
        {id: 3, name: '贷前规则组二'},
        {id: 4, name: '贷前规则组三'},
        {id: 5, name: '贷前规则组四'}
      ]
      if (this.modelList.length) {
        this.treeId = this.modelList[0].id
        this.currentModel = this.modelList[0].name
      } else {
        this.currentModel = '暂无规则组'
      }
    },
    // 快速测试
    quickTest () {
      let result = this.$refs.mindmap.quickTest()
      return result
    },
    // 新增规则组
    addRules () {
      this.title = '新增规则组'
      this.dialog.add = true
    },
    // 取消新增节点
    cancelAdd () {
      this.$refs['form'].resetFields()
      this.$refs['form'].clearValidate()
      this.dialog.add = false
    },
    // 确认新增节点
    confirmAdd () {
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.title === '新增规则组') {
            this.modelList.push({id: 6, name: this.addForm.rulesName})
            this.dialog.add = false
          } else {
            // 编辑
            this.dialog.add = false
          }
        }
      })
    },
    // 选中下拉菜单项
    handleClick (value) {
      for (let i in this.modelList) {
        if (this.modelList[i].id === value) {
          this.currentModel = this.modelList[i].name
          this.treeId = this.modelList[i].id
        }
      }
      // 请求接口获取决策树的数据  赋值给mmdata
    },
    // 下拉菜单删除
    menuDelClick (id) {
      this.$confirm('确定删除规则组?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        for (let i in this.modelList) {
          if (this.modelList[i].id === id) {
            this.modelList.splice(i, 1)
          }
        }
        this.$message({
          type: 'success',
          message: '删除成功!'
        })
      }).catch(() => {})
    },
    // 下拉菜单编辑
    menuEditClick (item) {
      this.title = '编辑规则组'
      this.dialog.add = true
      this.addForm.rulesName = item.name
    },
    banPcikChange (value) {
      if (value === 1) {
        // 单选改变时  如果选择的为是  进行快速检测  快速检测返回值为true  决策树检测通过  为false  单选值要回复原来数值
        let result = this.quickTest()
        if (!result) {
          this.banPcik = 0
          return false
        } else {
          // 调用后台启用接口
          this.$message.success('启用成功')
        }
      }
    },
    delModel () {
      this.$confirm('确定删除模型?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$router.go(-1)
        this.$message({
          type: 'success',
          message: '删除成功!'
        })
      }).catch(() => {
        // this.$message({
        //   type: 'info',
        //   message: '已取消删除'
        // })
      })
    },
    editModel () {
      this.dialog.edit = true
    },
    // 删除多选tag
    removeTag (value) {
      console.log(value)
      for (let i in this.options1) {
        if (value === this.options1[i].value && this.options1[i].disabled === true) {
          this.$message.error('变量已被引用，无法删除')
          this.modelForm.modelVar = this.cloneModelVar
          return false
        }
      }
    },
    // 下拉框选中值变化
    modelVarChange (value) {
      this.cloneModelVar = []
      this.cloneModelVar = [...this.defaultModelVar]
      for (let i = this.defaultModelVar.length ? this.defaultModelVar.length - 1 : 0; i < value.length; i++) {
        this.cloneModelVar.push(value[i])
      }
    },
    // 取消编辑
    cancelEdit () {
      this.$refs['editForm'].resetFields()
      this.$refs['editForm'].clearValidate()
      this.dialog.edit = false
    },
    // 确认完成编辑
    confirmEdit () {
      this.$refs['editForm'].validate(valid => {
        if (valid) {
          this.dialog.edit = false
        }
      })
    },
    statusChange (value) {
      if (value) {
        this.$confirm('启用模型后将不能编辑模型内容确定启用当前模型?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          // 调用接口  查看模型内是否设立任何规则  是  启用   否  弹窗提示 “模型内未设立任何规则”
          // this.$message.error('模型内未设立任何规则')
          // this.modelForm.status = !value
        }).catch(() => {
          this.modelForm.status = !value
        })
      } else {
        this.$confirm('确定禁用当前模型?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
        }).catch(() => {
          this.modelForm.status = !value
        })
      }
    },
    saveData () {}
  }
}
</script>
<style scoped lang="less">
  #detail {
    .list-title {
      font-size: 18px;
      font-weight: 600;
      font-family: "PingFangSC-Semibold";
      margin-bottom: 12px;
      padding: 20px 20px 0;
      color: #323233;
    }
    .tabs-inner {
      margin-top: 10px;
      margin-bottom: 10px;
      .d3-canvas {
        /*height: calc(100vh - 200px);*/
      }
      .list-title {
        padding: 15px 15px 0;
      }
      .model-name {
        color: #969799;
      }
      .el-dropdown-link {
        color: #6257CD;
        font-size: 12px;
      }
      .el-radio__label {
        font-size: 12px;
      }
      .el-radio__input.is-checked .el-radio__inner{
        width: 12px;
        height: 12px;
      }
    }
  }
</style>
