<template>
  <div ref="mindmap" id="mindmap" :style="mmStyle">
    <svg ref="svg" tabindex="0" :class="svgClass">
      <g ref="content" id="content" ></g>
    </svg>
    <div ref="dummy" id="dummy"></div>
    <div ref="menu"
      id="menu"
      tabindex="0"
      v-show="showContextMenu"
      :style="{ top: contextMenuY+'px', left: contextMenuX+'px' }"
      @blur="showContextMenu = false"
    >
      <div
        class="menu-item"
        v-for="(item, index) in contextMenuItems"
        :key="index"
        @click="clickMenu(item)"
      >
        <div>{{ item.title }}</div>
      </div>
    </div>
    <div class="button right-bottom">
      <button v-show="gps" class="icon" ref="gps" type="button" @click="makeCenter()">
        <i class="gps"></i>
      </button>
      <button v-show="fitView" class="icon" ref="fitView" type="button" @click="fitContent()">
        <i class="fitView"></i>
      </button>
      <button v-show="download" class="icon" ref="download" type="button" @click="exportImage()">
        <i class="download"></i>
      </button>
    </div>
    <div class="button top-right">
      <button v-show="showUndo" class="icon" :class="{disabled: !canUndo()}" ref="undo"
        type="button" @click="canUndo() ? undo() : null"
      >
        <i class="undo"></i>
      </button>
      <button v-show="showUndo" class="icon" :class="{disabled: !canRedo()}" ref="redo"
        type="button" @click="canRedo() ? redo() : null"
      >
        <i class="redo"></i>
      </button>
    </div>
    <el-drawer
      :visible.sync="dialog"
      :wrapperClosable="false"
      direction="rtl"
      :modal="false"
      size="100%"
      custom-class="demo-drawer"
      ref="drawer"
    >
      <span slot="title">
        <img src="../assets/images/set.png" style="width: 13px;height: 15px;vertical-align: middle;" alt="">
        设置
      </span>
      <div class="demo-drawer__content">
        <div class="form-area">
          <div class="form-inner">
            <el-form ref="form" :model="form" label-position="left" :rules="rules" label-width="80px">
              <el-form-item label="选择节点" v-if="secondNode">
                <p>添加变量</p>
              </el-form-item>
              <el-form-item prop="varLibrary" label="变量库" v-if="secondNode">
                <el-select v-model="form.varLibrary" placeholder="请选择变量库" @change="varLibraryChange">
                  <el-option v-for="item in varLibraryList" :key="item.id" :label="item.label" :value="item.id"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item prop="varGroup" label="变量分组" v-if="secondNode">
                <el-select v-model="form.varGroup" placeholder="请选择变量分组" @change="varGroupChange">
                  <el-option v-for="item in varGroupList" :key="item.id" :label="item.label" :value="item.id"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item prop="variable" label="选择变量" v-if="secondNode">
                <el-select v-model="form.variable" placeholder="请选择变量">
                  <el-option v-for="item in variableList" :key="item.id" :label="item.label" :value="item.id"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item prop="name" label="规则组名称" v-if="firstNode">
                <el-input v-model="form.name" placeholder="请输入规则组名称"></el-input>
              </el-form-item>
              <el-form-item prop="nodeType" label="选择节点" v-if="otherNode">
                <el-select v-model="form.nodeType" placeholder="请选择节点" >
                  <el-option label="添加条件" :value="'TJ'"></el-option>
                  <el-option label="添加变量" :value="'BL'"></el-option>
                  <el-option label="赋值力度" :value="'FZLD'"></el-option>
                </el-select>
              </el-form-item>
              <!--节点选择的是添加条件-->
              <el-form-item prop="condition" label="选择条件" v-if="otherNode && form.nodeType === 'TJ'">
                <el-select v-model="form.condition" placeholder="请选择条件" >
                  <el-option v-for="(item, index) in conditionList" :key="index" :label="item.label" :value="item.value"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item prop="conVarType" label="选择类型" v-if="otherNode && form.nodeType === 'TJ'">
                <el-select v-model="form.conVarType" placeholder="请选择类型" >
                  <el-option label="变量" value="BL"></el-option>
                  <el-option label="常量" value="CL"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item prop="varLibrary" label="变量库"  v-if="otherNode && form.nodeType === 'TJ' && form.conVarType === 'BL'">
                <el-select v-model="form.varLibrary" placeholder="请选择变量库" @change="varLibraryChange">
                  <el-option v-for="item in varLibraryList" :key="item.id" :label="item.label" :value="item.id"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item prop="varGroup" label="变量分组" v-if="otherNode && form.nodeType === 'TJ' && form.conVarType === 'BL'">
                <el-select v-model="form.varGroup" placeholder="请选择变量分组" @change="varGroupChange">
                  <el-option v-for="item in varGroupList" :key="item.id" :label="item.label" :value="item.id"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item prop="variable" label="选择变量"  v-if="otherNode && form.nodeType === 'TJ' && form.conVarType === 'BL'">
                <el-select v-model="form.variable" placeholder="请选择变量">
                  <el-option v-for="item in variableList" :key="item.id" :label="item.label" :value="item.id"></el-option>
                </el-select>
              </el-form-item>
              <!--类型选择的是常量-->
              <el-form-item prop="constant" label="常量" v-if="otherNode && form.nodeType === 'TJ' && form.conVarType === 'CL'">
                <el-input v-model="form.constant" placeholder="请输入常量" autocomplete="off"></el-input>
              </el-form-item>
              <!--节点选择的是添加变量-->
              <el-form-item prop="varLibrary" label="变量库" v-if="otherNode && form.nodeType === 'BL'">
                <el-select v-model="form.varLibrary" placeholder="请选择变量库" @change="varLibraryChange">
                  <el-option v-for="item in varLibraryList" :key="item.id" :label="item.label" :value="item.id"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item prop="varGroup" label="变量分组" v-if="otherNode && form.nodeType === 'BL'">
                <el-select v-model="form.varGroup" placeholder="请选择变量分组" @change="varGroupChange">
                  <el-option v-for="item in varGroupList" :key="item.id" :label="item.label" :value="item.id"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item prop="variable" label="选择变量" v-if="otherNode && form.nodeType === 'BL'">
                <el-select v-model="form.variable" placeholder="请选择变量">
                  <el-option v-for="item in variableList" :key="item.id" :label="item.label" :value="item.id"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item prop="resultsValue" label="控制力度" v-if="otherNode && form.nodeType === 'FZLD'">
                <el-select v-model="form.resultsValue" placeholder="请选择控制力度">
                  <el-option v-for="item in intensityList" :key="item.id" :label="item.label" :value="item.id"></el-option>
                </el-select>
              </el-form-item>
            </el-form>
          </div>
        </div>
        <div class="demo-drawer__footer">
          <el-button @click="cancel">取 消</el-button>
          <el-button type="primary" @click="confirm">确 定</el-button>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import * as d3 from '../assets/js/d3'
import { flextree } from 'd3-flextree'
import JSONData from '../assets/js/JSONData'
import History from '../assets/js/History'
import ResizeObserver from 'resize-observer-polyfill'
export default {
  name: 'mindmap',
  props: {
    value: { type: Array, required: true },
    width: Number,
    height: Number,
    xSpacing: { type: Number, default: 80 },
    ySpacing: { type: Number, default: 20 },
    draggable: { type: Boolean, default: true },
    gps: { type: Boolean, default: true },
    fitView: { type: Boolean, default: true },
    download: { type: Boolean, default: false }, // 待实现
    keyboard: { type: Boolean, default: true },
    showNodeAdd: { type: Boolean, default: true },
    contextMenu: { type: Boolean, default: true },
    nodeClick: { type: Boolean, default: true },
    zoomable: { type: Boolean, default: true },
    showUndo: { type: Boolean, default: true },
    strokeWidth: { type: Number, default: 4 },
    status: { type: Boolean, default: false },
    treeId: { type: Number }
  },
  model: { // 双向绑定
    prop: 'value',
    event: 'change'
  },
  computed: {
    mmStyle () {
      return {
        width: this.width ? `${this.width}px` : '100%',
        height: this.height ? `${this.height}px` : '100%'
      }
    },
    svgClass () {
      return `stroke-width-${this.strokeWidth}`
    }
  },
  data () {
    return {
      toRecord: true, // 判断是否需要记录mmdata的数据快照
      toUpdate: true, // 判断是否需要更新mmdata
      dTop: null, // mmdata中纵坐标最高的数据
      mmdata: {}, // 思维导图数据
      root: '', // 包含位置信息的mmdata
      showContextMenu: false,
      contextMenuX: 0,
      contextMenuY: 0,
      contextMenuItems: [
        { title: '删除节点', command: 0 }
      ],
      mindmap_svg: Object,
      mindmap_g: Object,
      dummy: Object,
      mindmapSvgZoom: Function,
      easePolyInOut: d3.transition().duration(1000).ease(d3.easePolyInOut),
      link: d3.linkHorizontal().x((d) => d[0]).y((d) => d[1]),
      zoom: d3.zoom(),
      history: new History(),
      selectedElement: undefined,
      dialog: false,
      form: {
        name: '',
        constant: ''
      },
      rules: {
        varLibrary: [
          this.rulesToolkit.rules.required({name: '变量库'})
        ],
        varGroup: [
          this.rulesToolkit.rules.required({name: '变量分组'})
        ],
        variable: [
          this.rulesToolkit.rules.required({name: '变量'})
        ],
        name: [
          this.rulesToolkit.rules.required({name: '规则组名称'}),
          this.rulesToolkit.rules.range({name: '规则组名称', max: 30})
        ],
        nodeType: [
          this.rulesToolkit.rules.required({name: '选择节点'})
        ],
        condition: [
          this.rulesToolkit.rules.required({name: '选择条件'})
        ],
        conVarType: [
          this.rulesToolkit.rules.required({name: '选择类型'})
        ],
        resultsValue: [
          this.rulesToolkit.rules.required({name: '控制力度'})
        ],
        constant: [
          this.rulesToolkit.rules.required({name: '常量'}),
          this.rulesToolkit.rules.range({name: '常量', max: 10})
        ]
      },
      secondNode: false,
      otherNode: false,
      firstNode: false,
      variableList: [],
      varLibraryList: [
        { label: '变量库一', id: 1 },
        { label: '变量库二', id: 2 },
        { label: '变量库三', id: 3 }
      ],
      varGroupList: [],
      conditionList: [
        { label: '等于', value: 'EQ' },
        { label: '不等于', value: 'NotEq' },
        { label: '小于', value: 'LT' },
        { label: '大于', value: 'GT' },
        { label: '小于等于', value: 'LTQ' },
        { label: '大于等于', value: 'GTQ' }
      ],
      intensityList: [
        { label: '禁止性', id: 1 },
        { label: '限制性', id: 2 },
        { label: '风险提示性', id: 3 }
      ]
    }
  },
  watch: {
    mmdata: {
      handler (newVal) {
        if (this.toRecord) { this.history.record(newVal.data) }
        this.updateMindmap()
        this.toUpdate = false
        this.$emit('change', this.mmdata.getPuredata())
      },
      deep: true
    },
    status (nv) {
      if (nv) {
        this.dialog = false
        d3.select(document.body).selectAll('#editing').attr('id', '')
      }
    },
    keyboard: function (val) { this.makeKeyboard(val) },
    showNodeAdd: function (val) { this.makeNodeAdd(val) },
    draggable: function (val) { this.makeDrag(val) },
    contextMenu: function (val) { this.makeContextMenu(val) },
    xSpacing: function () {
      this.depthTraverse2(this.mmdata.data, this.getTextSize)
      this.updateMindmap()
    },
    ySpacing: function () { this.updateMindmap() },
    nodeClick: function (val) { this.makeNodeClick(val) },
    zoomable: function (val) { this.makeZoom(val) }
  },
  methods: {
    confirm () {
      this.$refs['form'].validate(valid => {
        if (valid) {
          this.updateNodeName()
          this.updateMindmap()
          this.variableList = []
          this.varGroupList = []
        }
      })
    },
    cancel () {
      d3.select(document.body).selectAll('#editing').attr('id', '')
      // this.$refs['form'].resetFields()
      this.$refs['form'].clearValidate()
      this.dialog = false
    },
    quickTest () {
      this.travalMindMap(this.mmdata.data)
      let arr = d3.select(document.body).selectAll('#editing')._groups[0]
      if (arr && arr.length) {
        this.$message.error('尾节点缺少赋值力度')
        return false
      } else {
        return true
      }
    },
    travalMindMap (data = this.mmdata.data) {
      for (let i in data) {
        if (data[i].children && data[i].children.length) {
          this.travalMindMap(data[i].children)
        } else {
          for (let j in d3.selectAll('.textDiv')._groups[0]) {
            if (d3.select(d3.selectAll('.textDiv')._groups[0][j])._groups[0][0].__data__) {
              if (d3.select(d3.selectAll('.textDiv')._groups[0][j])._groups[0][0].__data__.data.id === data[i].id) {
                let node = d3.select(d3.selectAll('.textDiv')._groups[0][j])._groups[0][0].parentNode
                if (!data[i].form || (data[i].form && data[i].form.nodeType !== 'FZLD')) {
                  d3.select(d3.select(node)._groups[0][0].parentNode).attr('id', 'editing')
                }
              }
            }
          }
        }
      }
    },
    init () {
      // 绑定元素
      this.mindmap_svg = d3.select(this.$refs.svg)
      this.mindmap_g = d3.select(this.$refs.content).style('opacity', 1)
      this.dummy = d3.select(this.$refs.dummy)
      // 绑定事件
      this.makeKeyboard(this.keyboard)
      this.mindmap_svg.on('contextmenu', () => { d3.event.preventDefault() })
      this.mindmapSvgZoom = this.zoom.scaleExtent([0.1, 8]).on('zoom', () => {
        this.mindmap_g.attr('transform', d3.event.transform)
      })
      this.makeZoom(this.zoomable)
      this.makeCenter()
    },
    initNodeEvent () {
      // 绑定节点事件
      this.makeDrag(this.draggable)
      this.makeNodeAdd(this.showNodeAdd)
      this.makeContextMenu(this.contextMenu)
      this.makeNodeClick(this.nodeClick)
    },
    canUndo () { return this.history.canUndo },
    canRedo () { return this.history.canRedo },
    // 事件
    makeKeyboard (val) {
      this.mindmap_svg.on('keydown', val ? this.svgKeyDown : null)
    },
    makeNodeAdd (val) {
      const fObject = this.mindmap_g.selectAll('foreignObject')
      const gBtn = this.mindmap_g.selectAll('.gButton')
      const delBtn = this.mindmap_g.selectAll('.delButton')
      if (val) {
        const { mouseLeave, mouseEnter, gBtnClick, delBtnClick } = this

        fObject.on('mouseenter', mouseEnter).on('mouseleave', mouseLeave)
        gBtn.on('mouseenter', mouseEnter).on('mouseleave', mouseLeave).on('click', gBtnClick)
        delBtn.on('mouseenter', mouseEnter).on('mouseleave', mouseLeave).on('click', delBtnClick)
      } else {
        fObject.on('mouseenter', null).on('mouseleave', null)
        gBtn.on('mouseenter', null).on('mouseleave', null).on('click', null)
      }
    },
    makeContextMenu (val) {
      this.mindmap_g.selectAll('foreignObject').on('contextmenu', val ? this.fObjectRightClick : null)
    },
    makeDrag (val) {
      if (val) {
        const { mindmap_g, dragged, dragended } = this
        mindmap_g.selectAll('foreignObject').filter((d) => d.depth !== 0)// 非根节点才可以拖拽
          .call(d3.drag().container((d, i, n) => n[i].parentNode.parentNode).on('drag', dragged).on('end', dragended))
      } else {
        this.mindmap_g.selectAll('foreignObject').call(d3.drag().on('drag', null).on('end', null))
      }
    },
    makeNodeClick (val) {
      this.mindmap_g.selectAll('foreignObject').on('click', val ? this.fObjectClick : null)
    },
    makeZoom (val) {
      if (val) {
        this.mindmap_svg.call(this.mindmapSvgZoom).on('dblclick.zoom', null)
      } else {
        this.mindmap_svg.on('.zoom', null)
      }
    },
    // button事件
    undo () {
      this.toRecord = false
      const prev = this.history.undo()
      this.mmdata = new JSONData(prev)
    },
    redo () {
      this.toRecord = false
      const next = this.history.redo()
      this.mmdata = new JSONData(next)
    },
    exportImage () { // 导出png：待解决
    },
    async makeCenter () { // 居中
      await d3.transition().end().then(() => {
        const div = this.$refs.mindmap
        const content = this.$refs.content.getBBox()
        const { k } = d3.zoomTransform(this.$refs.svg)

        const x = (
          -(div.offsetWidth - k * content.width) / (2 * k) -
          5
        )
        const y = (
          -(div.offsetHeight - k * content.height) / (2 * k) -
          (-this.dTop.x - this.foreignY(this.dTop))
        )

        this.mindmap_svg.call(this.zoom.translateTo, -50, y, [0, 0])
      })
    },
    async fitContent () { // 适应窗口大小
      await d3.transition().end().then(() => {
        const rect = this.$refs.content.getBBox()
        const div = this.$refs.mindmap

        const multipleX = div.offsetWidth / rect.width
        const multipleY = div.offsetHeight / rect.height
        const multiple = Math.min(multipleX, multipleY)

        this.mindmap_svg.transition(this.easePolyInOut).call(this.zoom.scaleTo, multiple)
      })
    },
    // 数据操作
    add (dParent, d) {
      this.toRecord = true
      this.mmdata.add(dParent, d)
      this.depthTraverse2(this.mmdata.data, this.getTextSize)
    },
    insert (dPosition, d, i = 0) {
      this.toRecord = true
      this.mmdata.insert(dPosition, d, i)
      this.depthTraverse2(this.mmdata.data, this.getTextSize)
    },
    del (s) {
      // this.selectedElement ?.remove() // 使动画流畅
      this.toRecord = true
      this.mmdata.del(s)
      this.depthTraverse2(this.mmdata.data, this.getTextSize)
    },
    updateName (d, name) {
      this.toRecord = true
      d.data.name = name
      d.data.firstNode = this.firstNode
      d.data.secondNode = this.secondNode
      d.data.otherNode = this.otherNode
      d.data.form = this.form
      this.depthTraverse2(this.mmdata.data, this.getTextSize)
    },
    // 右键拖拽
    rightDragStart () {
    },
    rightDrag () {
    },
    rightDragEnd () {
    },
    // 键盘
    svgKeyDown () {
      const sele = d3.select('#selectedNode')
      if (!sele.node()) { return }

      const seleData = sele.data()[0]
      const seleRawData = sele.data()[0].data
      const pNode = sele.node().parentNode
      const newJSON = { name: '新建节点', children: [] }
      const keyName = d3.event.key

      if (keyName === 'Tab') { // 添加子节点
        d3.event.preventDefault()
        this.add(seleRawData, newJSON)
        this.editNew(newJSON, seleData.depth + 1, pNode)
      } else if (keyName === 'Enter') { // 添加弟弟节点
        d3.event.preventDefault()
        if (pNode.isSameNode(this.$refs.content)) {
          this.add(seleRawData, newJSON)// 根节点enter时，等效tab
          this.editNew(newJSON, seleData.depth + 1, pNode)
        } else {
          this.insert(seleRawData, newJSON, 1)
          this.editNew(newJSON, seleData.depth, pNode)
        }
      } else if (keyName === 'Backspace') { // 删除节点
        d3.event.preventDefault()
        this.del(seleRawData)
      }
    },
    divKeyDown () {
      if (d3.event.key === 'Enter') {
        // d3.event.preventDefault()
        // document.execCommand('insertHTML', false, '<br>')
      }
    },
    // 节点操作
    updateNodeName () { // 文本编辑完成时
      // const editP = document.querySelector('#editing > foreignObject > div')
      window.getSelection().removeAllRanges()// 清除选中
      let editText = ''
      if (this.secondNode) {
        editText = this.findVariableLabel()
      } else if (this.firstNode) {
        editText = this.form.name
      } else if (this.otherNode) {
        if (this.form.nodeType === 'TJ') {
          editText = this.findConditionLabel()
          if (this.form.conVarType === 'BL') {
            editText = editText + '     ' + this.findVariableLabel()
          }
          if (this.form.conVarType === 'CL') {
            editText = editText + '     ' + this.form.constant
          }
        } else if (this.form.nodeType === 'BL') {
          editText = this.findVariableLabel()
        } else if (this.form.nodeType === 'FZLD') {
          this.form.resultsType = 'FZLD'
          editText = '力度     ' + this.findIntensityLabel()
        }
      }
      // const editText = editP.innerText
      d3.select('g#editing').each((d, i, n) => {
        n[i].removeAttribute('id')
        // editP.setAttribute('contenteditable', false)
        this.updateName(d, editText)
      })
      this.dialog = false
      this.secondNode = false
      this.otherNode = false
      this.firstNode = false
    },
    removeSelectedNode () {
      const sele = this.selectedElement
      if (sele) { sele.removeAttribute('id') }
    },
    selectNode (n) { // 选中节点
      if (n.getAttribute('id') !== 'selectedNode') {
        this.removeSelectedNode()
        d3.select(n).attr('id', 'selectedNode')
        this.selectedElement = n
      }
    },
    editNode (n) { // 编辑节点
      this.removeSelectedNode()
      n.setAttribute('id', 'editing')
      d3.select(n).selectAll('foreignObject')
        .filter((a, b, c) => c[b].parentNode === n)
        .select('div')
        // .attr('contenteditable', true)

      // const fdiv = document.querySelector('#editing > foreignObject > div')
      // window.getSelection().selectAllChildren(fdiv)
    },
    editNew (newJSON, depth, pNode) { // 聚焦新节点
      d3.transition().end().then(() => {
        const clickedNode = d3.select(pNode)
          .selectAll(`g.node.depth_${depth}`)
          .filter((b) => b.data === newJSON)
          .node()
        this.editNode(clickedNode)
      }, (err) => {
        console.log(err)
      })
    },
    fdivMouseDown () {
      const flag = d3.event.target.getAttribute('class')
      console.log('123')
      if (flag === 'textDiv') {
        d3.event.stopPropagation() // 防止触发drag、click
      }
    },
    fObjectClick (d, i, n) {
      console.log('456')
      if (this.status) {
        return false
      }
      this.secondNode = false
      this.otherNode = false
      this.firstNode = false
      // d3.select(n[i].parentNode).select('.gButton').attr('fill', 'red')
      // const edit = document.getElementById('editing')
      // const sele = document.getElementById('selectedNode')
      this.form = {}
      if (d.data.form) {
        this.form = d.data.form
        if (this.form.varLibrary) {
          this.varLibraryChange(this.form.varLibrary)
          this.varGroupChange(this.form.varGroup)
        }
      }
      d3.select(document.body).selectAll('#editing').attr('id', '')
      const clickedNode = n[i].parentNode
      clickedNode.setAttribute('id', 'editing')
      // let className = clickedNode.getAttribute('class')
      // this.form.name = d3.select(clickedNode).select('.textDiv').text()
      let className = n[i].parentNode.getAttribute('class')
      let depth = +className.substring(6, 7)
      if (depth === 1) {
        this.secondNode = true
      } else if (depth > 1) {
        this.otherNode = true
      } else {
        this.firstNode = true
      }
      this.dialog = true
      // this.$refs['form'].clearValidate()
      // this.$refs['form'].resetFields()
      //
      // if (!edit) { // 未在编辑
      //   this.selectNode(clickedNode)
      //
      //   const fdiv = d3.select(clickedNode).selectAll('foreignObject')
      //     .filter((a, b, c) => c[b].parentNode === clickedNode)
      //     .select('div')
      //     .node()
      //   fdiv.contentEditable = true
      //
      //   new Promise((resolve) => {
      //     setTimeout(() => {
      //       let flag = false // 单击false 双击true
      //       if (document.activeElement !== fdiv) {
      //         fdiv.contentEditable = false
      //       } else {
      //         flag = true
      //         this.removeSelectedNode()
      //         clickedNode.setAttribute('id', 'editing')
      //       }
      //       resolve(flag)
      //     }, 150)
      //   }).then((flag) => {
      //     if (!flag && clickedNode.isSameNode(sele)) { // 进入编辑状态
      //       this.editNode(clickedNode)
      //     }
      //   })
      // }
    },
    fObjectRightClick (d, i, n) {
      if (this.status) {
        return false
      }
      const sele = document.getElementById('selectedNode')
      const edit = document.getElementById('editing')
      const clickedNode = n[i].parentNode
      if (clickedNode.isSameNode(edit)) { // 正在编辑
        return
      }
      if (!clickedNode.isSameNode(sele)) { // 选中
        this.selectNode(clickedNode)
      }
      // 显示右键菜单
      const svgPosition = this.mindmap_svg.node().getBoundingClientRect()
      this.contextMenuX = d3.event.pageX - svgPosition.x - window.scrollX
      this.contextMenuY = d3.event.pageY - svgPosition.y - window.scrollY
      this.showContextMenu = true
      this.clearSelection()
      setTimeout(() => { this.$refs.menu.focus() }, 300)
    },
    gBtnClick (a, i, n) { // 添加子节点
      if (this.status) {
        return false
      }
      if (a.data.children && a.data.children.length >= 10) {
        this.$message.error('已达规则条数上限')
        return false
      }
      let className = n[i].parentNode.getAttribute('class')
      let depth = +className.substring(6, 7)
      if (depth >= 9) {
        return false
      }
      if (a.data.form && a.data.form.nodeType === 'FZLD') {
        this.$message.error('控制力度无法添加子节点')
        return false
      }
      const newJSON = { name: '新建节点', children: [] }
      const d = d3.select(n[i].parentNode).data()[0]
      this.add(d.data, newJSON)
      this.mouseLeave(null, i, n)
      // this.editNew(newJSON, d.depth + 1, n[i].parentNode)
      // if (n[i].style.opacity === '1') {
      //   const newJSON = { name: '新建节点', children: [] }
      //   const d = d3.select(n[i].parentNode).data()[0]
      //   this.add(d.data, newJSON)
      //   this.mouseLeave(null, i, n)
      //   this.editNew(newJSON, d.depth + 1, n[i].parentNode)
      // }
    },
    delBtnClick (a, i, n) {
      if (this.status) {
        return false
      }
      let className = n[i].parentNode.getAttribute('class')
      let depth = +className.substring(6, 7)
      if (depth === 0) {
        this.$confirm('规则组一旦删除，当前页面规则将一同删除确定删除规则组？', '删除确认', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$emit('delRulesTree', this.treeId)
        }).catch(() => {
        })
        return false
      }
      this.$confirm('确定删除该节点?', '删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.del(n[i].parentNode.__data__.data)
        a.data.form = {}
      }).catch(() => {
      })
    },
    clickMenu (item) {
      this.showContextMenu = false
      this.removeSelectedNode()
      if (item.command === 0) { // 删除节点
        this.del(this.selectedElement.__data__.data)
      }
    },
    // 悬浮事件
    mouseLeave (d, i, n) {
      // if (n[i].className.baseVal.includes('gButton')) {
      //   d3.select(n[i]).style('opacity', 0)
      // } else {
      //   d3.selectAll('g.gButton').filter((a, b, c) => c[b].parentNode === n[i].parentNode).style('opacity', 0)
      // }
    },
    mouseEnter (d, i, n) {
      // if (n[i].className.baseVal.includes('gButton')) {
      //   d3.select(n[i]).style('opacity', 1)
      // } else {
      //   d3.selectAll('g.gButton').filter((a, b, c) => c[b].parentNode === n[i].parentNode).style('opacity', 1)
      // }
    },
    // 拖拽
    draggedNodeRenew (draggedNode, targetX, targetY, dura = 0) {
      const { link, xSpacing } = this
      const tran = d3.transition().duration(dura).ease(d3.easePoly)
      d3.select(draggedNode).transition(tran).attr('transform', `translate(${targetY},${targetX})`)
      // 更新draggedNode与父节点的path
      d3.select(draggedNode).each((d) => {
        d3.select(`path#path_${d.data.id}`).transition(tran).attr('d', `${link({
          source: [
            -targetY + (d.parent ? d.parent.data.size[1] : 0) - xSpacing,
            -targetX + (d.parent ? d.parent.data.size[0] / 2 : 0)
          ],
          target: [0, d.data.size[0] / 2]
        })}L${d.data.size[1] - xSpacing},${d.data.size[0] / 2}`)
      })
    },
    draggedNodeChildrenRenew (d, px, py) {
      const { draggedNodeChildrenRenew } = this
      d.px = px
      d.py = py
      if (d.children) {
        for (let index = 0; index < d.children.length; index += 1) {
          const dChild = d.children[index]
          draggedNodeChildrenRenew(dChild, px, py)
        }
      }
    },
    dragged (a, i, n) { // 拖拽中【待完善】
      const { draggedNodeChildrenRenew, draggedNodeRenew, mindmap_g, xSpacing } = this
      const draggedNode = n[i].parentNode
      const fObject = n[i]
      // 选中
      const sele = document.getElementById('selectedNode')
      if (sele && !sele.isSameNode(draggedNode)) {
        sele.removeAttribute('id')
      }
      // 拖拽
      // 相对a原本位置的偏移
      const py = d3.event.x - a.x // x轴偏移的量
      const px = d3.event.y - a.y // y轴偏移的量
      draggedNodeChildrenRenew(a, px, py)
      // 相对a.parent位置的坐标
      let targetY = a.dy + py// x轴坐标
      let targetX = a.dx + px// y轴坐标
      draggedNodeRenew(draggedNode, targetX, targetY)
      // foreignObject偏移
      targetY += parseInt(fObject.getAttribute('x'), 10)
      targetX += parseInt(fObject.getAttribute('y'), 10)

      // 计算others相对a.parent位置的坐标
      mindmap_g.selectAll('g.node')
        .filter((d, i, n) => !draggedNode.isSameNode(n[i]) && !draggedNode.parentNode.isSameNode(n[i]))
        .each((d, i, n) => {
          const gNode = n[i]
          const gRect = gNode.getElementsByTagName('foreignObject')[0]
          const rect = { // 其他gRect相对a.parent的坐标，以及gRect的宽高
            y: parseInt(gRect.getAttribute('x'), 10) + // foreignObject的x轴偏移
              d.y + (d.py ? d.py : 0) - (a.parent ? a.parent.y : 0),
            x: parseInt(gRect.getAttribute('y'), 10) + // foreignObject的y轴偏移
              d.x + (d.px ? d.px : 0) - (a.parent ? a.parent.x : 0),
            width: d.size[1] - xSpacing,
            height: d.size[0]
          }
          // 重叠触发矩形边框
          if ((targetY > rect.y) && (targetY < rect.y + rect.width) &&
          (targetX > rect.x) && (targetX < rect.x + rect.height)) {
            gNode.setAttribute('id', 'newParentNode')
          } else if (gNode.getAttribute('id') === 'newParentNode') {
            gNode.removeAttribute('id')
          }
        })
    },
    dragback (subject, draggedNode) {
      const { draggedNodeChildrenRenew, draggedNodeRenew } = this
      draggedNodeChildrenRenew(subject, 0, 0)
      draggedNodeRenew(draggedNode, subject.dx, subject.dy, 1000)
    },
    dragended (d, i, n) {
      const { dragback, root } = this
      const { subject } = d3.event
      const draggedNode = n[i].parentNode
      let draggedParentNode = draggedNode.parentNode
      if (draggedParentNode.isEqualNode(this.$refs.content)) { // 拖拽的是根节点时复原
        dragback(subject, draggedNode)
        return
      }
      const newParentNode = document.getElementById('newParentNode')
      if (newParentNode) { // 建立新的父子关系
        newParentNode.removeAttribute('id')
        d3.select(draggedNode).each((draggedD) => {
          d3.select(newParentNode).each((newParentD) => {
            // 处理数据
            draggedNode.remove()
            this.del(draggedD.data)
            this.add(newParentD.data, draggedD.data)
          })
        })
        return
      }
      if (Math.abs(subject.px) < root.nodeHeight) { // 平移距离不足以调换兄弟节点顺序时复原
        dragback(subject, draggedNode)
        return
      }
      // 调换兄弟节点顺序
      draggedParentNode = d3.select(draggedParentNode)
      draggedParentNode.each((d) => {
        const draggedBrotherNodes = draggedParentNode.selectAll(`g.depth_${d.depth + 1}`).filter((a, i, n) => !draggedNode.isSameNode(n[i]))
        if (!draggedBrotherNodes.nodes()[0]) { // 无兄弟节点时复原
          dragback(subject, draggedNode)
          return
        }
        const a = { x0: Infinity, x1: -Infinity }
        draggedBrotherNodes.each((b, i, n) => {
          if (b.x > subject.x && b.x > a.x1 && b.x < (subject.x + subject.px)) { // 新哥哥节点
            a.x1 = b.x
            a.b1 = b.data
            a.n1 = n[i]
          }
          if (b.x < subject.x && b.x < a.x0 && b.x > (subject.x + subject.px)) { // 新弟弟节点
            a.x0 = b.x
            a.b0 = b.data
            a.n0 = n[i]
          }
        })
        if (a.b0 || a.b1) { // 存在新兄弟节点时调换节点顺序
          this.del(subject.data)
          if (a.b0) { // 插入在兄弟节点前面
            this.insert(a.b0, subject.data)
            draggedNode.parentNode.insertBefore(draggedNode, a.n0)
          } else if (a.b1) { // 插入在兄弟节点后面
            this.insert(a.b1, subject.data, 1)
            draggedNode.parentNode.insertBefore(draggedNode, a.n1.nextSibling)
          }
        } else {
          dragback(subject, draggedNode)
        }
      })
    },
    // 绘制
    async updateMindmap () {
      await this.tree()
      await this.getDTop()
      await this.draw()
      await this.initNodeEvent()
      await this.initStyle()
    },
    initStyle () {
      let gnode = d3.selectAll('g')
      gnode.each((d, i, n) => {
        if (n[i].id !== 'content' && n[i].childElementCount !== 2) {
          const node = d3.select(n[i])
          if (d.depth > 1) {
            if (d.data.form && (d.data.form.nodeType === 'FZLD' || d.data.form.nodeType === 'BL')) {
              node.select('foreignObject').attr('class', 'depth1')
            } else if (d.data.form && d.data.form.nodeType === 'TJ') {
              node.select('foreignObject').attr('class', 'depth2')
            } else {
              node.select('foreignObject').attr('class', '')
            }
          } else {
            if (d.depth === 0) {
              node.select('foreignObject').attr('class', 'depth0')
            } else {
              if (d.data.form) {
                node.selectAll('foreignObject').attr('class', 'depth1')
              } else {
                node.select('foreignObject').attr('class', '')
              }
            }
          }
        }
      })
    },
    gClass (d) { return `depth_${d.depth} node` },
    gTransform (d) { return `translate(${d.dy + 80},${d.dx})` },
    foreignY (d) {
      return -d.data.size[0] / 2 + 3
    },
    gBtnTransform (d) { return `translate(${d.data.size[1] - this.xSpacing + 17},${d.data.size[0] / 2 - (d.data.id === '0' ? 9 : 10)})` },
    delBtnTransform (d) { return `translate(${-35},${d.data.size[0] / 2 - (d.data.id === '0' ? 9 : 10)})` },
    pathId (d) { return `path_${d.data.id}` },
    pathClass (d) { return `depth_${d.depth}` },
    pathColor (d) { return d.data.color },
    path (d) {
      return `${
        this.link({
          source: [
            (d.parent ? d.parent.y + d.parent.data.size[1] : 0) - d.y - this.xSpacing - 40, // 横坐标
            (d.parent ? d.parent.x + d.parent.data.size[0] / 2 - 5 : -5) - d.x// 纵坐标
          ],
          target: [-50, d.data.size[0] / 2 - 5]
        })
      }L${-this.xSpacing + (this.xSpacing - 30)},${d.data.size[0] / 2 - 5}`
    },
    nest (d, i, n) {
      const dd = d.children
      if (dd) {
        d3.select(n[i]).selectAll(`g${dd[0] ? `.depth_${dd[0].depth}.node` : ''}`)
          .data(dd)
          .join(
            (enter) => this.appendNode(enter),
            (update) => this.updateNode(update),
            (exit) => this.exitNode(exit)
          )
      }
    },
    appendNode (enter) {
      let className = enter._parents[0].getAttribute('class')
      let depth = ''
      if (className) {
        depth = +className.substring(6, 7)
      } else {
        depth = -1
      }
      const {
        gClass, gTransform, updateNodeName, divKeyDown, foreignY, gBtnTransform, delBtnTransform,
        pathId, pathClass, path, nest, fdivMouseDown
      } = this
      const gNode = enter.append('g')
      let foreign = null
      if (depth < 0) {
        foreign = gNode.append('foreignObject').attr('x', -5).attr('y', foreignY).attr('class', 'depth' + (depth + 1))
      } else {
        foreign = gNode.append('foreignObject').attr('x', -5).attr('y', foreignY)
      }
      const foreignDiv = foreign.append('xhtml:div').attr('class', 'textDiv').text((d) => d.data.name)
      foreignDiv.on('blur', updateNodeName).on('keydown', divKeyDown).on('mousedown', fdivMouseDown)
      gNode.attr('class', gClass).attr('transform', gTransform)
      const gBtn = gNode.append('g').attr('class', 'gButton').attr('transform', gBtnTransform)
      // gBtn.append('rect').attr('r', 8).attr('stroke', '#000').attr('fill', '#fff').attr('cx', 16).attr('cy', 4)
      // if (depth < 0) {
      //   gBtn.append('rect').attr('width', 26).attr('height', 28).attr('fill', 'rgb(231, 243, 255)').attr('transform', 'translate(-3, -8)').attr('rx', 5).attr('ry', 5)
      // } else {
      // }
      if (depth < 8) {
        gBtn.append('rect').attr('width', 24).attr('height', 24).attr('fill', '#6257CD').attr('transform', 'translate(5, -8)').attr('rx', 5).attr('ry', 5)
        gBtn.append('path').attr('d', 'M19,13 H15V17 H13V13 H9V11 H13V7 H15V11 H19V13 Z').attr('transform', 'translate(3, -8)')
      }
      // 删除按钮
      const delBtn = gNode.append('g').attr('class', 'delButton').attr('transform', delBtnTransform)
      // gBtn.append('rect').attr('r', 8).attr('stroke', '#000').attr('fill', '#fff').attr('cx', 16).attr('cy', 4)
      // delBtn.append('rect').attr('width', 26).attr('height', 28).attr('fill', '#fff').attr('transform', 'translate(-3, -8)').attr('rx', 5).attr('ry', 5)
      // if (depth < 0) {
      //   delBtn.append('rect').attr('width', 26).attr('height', 28).attr('fill', 'rgb(231, 243, 255)').attr('transform', 'translate(-3, -8)').attr('rx', 5).attr('ry', 5)
      // } else {
      // }
      // if (depth >= 0) {
      delBtn.append('rect').attr('width', 24).attr('height', 24).attr('fill', '#6257CD').attr('transform', 'translate(-3, -8)').attr('rx', 5).attr('ry', 5)
      delBtn.append('path').attr('d', 'M15,13 H7V12 H15V13 Z').attr('stroke', '#fff').attr('transform', 'translate(-2, -8)')
      // }
      foreignDiv.each((d, i, n) => {
        const observer = new ResizeObserver((l) => {
          const t = l[0].target
          const b1 = getComputedStyle(t).borderTopWidth
          const b2 = getComputedStyle(t.parentNode).borderTopWidth
          let spacing = parseInt(b1, 10) + parseInt(b2, 10)
          spacing = spacing || 0
          foreign.filter((d, index) => i === index)
            .attr('width', l[0].contentRect.width + spacing * 2 + 16)// div和foreign border
            .attr('height', l[0].contentRect.height + spacing * 2)
        })
        observer.observe(n[i])
      })
      const enterData = enter.data()
      if (enterData.length) {
        if (enterData[0].data.id !== '0') {
          gNode.append('path')
            .attr('id', pathId)
            .attr('class', pathClass)
            .lower()
            .attr('stroke', '#6257CD')
            .attr('d', path)
        } else if (enterData[0].data.id === '0') { // 根节点
          foreign.attr('y', (d) => foreignY(d) + d.size[0] / 2 - 10)
          this.makeCenter()
        }
        gNode.each(nest)
      }
      gBtn.raise()
      delBtn.raise()
      foreign.raise()
      return gNode
    },
    updateNode (update) {
      const {
        gClass, gTransform, easePolyInOut, foreignY, gBtnTransform, delBtnTransform, pathId, pathClass, path, nest
      } = this
      update.interrupt().selectAll('*').interrupt()
      update.attr('class', gClass)
        .transition(easePolyInOut)
        .attr('transform', gTransform)
      update.each((d, i, n) => {
        const node = d3.select(n[i])
        const foreign = node.selectAll('foreignObject')
          .filter((d, i, n) => n[i].parentNode === node.node())
          .data((d) => [d]) // must rebind the children using selection.data to give them the new data.
          .attr('y', d.data.id !== '0' ? (foreignY(d)) : (foreignY(d) + d.size[0] / 2 - 10))
        // let cName = n[i].getAttribute('class')
        if (d.depth > 1) {
          if (d.data.form && (d.data.form.nodeType === 'FZLD' || d.data.form.nodeType === 'BL')) {
            // d3.select(n[i].childNodes[n[i].childNodes.length - 1]).select('rect').attr('fill', '#FFF8F3')
            // d3.select(n[i].childNodes[n[i].childNodes.length - 2]).select('rect').attr('fill', '#FFF8F3')
            node.select('foreignObject').attr('class', 'depth1')
          } else if (d.data.form && d.data.form.nodeType === 'TJ') {
            // d3.select(n[i].childNodes[n[i].childNodes.length - 1]).select('rect').attr('fill', '#F4FFF6')
            // d3.select(n[i].childNodes[n[i].childNodes.length - 2]).select('rect').attr('fill', '#F4FFF6')
            node.select('foreignObject').attr('class', 'depth2')
          } else {
            node.select('foreignObject').attr('class', '')
          }
        } else {
          if (d.depth === 0) {
            // d3.select(n[i].childNodes[n[i].childNodes.length - 1]).select('rect').attr('fill', '#E7F3FF')
            // d3.select(n[i].childNodes[n[i].childNodes.length - 2]).select('rect').attr('fill', '#E7F3FF')
            node.select('foreignObject').attr('class', 'depth0')
          } else {
            if (d.data.form) {
              // d3.select(n[i].childNodes[n[i].childNodes.length - 1]).select('rect').attr('fill', '#FFF8F3')
              // d3.select(n[i].childNodes[n[i].childNodes.length - 2]).select('rect').attr('fill', '#FFF8F3')
              node.selectAll('foreignObject').attr('class', 'depth1')
            } else {
              node.select('foreignObject').attr('class', '')
            }
          }
        }
        foreign.select('div').text(d.data.name)
        node.select('path')
          .filter((d, i, n) => n[i].parentNode === node.node())
          .attr('id', pathId(d))
          .attr('class', pathClass(d))
          .attr('stroke', '#6257CD')
          .transition(easePolyInOut)
          .attr('d', path(d))

        node.each(nest)

        node.selectAll('g.gButton')
          .filter((d, i, n) => n[i].parentNode === node.node())
          .attr('transform', gBtnTransform(d))
          .raise()
        node.selectAll('g.delButton')
          .filter((d, i, n) => n[i].parentNode === node.node())
          .attr('transform', delBtnTransform(d))
          .raise()
      })
      return update
    },
    exitNode (exit) {
      exit.filter((d, i, n) => n[i].classList[0] !== 'gButton' && n[i].classList[0] !== 'delButton').remove()
    },
    draw () { // 生成svg
      const { mindmap_g, appendNode, updateNode, exitNode } = this
      const d = [ this.root ]
      mindmap_g.selectAll(`g${d[0] ? `.depth_${d[0].depth}.node` : ''}`)
        .data(d)
        .join(
          (enter) => appendNode(enter),
          (update) => updateNode(update),
          (exit) => exitNode(exit)
        )
    },
    tree () { // 数据处理
      const { mmdata, ySpacing } = this
      const layout = flextree({ spacing: ySpacing })
      const t = layout.hierarchy(mmdata.data[0])
      layout(t)
      this.root = t
      this.root.each((a) => { // x纵轴 y横轴
        // 相对偏移
        a.dx = a.x - (a.parent ? a.parent.x : 0)
        a.dy = a.y - (a.parent ? a.parent.y : 0)

        if (!a.children) { a.children = [] }
      })
    },
    // 获取Y轴最高的节点Y轴数据
    getDTop () {
      let t = this.root
      while (t.children[0]) { t = t.children[0] }
      this.dTop = t
    },
    getTextSize (t) {
      const { dummy, xSpacing } = this
      let textWidth = 0
      let textHeight = 0
      dummy.selectAll('.dummyText')
        .data([t.name])
        .enter()
        .append('div')
        .text((d) => d)
        .each((d, i, n) => {
          textWidth = n[i].offsetWidth
          textHeight = n[i].offsetHeight
          n[i].remove() // remove them just after displaying them
        })
      t.size = [textHeight, textWidth + xSpacing]
      // t.firstNode = form.firstNode
      // t.secondNode = form.secondNode
      // t.otherNode = form.otherNode
      // t.form = form.form
    },
    // 清除右键触发的选中单词
    clearSelection () {
      if (document.selection && document.selection.empty) {
        document.selection.empty()
      } else if (window.getSelection) {
        const sel = window.getSelection()
        sel.removeAllRanges()
      }
    },
    depthTraverse2 (d, func) { // 深度遍历，func每个元素
      for (let index = 0; index < d.length; index++) {
        const dChild = d[index]
        func(dChild)
        if (dChild.children) { this.depthTraverse2(dChild.children, func) }
      }
    },
    addWatch () {
      this.$watch('value', (newVal) => {
        if (this.toUpdate) {
          this.mmdata = new JSONData(newVal)
          this.depthTraverse2(this.mmdata.data, this.getTextSize)
        } else {
          this.toUpdate = true
        }
      }, {
        immediate: true,
        deep: true
      })
    },
    varLibraryChange (value) {
      // 根据value调用接口 获取变量组列表
      this.varGroupList = [
        { label: '变量组一', id: 1 },
        { label: '变量组二', id: 2 },
        { label: '变量组三', id: 3 }
      ]
    },
    varGroupChange (value) {
      // 根据value调用接口 获取变量组列表
      this.variableList = [
        { label: '选择变量一', id: 1 },
        { label: '选择变量二', id: 2 },
        { label: '选择变量三', id: 3 }
      ]
    },
    findVariableLabel () {
      for (let i in this.variableList) {
        if (this.variableList[i].id === this.form.variable) {
          return this.variableList[i].label
        }
      }
    },
    findConditionLabel () {
      for (let i in this.conditionList) {
        if (this.conditionList[i].value === this.form.condition) {
          return this.conditionList[i].label
        }
      }
    },
    findIntensityLabel () {
      for (let i in this.intensityList) {
        if (this.intensityList[i].id === this.form.resultsValue) {
          return this.intensityList[i].label
        }
      }
    }
  },
  async mounted () {
    await this.init()
    // this.mindmap_svg.on('mousedown', this.rightDragStart)
    // this.mindmap_svg.on('mousemove', this.rightDrag)
    // this.mindmap_svg.on('mouseup', this.rightDragEnd)
    await this.addWatch()
    await this.makeCenter()
    // await this.fitContent()
    this.mindmap_g.style('opacity', 1)
  }
}
</script>

<style lang="less">
  @import '../assets/css/MindMap.less';
  .demo-drawer__content {
    /*padding: 10px;*/
    .demo-drawer__footer {
      text-align: right;
      margin-right: 20px;
    }
    .el-form {
      .el-select {
        width: 100%;
      }
    }
  }
  .depth0 {
    background-color: rgb(231, 243, 255) !important;
    /*border-color: #1188FF !important;*/
    .textDiv {
      background-color: rgb(231, 243, 255) !important;
      border-color: #1188FF !important;
    }
  }
  .depth1 {
    background-color: rgba(255,248,243,1) !important;
    /*border-color: #F9782C !important;*/
    .textDiv {
      background-color: rgba(255,248,243,1) !important;
      border-color: #F9782C !important;
    }
  }
  .depth2 {
    background-color: rgba(244,255,246,1) !important;
    /*border-color: #139C43 !important;*/
    .textDiv {
      background-color: rgba(244,255,246,1) !important;
      border-color: #139C43 !important;
    }
  }
</style>
