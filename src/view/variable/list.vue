<template>
  <default-layout id="variable">
    <div class="search-input">
      <el-input placeholder="请输入变量名称" prefix-icon="el-icon-search" v-model="searchInner"></el-input>
    </div>
    <!--<div class="search-icon" ></div>-->
    <el-button @click="searchVar(searchInner)" style="float: left;margin-left: 12px;margin-top: 20px;height: 40px;padding: 7px 7px 8px;">
      <i class="iconfont icon-right_arrow" style="font-size: 24px;margin-right: 0;"></i>
    </el-button>
    <div style="clear: both;"></div>
    <div style="overflow: hidden;margin: 20px;height: calc(100% - 100px);">
      <div class="content-left">
        <div class="area-title">
          <p class="title">变量库</p>
          <el-button type="primary" size="mini" class="iconfont icon-xinzeng" style="float: right;margin-top: 11px;" @click="addVarLib"> 新建库</el-button>
        </div>
        <div style="padding: 0 20px;margin-bottom: 20px;">
          <el-input placeholder="请输入变量名称" prefix-icon="el-icon-search" v-model="treeSearchInner" style="background-color: #F7F8FA;" @blur="searchVar(treeSearchInner)"></el-input>
        </div>
        <el-tree
          :data="list"
          node-key="id"
          ref="menu"
          default-expand-all
          highlight-current
          :props="defaultProps"
          class="tree-style"
          :current-node-key="currentNodeKey"
          @node-click="nodeClick"
          empty-text="暂无数据"
          style="height: calc(100% - 112px);"
        >
          <div class="custom-tree-node" slot-scope="{ node, data }">
            <div class="tree-left">
              <div class="tree-span-name">
                <p class="tree-span-name-text">{{data.varName}}</p>
              </div>
            </div>
            <div class="tree-right">
              <div class="tree-span-operation" style="padding-right: 20px;">
                <a class="text-btn" href="javascript:;" v-if="node.level === 1 && (data.status === 1 || data.status === 2)" @click.prevent.stop="addGroup(data, node)">新增组</a>
                <a class="text-btn" href="javascript:;" v-if="node.level === 1 && data.status === 2" @click.prevent.stop="varLibPath(data.varName)">引用</a>
                <a class="text-btn" href="javascript:;" v-if="node.level === 1 && data.status === 1" @click.prevent.stop="editVarLibClick(data)">编辑</a>
                <a class="text-btn danger" href="javascript:;" v-if="node.level === 1 && data.status === 1" @click.prevent.stop="delVarLib(data, node)">删除</a>
                <a class="text-btn" href="javascript:;" v-if="node.level === 2 && data.status === 3" @click.prevent.stop="editVarClick(data, node)">编辑</a>
                <a class="text-btn danger" href="javascript:;" v-if="node.level === 2 && data.status === 3" @click.prevent.stop="delVarGroup(data, node)">删除</a>
                <a class="text-btn" href="javascript:;" v-if="node.level === 2 && data.status === 4" @click.prevent.stop="varNamePath(data.varName)">引用</a>
              </div>
            </div>
          </div>
        </el-tree>
      </div>
      <div style="width: 100%;height: 100%;" class="content-right" ref="right">
        <div style="margin-left: 412px;background-color: #fff;height: 100%;">
          <table-inner title="变量列表" :showMoreColumns="false" :tableFooter="false">
              <template slot="btn-inner" v-if="$route.query.childId">
                <el-button type="primary" size="mini" @click="manualSave">保存</el-button>
                <el-button type="primary" size="mini" @click="dialog.upload = true">批量导入</el-button>
                <el-button type="primary" icon="iconfont icon-fero-plus" size="mini" @click="addVarBtn">添加变量</el-button>
              </template>
              <template slot="table-bd">
                <el-table ref="varTable" :data="tableList.list" border :stripe="false" @cell-click="cellClick" :max-height="maxHeight">
                  <!--<el-table-column prop="code" label="code" :formatter="utils.isEffective" align="center"></el-table-column>-->
                  <el-table-column prop="varName" label="变量名称" :formatter="utils.isEffective">
                    <template slot-scope="scope">
                      <div v-show="scope.row.reference === '1'" style="padding: 5px 12px;cursor: not-allowed;">{{scope.row.varName}}</div>
                      <div v-show="scope.row.reference === '0' && scope.row.varNameFlag" style="padding: 5px 12px;">
                        <div v-show="scope.row.varName">{{scope.row.varName}}</div>
                        <div v-show="!scope.row.varName" style="color: #C0C4CC;">请输入变量名称</div>
                      </div>
                      <div v-show="scope.row.reference === '0' && !scope.row.varNameFlag">
                        <el-input style="position: relative;z-index: 1;" :ref="'varInput' + scope.row.id" placeholder="请输入变量名称" v-model="scope.row.varName" @blur="varInputBlur(scope.row)"></el-input>
                        <!--<el-form-item label-width="0" :prop="`list[${scope.$index}].varName`" :rules="tableFormRules.varName">-->
                        <!--<template slot="error" slot-scope="scope">-->
                        <!--<el-tooltip effect="dark" :content="scope.error" placement="top-start">-->
                        <!--<span class="error-icon danger"><i class="el-icon-warning"></i></span>-->
                        <!--</el-tooltip>-->
                        <!--</template>-->
                        <!--</el-form-item>-->
                      </div>
                      <div v-if="scope.row.reference === '0' && !scope.row.varNameFlag" class="tdBorder"></div>
                    </template>
                  </el-table-column>
                  <el-table-column prop="type" label="类型" :formatter="utils.isEffective">
                    <template slot-scope="scope">
                      <p v-if="scope.row.reference === '1'" style="height: 32px;line-height: 32px;padding: 5px 12px;cursor: not-allowed;">
                        <span v-if="scope.row.type === 1">数值型</span>
                        <span v-if="scope.row.type === 2">枚举型</span>
                        <span v-if="scope.row.type === 3">衍生计算</span>
                      </p>
                      <el-select v-else v-model="scope.row.type" placeholder="请选择" @change="(val) => {selectChange(val, scope.row)}">
                        <el-option label="数值型" :value="1"></el-option>
                        <el-option label="枚举型" :value="2"></el-option>
                        <el-option label="衍生计算" :value="3"></el-option>
                      </el-select>
                    </template>
                  </el-table-column>
                  <el-table-column prop="varContent" label="变量内容" :formatter="utils.isEffective">
                    <template slot-scope="scope">
                      <div v-show="scope.row.reference === '1'" style="padding: 5px 12px;cursor: not-allowed;">
                        <div v-if="scope.row.type === 1">/</div>
                        <div v-if="scope.row.type === 2">{{scope.row.varContent}}</div>
                        <div v-if="scope.row.type === 3">{{formatFormula(scope.row.varContent)}}</div>
                      </div>
                      <div>
                        <div v-show="scope.row.reference === '0' && scope.row.type === 1" style="padding: 0 5px;">/</div>
                        <div v-if="scope.row.reference === '0' && scope.row.type === 2 && !scope.row.varContentFlag">
                          <el-input style="position: relative;z-index: 1;" :ref="'varContent' + scope.row.id" placeholder="请用英文逗号分隔枚举值" v-model="scope.row.varContent" @blur="varContentBlur(scope.row)"></el-input>
                        </div>
                        <div v-show="scope.row.reference === '0' && scope.row.type === 2 && scope.row.varContentFlag" style="padding: 0 12px;">
                          <div v-show="!scope.row.varContent" style="color: #C0C4CC;">请用英文逗号分隔枚举值</div>
                          <div v-show="scope.row.varContent">{{scope.row.varContent}}</div>
                        </div>
                        <div v-show="scope.row.reference === '0' && scope.row.type === 2 && !scope.row.varContentFlag" class="tdBorder"></div>
                        <div v-show="scope.row.reference === '0' && scope.row.type === 3" style="padding: 5px 12px;">
                          <div v-show="!scope.row.varContent.length" style="color: #C0C4CC;">请设置衍生公式</div>
                          <div v-show="scope.row.varContent.length">{{formatFormula(scope.row.varContent)}}</div>
                        </div>
                      </div>
                    </template>
                  </el-table-column>
                  <el-table-column label="是否引用" :formatter="utils.isEffective" width="80px" align="center">
                    <template slot-scope="scope">
                      {{scope.row.reference === '1' ? '是' : '否'}}
                    </template>
                  </el-table-column>
                  <el-table-column fixed="right" label="操作" width="80px" align="center">
                    <template slot-scope="scope">
                      <a class="text-btn" href="javascript:;" v-if="scope.row.reference === '1'" @click="tablePath(scope.row)">引用</a>
                      <a class="text-btn danger" href="javascript:;" v-if="scope.row.reference === '0'" @click="delTableVar(scope.row)">删除</a>
                    </template>
                  </el-table-column>
                </el-table>
              </template>
            </table-inner>
        </div>
      </div>
    </div>
    <el-dialog :title="title" :visible.sync="dialog.add" :close-on-click-modal="false" class="middle-dialog" @close="cancelAdd">
      <div class="form-area">
        <div class="form-inner">
          <el-form ref="form" :model="addForm" :rules="rules" label-width="120px" label-position="left" @submit.native.prevent>
            <el-form-item prop="varLibName" label="变量库名称：">
              <el-input v-model="addForm.varLibName"></el-input>
            </el-form-item>
            <!--<el-form-item prop="uniId" label="唯一标识：">-->
              <!--<el-input v-model="addForm.uniId"></el-input>-->
            <!--</el-form-item>-->
          </el-form>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelAdd">取 消</el-button>
        <el-button type="primary" @click="confirmAdd">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog :title="varTitle" :visible.sync="dialog.addVar" :close-on-click-modal="false" class="middle-dialog" @close="cancelAddVar">
      <div class="form-area">
        <div class="form-inner">
          <el-form ref="varForm" :model="varForm" :rules="varRules" label-width="120px" label-position="left" @submit.native.prevent>
            <el-form-item prop="varLibName" label="分组名称：">
              <el-input v-model="varForm.varLibName"></el-input>
            </el-form-item>
          </el-form>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelAddVar">取 消</el-button>
        <el-button type="primary" @click="confirmAddVar">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="新建衍生变量" :visible.sync="dialog.set" :close-on-click-modal="false" class="middle-dialog" @close="cancelSet">
      <div class="form-area">
        <div class="form-inner">
          <el-form ref="constForm" :model="constForm" :rules="constRules"  label-width="80px" label-position="left">
            <el-form-item prop="constInput" label="衍生变量：">
              <div style="margin: 4px 0;">
                <div class="oper-btn">
                  <a href="javascript:;" :class="bracketsLift ? 'bracketsHasBorder' : 'bracketsNoBorder'" style="display: inline-block;width: 28px;height: 28px;line-height: 28px;background-color: #FFF8F3;color: #F9782C;text-align: center;font-weight: 400;" @click="selectMember('bracketsLift')">(</a>
                  <a href="javascript:;" :class="bracketsRight ? 'bracketsHasBorder' : 'bracketsNoBorder'" style="margin-left: 4px;display: inline-block;width: 28px;height: 28px;line-height: 28px;background-color: #FFF8F3;color: #F9782C;text-align: center;font-weight: 400;" @click="selectMember('bracketsRight')">)</a>
                  <a href="javascript:;" :class="showFunc ? 'funcHasBorder' : 'funcNoBorder'" style="margin-left: 12px;display: inline-block;width: 48px;height: 28px;line-height: 28px;background-color: #E8F6E8;color: #18882F;text-align: center;font-weight: 400;" @click="selectMember('func')">函数</a>
                  <a href="javascript:;" :class="showVar ? 'varHasBorder' : 'varNoBorder'" style="margin-left: 12px;display: inline-block;width: 48px;height: 28px;line-height: 28px;background-color: #E7F3FF;color: #1188FF;text-align: center;font-weight: 400;" @click="selectMember('var')">变量</a>
                  <a href="javascript:;" :class="showConst ? 'constHasBorder' : 'constNoBorder'" style="margin-left: 12px;display: inline-block;width: 48px;height: 28px;line-height: 28px;background-color: #F5F6FA;color: #323233;text-align: center;font-weight: 400;" @click="selectMember('const')">常量</a>
                  <a href="javascript:;" :class="showOperator ? 'operatorHasBorder' : 'operatorNoBorder'" style="margin-left: 12px;display: inline-block;width: 59px;height: 28px;line-height: 28px;background-color: #FBE8EA;color: #DC1E32;text-align: center;font-weight: 400;" @click="selectMember('operator')">运算符</a>
                </div>
                <div style="margin-top: 15px;">
                  <el-row v-if="showVar">
                    <el-col :span="8">
                      <el-select v-model="varGroup" placeholder="请选择" @change="varGroupChagne">
                        <el-option
                          v-for="item in varGroupList"
                          :key="item.id"
                          :label="item.label"
                          :value="item.id">
                        </el-option>
                      </el-select>
                    </el-col>
                    <el-col :span="8" :push="1">
                      <el-select v-model="variable" placeholder="请选择" @visible-change="variableChange">
                        <el-option
                          v-for="item in variableList"
                          :key="item.id"
                          :label="item.label"
                          :value="item.id">
                        </el-option>
                      </el-select>
                    </el-col>
                  </el-row>
                  <el-row v-if="showFunc">
                    <el-col :span="8">
                      <el-select v-model="func" placeholder="请选择" @visible-change="funcChange">
                        <el-option label="Max" value="Max"></el-option>
                        <el-option label="Min" value="Min"></el-option>
                        <el-option label="Sum" value="Sum"></el-option>
                        <el-option label="Avg" value="Avg"></el-option>
                      </el-select>
                    </el-col>
                  </el-row>
                  <el-row v-if="showConst">
                    <el-col :span="8">
                      <el-input placeholder="请输入常量" v-model="constForm.constInput" @blur="contantsChange"></el-input>
                    </el-col>
                  </el-row>
                  <el-row v-if="showOperator">
                    <el-col :span="8">
                      <el-select v-model="operator" placeholder="请选择" @visible-change="operatorChange">
                        <el-option label="+" value="+"></el-option>
                        <el-option label="-" value="-"></el-option>
                        <el-option label="*" value="*"></el-option>
                        <el-option label="/" value="/"></el-option>
                      </el-select>
                    </el-col>
                  </el-row>
                </div>
              </div>
            </el-form-item>
            <el-form-item label="">
              <div class="formula">
                <a v-if="!formulaList.length" href="javascript:;" style="width: 1px;padding: 0 7px;color: #000;overflow: hidden;cursor: text;" @click="cursorClick(-1, true)">
                  <span class="line" ref="line" style="display: none;">|</span>
                </a>
                <div v-for="(item, index) in formulaList" :key="index">
                  <a v-if="index === 0" href="javascript:;" style="width: 1px;padding: 0 7px;color: #000;overflow: hidden;cursor: text;" @click="cursorClick(-1, true)">
                    <span class="line" ref="line" style="display: none;">|</span>
                  </a>
                  <span @click="labelClick(index, item)" :class="item.border ? 'hasBorder' : 'noBorder'" style="cursor: pointer;">{{item.label}}{{item.type === 'var' ? '，' : ''}}</span>
                  <a href="javascript:;" :ref="'textareaSpan' + index" style="width: 1px;padding: 0 7px;color: #000;overflow: hidden;cursor: text;" @click="cursorClick(index, true)">
                    <span class="line" ref="line" style="display: none;">|</span>
                  </a>
                </div>
              </div>
            </el-form-item>
          </el-form>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelSet">取 消</el-button>
        <el-button type="primary" @click="confirmSet">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="引用路径" :visible.sync="dialog.path" :close-on-click-modal="false" class="middle-dialog">
      <div>
        <p style="margin: 20px 0 10px;padding-left: 20px;">{{pathTitle}}</p>
        <table-inner ref="pathTable" title="变量列表" :showMoreColumns="false" :table-header="false" :tableData="pathTableList.list" border :pageNum="pathTableList.pageNum" :pages="pathTableList.pages" :pageId="1" :pageSize="pathTableList.pageSize" @changePageNum="changePageNum">
          <template slot="table-columns">
            <el-table-column prop="id" label="序号" :formatter="utils.isEffective" show-overflow-tooltip></el-table-column>
            <el-table-column prop="type" label="引用类型" :formatter="utils.isEffective" show-overflow-tooltip></el-table-column>
            <el-table-column prop="path" label="引用路径" :formatter="utils.isEffective" show-overflow-tooltip></el-table-column>
          </template>
        </table-inner>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelPath">取 消</el-button>
      </div>
    </el-dialog>
    <el-dialog title="批量导入" :visible.sync="dialog.upload" :close-on-click-modal="false" class="middle-dialog">
      <div class="form-area">
        <div class="form-inner" style="padding-bottom: 0">
          <el-form label-width="120px" label-position="left">
            <el-form-item label="下载模板：">
              <el-button type="primary" @click="downloadTemp">excel模板</el-button>
            </el-form-item>
            <el-form-item label="导入文件：">
              <fero-upload
                action="https://jsonplaceholder.typicode.com/posts/"
                :remark="true"
                :file-list="fileList"
                :props="{name: 'name', src: 'url'}"
                :on-success="uploadSuccess">
                <el-button size="small" type="primary">上传文件</el-button>
              </fero-upload>
            </el-form-item>
          </el-form>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="closeDialog">关 闭</el-button>
      </div>
    </el-dialog>
  </default-layout>
</template>
<script>
export default {
  data () {
    return {
      varTitle: '新建分组',
      defaultProps: {
        children: 'childList'
      },
      fileList: [],
      showFunc: false,
      showVar: false,
      showConst: false,
      showOperator: false,
      bracketsLift: false,
      bracketsRight: false,
      func: '',
      varGroup: '',
      constForm: {
        constInput: ''
      },
      operator: '',
      operStatus: true,
      formulaList: [],
      varGroupList: [
        { label: '变量组一', id: 1 },
        { label: '变量组二', id: 2 },
        { label: '变量组三', id: 3 }
      ],
      variable: '',
      variableList: [],
      reload: true,
      tableList: {
        list: [
          {
            id: 1,
            code: '123123123',
            varName: 'asdfasdf阿斯顿发发付发所多发所多发所多',
            type: 1,
            varContent: 'asdfsadf',
            reference: '1',
            varNameFlag: true,
            varContentFlag: true
          },
          {
            id: 2,
            code: '123123123',
            varName: 'asdfasdf',
            type: 2,
            varContent: 'asdfsadf',
            reference: '0',
            varNameFlag: true,
            varContentFlag: true
          },
          {
            id: 3,
            code: '123123123',
            varName: 'aaaaaaaaaaaaaaaa',
            type: 3,
            varContent: [],
            reference: '0',
            varNameFlag: true,
            varContentFlag: true
          }
        ]
      },
      pathTableList: {
        list: [
          {
            id: 1,
            path: 'asdfasdf阿斯顿发发付发所多发所多发所多',
            type: '模型'
          },
          {
            id: 2,
            path: 'asdfasdf阿斯顿发发付发所多发所多发所多',
            type: '变量'
          }
        ]
      },
      searchInner: '',
      treeSearchInner: '',
      addForm: {
        varLibName: ''
      },
      varForm: {
        varLibName: ''
      },
      tableFormRules: {
        varName: [
          this.rulesToolkit.rules.required({name: '变量名称'})
        ]
      },
      rules: {
        varLibName: [
          this.rulesToolkit.rules.required({name: '变量库名称'})
        ]
        // uniId: [
        //   this.rulesToolkit.rules.required({name: '唯一标识'})
        // ]
      },
      varRules: {
        varLibName: [
          this.rulesToolkit.rules.required({name: '分组名称'})
        ]
      },
      constRules: {
        constInput: [
          this.rulesToolkit.rules.required({name: '常量'}),
          this.rulesToolkit.rules.range({name: '常量', max: 10})
        ]
      },
      dialog: {
        add: false,
        set: false,
        path: false,
        addVar: false,
        upload: false
      },
      title: '新建变量库',
      list: [{
        'id': 162,
        'varName': '汇融商业保理有限公司汇融商业保理有限公司汇融商业保理有限公司汇融商业保理有限公司',
        'status': 1,
        'childList': [{
          'id': 165,
          'status': 3,
          'varName': '业务部'
        }]
      }, {
        'id': 167,
        'varName': '怡亚通供应链股份有限公司',
        'status': 2,
        'childList': []
      }, {
        'id': 183,
        'varName': '大连汇融保理',
        'status': 1,
        'childList': []
      }, {
        'id': 185,
        'varName': '大连机车',
        'status': 1,
        'childList': []
      }, {
        'id': 187,
        'varName': '啦啦啦啦',
        'status': 1,
        'childList': []
      }, {
        'id': 189,
        'varName': '深圳市金桥商业有限公司',
        'status': 1,
        'childList': [{
          'id': 191,
          'varName': '业务一部',
          'status': 4,
          'childList': []
        }]
      }],
      timer: '',
      arrIndex: 0,
      rowId: '',
      pathTitle: '',
      currentNodeKey: '',
      maxHeight: ''
    }
  },
  created () {
    var that = this
    // 当前页面监视键盘输入
    document.onkeydown = function (e) {
      // 事件对象兼容
      let e1 = e || event || window.event || arguments.callee.caller.arguments[0]
      // 触发backspace 或者 delete按键
      if ((e1 && e1.keyCode === 8) || (e1 && e1.keyCode === 46)) {
        // true 光标状态  可删除；false 选中节点状态  不可删除
        if (that.operStatus) {
          that.delFormulaList(e1.keyCode)
        }
      }
    }
    this.defaultChecked()
  },
  mounted () {
    this.maxHeight = this.$refs['right'].offsetHeight - 50
    this.$refs['varTable'].doLayout()
  },
  methods: {
    defaultChecked () {
      for (let i in this.list) {
        if (this.list[i].childList && this.list[i].childList.length) {
          if (this.$route.query.childId) {
            this.currentNodeKey = this.$route.query.childId * 1
          } else {
            this.currentNodeKey = this.list[i].childList[0].id
            this.$router.push({query: {childId: this.list[i].childList[0].id}})
          }
          return false
        }
      }
    },
    cancelAdd () {
      this.$refs['form'].clearValidate()
      this.$refs['form'].resetFields()
      this.addForm = {
        varLibName: ''
      }
      this.dialog.add = false
    },
    confirmAdd () {
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.title === '新建变量库') {
            this.confirmVarLib()
          } else {
            this.editVarLib()
          }
        }
      })
    },
    confirmAddVar () {
      this.$refs['varForm'].validate(valid => {
        if (valid) {
          if (this.varTitle === '新建分组') {
            for (let i in this.list) {
              if (this.$route.query.id === this.list[i].id) {
                this.list[i].childList.push({
                  id: this.list.length + 1000 + this.list[i].childList.length,
                  varName: this.varForm.varLibName,
                  status: 3,
                  childList: []
                })
              }
            }
            this.$message.success('新增成功')
            this.dialog.addVar = false
          } else {
            for (let i in this.list) {
              if (this.$route.query.id === this.list[i].id) {
                for (let j in this.list[i].childList) {
                  if (this.$route.query.editChildId === this.list[i].childList[j].id) {
                    this.$set(this.list[i].childList[j], 'varName', this.varForm.varLibName)
                    // this.list[i].childList[j].varName = this.varForm.varLibName
                  }
                }
              }
            }
            this.$message.success('修改成功')
            this.dialog.addVar = false
          }
        }
      })
    },
    cancelAddVar () {
      console.log(this.$refs['varForm'])
      this.$refs['varForm'].clearValidate()
      this.$refs['varForm'].resetFields()
      this.varForm = {
        varLibName: ''
      }
      this.dialog.addVar = false
    },
    confirmVarLib () {
      this.list.push({
        id: this.list.length + 10,
        varName: this.addForm.varLibName,
        status: 1,
        childList: []
      })
      this.$message.success('新增成功')
      this.dialog.add = false
    },
    editVarLibClick (data) {
      this.title = '编辑变量库'
      this.dialog.add = true
      this.$set(this.addForm, 'varLibName', data.varName)
      let childId = this.$route.query.childId
      this.$router.push({query: {id: data.id, childId: childId}})
    },
    editVarClick (data, node) {
      this.varTitle = '编辑分组'
      this.dialog.addVar = true
      this.$set(this.varForm, 'varLibName', data.varName)
      let childId = this.$route.query.childId
      this.$router.push({query: {id: node.parent.data.id, editChildId: data.id, childId: childId}})
    },
    editVarLib () {
      for (let i in this.list) {
        if (this.$route.query.id === this.list[i].id) {
          this.list[i].varName = this.addForm.varLibName
          break
        }
      }
      this.$message.success('修改成功')
      this.dialog.add = false
    },
    cancelPath () {
      this.dialog.path = false
    },
    varLibPath (name) {
      this.pathTitle = '变量库-' + name
      this.dialog.path = true
    },
    varNamePath (name) {
      this.pathTitle = '变量 - ' + name
      this.dialog.path = true
    },
    tablePath (row) {
      this.pathTitle = '变量 - ' + row.varName
      this.dialog.path = true
    },
    addVarLib () {
      this.dialog.add = true
      this.title = '新建变量库'
    },
    nodeClick (data, node, self) {
      console.log(data)
      console.log(node)
      if (node.level === 2) {
        this.autoSave(data)
      } else {
        this.$refs['menu'].setCurrentKey(this.$route.query.childId)
      }
    },
    cellClick (row, column, cell, event) {
      if (row.reference === '1') {
        return false
      }
      for (let i in this.tableList.list) {
        this.tableList.list[i].varNameFlag = true
        this.tableList.list[i].varContentFlag = true
      }
      let arr = column.id.split('_')
      let colIndex = arr[arr.length - 1]
      if (colIndex === '1') {
        row.varNameFlag = false
        // this.$nextTick(() => {
        //   this.$refs['varInput' + row.id].focus()
        // })
      }
      if (colIndex === '3') {
        if (row.type === 2) {
          row.varContentFlag = false
          // this.$nextTick(() => {
          //   this.$refs['varContent' + row.id].focus()
          // })
        } else if (row.type === 3) {
          this.formulaList = [...row.varContent]
          this.rowId = row.id
          this.dialog.set = true
        }
      }
    },
    varInputBlur (row) {
      if (row.varName.length > 30) {
        this.$message.error('变量名称最多不超过30个字符')
        return false
      }
      row.varNameFlag = true
    },
    varContentBlur (row) {
      row.varContentFlag = true
    },
    addGroup (data, node) {
      this.varTitle = '新建分组'
      let childId = this.$route.query.childId
      this.$router.push({query: {id: data.id, childId: childId}})
      this.dialog.addVar = true
    },
    addVarBtn () {
      let data = {
        id: this.tableList.list.length + 1,
        code: '123123123',
        varName: '',
        type: 1,
        varContent: '',
        reference: '0',
        varNameFlag: true,
        varContentFlag: true
      }
      this.tableList.list.push(data)
      // this.reload = false
      // this.reload = true
      // this.$nextTick(() => {
      //   this.$refs['varTable'].doLayout()
      // })
      this.$forceUpdate()
      // this.$nextTick(() => {
      //   this.$refs['varTable'].doLayout()
      //   this.$refs['varInput' + data.id].focus()
      // })
    },
    selectChange (val, row) {
      row.varContent = ''
      if (val === 2) {
        // row.varContentFlag = false
        // this.$nextTick(() => {
        //   console.log(this.$refs['varContent' + row.id])
        //   this.$refs['varContent' + row.id].focus()
        // })
      }
    },
    formatFormula (data) {
      let str = ''
      for (let i in data) {
        if (data[i].type === 'var') {
          str = str + data[i].label + ','
        } else {
          str += data[i].label
        }
      }
      return str
    },
    confirmSet () {
      if (!this.formulaList.length) {
        this.$message.error('请先设置衍生公式')
        return false
      }
      for (let i in this.formulaList) {
        this.formulaList[i].border = false
      }
      for (let i in this.tableList.list) {
        if (this.tableList.list[i].id === this.rowId) {
          this.tableList.list[i].varContent = this.formulaList
          break
        }
      }
      this.$message.success('设置成功')
      this.dialog.set = false
    },
    cancelSet () {
      this.showFunc = false
      this.showVar = false
      this.showConst = false
      this.showOperator = false
      this.bracketsLift = false
      this.bracketsRight = false
      this.operStatus = false
      this.func = ''
      this.varGroup = ''
      this.operator = ''
      this.constForm = {
        constInput: ''
      }
      this.formulaList = []
      this.$refs['constForm'].clearValidate()
      this.dialog.set = false
      if (this.timer) {
        window.clearInterval(this.timer)
      }
    },
    varGroupChagne (val) {
      this.variableList = [
        { label: '选择变量一', id: 1 },
        { label: '选择变量二', id: 2 },
        { label: '选择变量三', id: 3 }
      ]
    },
    selectMember (type) {
      this.showFunc = false
      this.showVar = false
      this.showConst = false
      this.showOperator = false
      this.bracketsLift = false
      this.bracketsRight = false
      this.$refs['constForm'].clearValidate()
      if (type === 'bracketsLift') {
        this.bracketsLift = true
        if (this.operStatus) {
          this.formulaList.splice(this.arrIndex, 0, {label: '(', type: 'bracketsLift', border: false})
          this.$nextTick(() => {
            this.cursorClick(this.arrIndex)
          })
        } else {
          // 修改
          this.formulaList.splice(this.arrIndex, 1, {label: '(', type: 'bracketsLift', border: true})
        }
      }
      if (type === 'bracketsRight') {
        this.bracketsRight = true
        if (this.operStatus) {
          this.formulaList.splice(this.arrIndex, 0, {label: ')', type: 'bracketsRight', border: false})
          this.$nextTick(() => {
            this.cursorClick(this.arrIndex)
          })
        } else {
          // 修改
          this.formulaList.splice(this.arrIndex, 1, {label: ')', type: 'func', border: true})
        }
      }
      if (type === 'func') {
        this.showFunc = true
      }
      if (type === 'var') {
        this.showVar = true
      }
      if (type === 'const') {
        this.showConst = true
      }
      if (type === 'operator') {
        this.showOperator = true
      }
    },
    variableChange (val) {
      if (!val) {
        if (this.operStatus) {
          this.formulaList.splice(this.arrIndex, 0, {label: this.findVariableLabel(), type: 'var', border: false, id: this.variable, groupId: this.varGroup})
          this.$nextTick(() => {
            this.cursorClick(this.arrIndex)
          })
        } else {
          // 修改
          this.formulaList.splice(this.arrIndex, 1, {label: this.findVariableLabel(), type: 'var', border: true, id: this.variable, groupId: this.varGroup})
        }
      }
    },
    findVariableLabel () {
      for (let i in this.variableList) {
        if (this.variableList[i].id === this.variable) {
          return this.variableList[i].label
        }
      }
    },
    funcChange (val) {
      if (!val) {
        if (this.operStatus) {
          this.formulaList.splice(this.arrIndex, 0, {label: this.func, type: 'func', border: false})
          this.$nextTick(() => {
            this.cursorClick(this.arrIndex)
          })
        } else {
          // 修改
          this.formulaList.splice(this.arrIndex, 1, {label: this.func, type: 'func', border: true})
        }
      }
    },
    operatorChange (val) {
      if (!val) {
        if (this.operStatus) {
          this.formulaList.splice(this.arrIndex, 0, {label: this.operator, type: 'operator', border: false})
          this.$nextTick(() => {
            this.cursorClick(this.arrIndex)
          })
        } else {
          // 修改
          this.formulaList.splice(this.arrIndex, 1, {label: this.operator, type: 'operator', border: true})
        }
      }
    },
    contantsChange () {
      this.$refs['constForm'].validate(valid => {
        if (valid) {
          if (this.operStatus) {
            this.formulaList.splice(this.arrIndex, 0, {label: this.constForm.constInput, type: 'const', border: false})
            this.$nextTick(() => {
              this.cursorClick(this.arrIndex)
            })
          } else {
            // 修改
            this.formulaList.splice(this.arrIndex, 1, {label: this.constForm.constInput, type: 'const', border: true})
          }
        }
      })
    },
    cursorClick (index, flag) {
      if (flag) {
        this.showFunc = false
        this.showVar = false
        this.showConst = false
        this.showOperator = false
        this.bracketsLift = false
        this.bracketsRight = false
        this.varGroup = ''
        this.variable = ''
        this.func = ''
        this.operator = ''
        this.constForm.constInput = ''
        this.$refs['constForm'].clearValidate()
      }
      this.operStatus = true
      this.arrIndex = index + 1
      for (let i in this.formulaList) {
        this.formulaList[i].border = false
      }
      if (this.timer) {
        window.clearInterval(this.timer)
      }
      if (this.$refs['line']) {
        if (this.$refs['line'].length) {
          for (let i in this.$refs['line']) {
            this.$refs['line'][i].style.display = 'none'
          }
        } else {
          this.$refs['line'].style.display = 'inline-block'
          this.timer = window.setInterval(() => {
            let display = this.$refs['line'].style.display
            this.$refs['line'].style.display = display === 'none' ? 'inline-block' : 'none'
          }, 500)
          return false
        }
      }
      this.$refs['line'][index * 1 + 1].style.display = 'inline-block'
      this.timer = window.setInterval(() => {
        let display = this.$refs['line'][index * 1 + 1].style.display
        this.$refs['line'][index * 1 + 1].style.display = display === 'none' ? 'inline-block' : 'none'
      }, 500)
    },
    labelClick (index, item) {
      this.showFunc = false
      this.showVar = false
      this.showConst = false
      this.showOperator = false
      this.bracketsLift = false
      this.bracketsRight = false
      this.operStatus = false
      this.$refs['constForm'].clearValidate()
      if (this.$refs['line'] && this.$refs['line'].length) {
        for (let i in this.$refs['line']) {
          this.$refs['line'][i].style.display = 'none'
        }
      }
      this.arrIndex = index
      for (let i in this.formulaList) {
        this.formulaList[i].border = false
      }
      item.border = true
      switch (item.type) {
        case 'var':
          this.showVar = true
          this.varGroup = item.groupId
          this.variable = item.id
          break
        case 'bracketsLift':
          this.bracketsLift = true
          break
        case 'bracketsRight':
          this.bracketsRight = true
          break
        case 'func':
          this.showFunc = true
          this.func = item.label
          break
        case 'const':
          this.showConst = true
          this.constForm.constInput = item.label
          break
        case 'operator':
          this.showOperator = true
          this.operator = item.label
          break
        default:
          break
      }
      if (this.timer) {
        window.clearInterval(this.timer)
      }
    },
    delFormulaList (code) {
      // backspace  向前删除一个节点
      if (code === 8) {
        if (this.arrIndex > 0) {
          this.formulaList.splice(this.arrIndex - 1, 1)
          this.arrIndex = this.arrIndex - 1
          this.$nextTick(() => {
            this.cursorClick(this.arrIndex - 1)
          })
        }
      } else if (code === 46) {
        // delete  向后删除一个节点
        this.formulaList.splice(this.arrIndex, 1)
        this.$nextTick(() => {
          this.cursorClick(this.arrIndex - 1)
        })
      }
    },
    changePageNum ({pageId, pageNum}) {},
    delVarGroup (data, node) {
      // this.$router.push({query: {id: node.parent.data.id, childId: data.id}})
      this.$confirm('分组一旦删除，当前分组变量将一同删除，确定删除分组？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        for (let i in this.list) {
          if (this.$route.query.id === this.list[i].id) {
            for (let j in this.list[i].childList) {
              if (data.id === this.list[i].childList[j].id) {
                this.list[i].childList.splice(j, 1)
              }
            }
          }
        }
        this.$message.success('删除成功')
      }).catch(() => {
      })
    },
    delVarLib (data, node) {
      console.log(node)
      // this.$router.push({query: {id: data.id}})
      this.$confirm('分组一旦删除，当前分组变量将一同删除，确定删除分组？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        for (let i in this.list) {
          if (data.id === this.list[i].id) {
            this.list.splice(i, 1)
          }
        }
        this.$message.success('删除成功')
        console.log(this.$refs['menu'].getCurrentKey())
      }).catch(() => {
      })
    },
    delTableVar (row) {
      this.$confirm('确定删除选中变量?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        for (let i in this.tableList.list) {
          if (row.id === this.tableList.list[i].id) {
            this.tableList.list.splice(i, 1)
          }
        }
        this.$message.success('删除成功')
      }).catch(() => {
      })
    },
    searchVar () {
      this.list = [
        {
          'id': 162,
          'varName': '汇融商业保理有限公司汇融商业保理有限公司汇融商业保理有限公司汇融商业保理有限公司',
          'status': 1,
          'childList': [
            {
              'id': 165,
              'status': 3,
              'varName': '业务部'
            }
          ]
        },
        {
          'id': 189,
          'varName': '深圳市金桥商业有限公司',
          'status': 1,
          'childList': [
            {
              'id': 191,
              'varName': '业务一部',
              'status': 4,
              'childList': []
            }
          ]
        }
      ]
    },
    async manualSave () {
      let flag = await this.tableValidate()
      if (flag !== false) {
        this.$message.success('保存成功')
      }
    },
    tableValidate () {
      for (let item of this.tableList.list) {
        if (!(!item.varName && !item.varContent.length)) {
          if (!item.varName || (item.type !== 1 && !item.varContent.length)) {
            this.$alert('表格有空缺项，请先完善表格数据', '提示', { type: 'warning' }).then(() => {})
            this.$refs['menu'].setCurrentKey(null)
            this.$refs['menu'].setCurrentKey(this.$route.query.childId)
            return false
          }
        }
      }
    },
    async autoSave (data) {
      if (data.id !== this.$route.query.childId * 1) {
        let flag = await this.tableValidate()
        if (flag !== false) {
          this.$router.push({query: {childId: data.id}})
        }
      }
    },
    uploadSuccess (res, file, fileList) {
      this.$message.success('上传成功')
    },
    downloadTemp () {
      window.open()
    },
    closeDialog () {
      this.dialog.upload = false
      this.fileList = []
    }
  }
}
</script>
<style lang="less">
  #variable {
    .oper-btn {
      .bracketsHasBorder {
        border: 1px solid #F9782C;
      }
      .bracketsNoBorder {
        border: none;
      }
      .funcHasBorder {
        border: 1px solid #18882F;
      }
      .funcNoBorder {
        border: none;
      }
      .varHasBorder {
        border: 1px solid #1188FF;
      }
      .varNoBorder {
        border: none;
      }
      .constHasBorder {
        border: 1px solid #323233;
      }
      .constNoBorder {
        border: none;
      }
      .operatorHasBorder {
        border: 1px solid #DC1E32;
      }
      .operatorNoBorder {
        border: none;
      }
    }
    .formula {
      min-height: 90px;
      border-radius:2px;
      border:1px solid rgba(215,230,245,1);
      padding: 5px;
      display: flex;
      flex-flow: row wrap;
      justify-content: flex-start;
      align-content: flex-start;
      & > div {
        display: flex;
        justify-content: flex-start;
        height: 28px;
        a {
          display: inline-block;
          height: 28px;
          line-height: 28px;
        }
        & > span {
          display: inline-block;
          height: 28px;
          line-height: 28px;
          padding: 0 2px;
        }
        .hasBorder {
          border: 1px solid #1188FF;
        }
        .noBorder {
          border: none;
        }
      }
      & > a {
        display: inline-block;
        height: 28px;
        line-height: 28px;
      }
    }
    .content-right {
      .table-inner {
        .table-hd {
          height: 50px;
          .title {
            font-size: 16px;
            line-height: 16px;
            margin-top: 17px;
          }
          .btn-inner {
            line-height: 50px;
          }
        }
        .table-bd {
          border-right: none;
        }
        .el-table--border, .el-table--group {
          border: none;
        }
      }
      .el-table {
        .cell {
          padding-right: 0;
          padding-left: 0;
          .el-input__inner {
            border: none;
            font-size: 12px;
            padding: 0 12px;
          }
          .el-select {
            display: block;
          }
        }
        th {
          .cell {
            padding-right: 12px;
            padding-left: 12px;
            font-weight: 600;
          }
        }
        td {
          padding-top: 0;
          padding-bottom: 0;
          position: relative;
          .tdBorder {
            position:absolute;
            left: 0;
            top: 0;
            bottom: 0;
            right: 0;
            z-index: 0;
            border: 1px solid #1188FF;
            background-color: #E7F3FF;
          }
        }
        .el-input {
          display: block;
          width: auto;
          margin: 0 1px;
        }
        .el-input__inner {
          background-color: transparent;
        }
        .el-input__inner:focus {
          border: none;
          background-color: transparent;
        }
      }
    }
    .tree-style {
      overflow-y: auto;
      .el-tree-node__children {
        .custom-tree-node {
          .tree-span-name-text {
            font-weight: unset;
          }
        }
      }
      .el-tree-node__content {
        line-height: unset;
        height: auto;
        padding: 5px 0;
        .el-tree-node__expand-icon {
          font-size: 18px;
        }
      }
      .tree-left {
        width: 60%;
        display: inline-block;
        font-weight: 500;
        .tree-span-name-text {
          width: 100%;
          white-space: pre-wrap;
          word-break: break-all;
        }
      }
      .tree-right{
        float: right;
        .text-btn {
          color: #1188FF;
        }
        .text-btn.danger {
          color: #E8744F;
        }
        .tree-span-operation {
          a {
            font-size: 10px;
          }
        }
      }
      .custom-tree-node {
        width: 100%;
        padding-right: 6px;
        font-size: 12px;
        .tree-span-name-text {
          font-weight: 600;
        }
      }
    }
    .content-left {
      width: 400px;
      background-color: #fff;
      height: 100%;
      float: left;
      .area-title {
        background-color: transparent;
        height: 50px;
        line-height: 50px;
        border-bottom: 1px solid #f5f5f5;
        .title {
          font-size: 16px;
          line-height: 16px;
          margin-top: 17px;
        }
      }
    }
    .search-input {
      display: inline-block;
      float: left;
      width: 640px;
      padding-left: 20px;
      margin-top: 20px;
      border-radius: 4px;
      .el-input__inner {
        height: 40px;
        line-height: 40px;
        border-radius: 4px;
      }
      .el-input__icon {
        line-height: 40px;
      }
    }
    .search-icon {
      display: inline-block;
      width:40px;
      height:40px;
      line-height: 40px;
      text-align: center;
      background:rgba(255,255,255,1);
      border-radius:12px;
      margin-top: 20px;
      margin-left: 12px;
      cursor: pointer;
      float: left;
      i {
        font-size: 25px;
        color: #62717A;
      }
    }
    .el-tree-node:focus>.el-tree-node__content {
      background-color: transparent;
    }
    .el-tree-node:hover>.el-tree-node__content {
      background-color: transparent;
    }
    .el-tree-node__children {
      .el-tree-node:hover {
        .el-tree-node__content {
          background-color: #F5F6FA;
          color: #6257CD;
        }
      }
    }
    .el-tree-node__children {
      .el-tree-node:focus {
        .el-tree-node__content {
          background-color: transparent;
          /*color: ;*/
        }
      }
    }
    .el-tree--highlight-current .el-tree-node.is-current>.el-tree-node__content {
      background-color: transparent;
    }
    .el-tree--highlight-current .el-tree-node__children .el-tree-node.is-current>.el-tree-node__content {
      background-color: #F5F6FA;
      color: #6257CD;
    }
    .el-dialog__body .form-area {
      padding-top: 20px;
    }
  }
</style>
