<template>
  <default-layout>
    <template slot="btn-inner">
      <el-button type="success" class="iconfont icon-xinzeng" @click="dialog.add = true"> 新增模型</el-button>
    </template>
    <div style="padding-top: 50px;">
      <p class="list-title">风控模型列表</p>
      <div class="section-plain section-plain-card section-plain-card-tag">
        <div class="section-block" v-for="item in sectionList" :key="item.id" @click="toDetail(item)">
          <div class="block-header">
            <img class="right" src="../../assets/images/right.png" alt="">
            <span class="status">{{item.status}}</span>
            <div style="float: right;">
              <img src="../../assets/images/right-arrow.png" style="width: 26px;height: 26px;" alt="">
            </div>
          </div>
          <p class="block-title">{{item.title}}</p>
          <div class="block-tag">
            <div class="label item-label">变量库：</div>
            <div class="tag-list">
              <el-tag
                size="small"
                v-for="(itemTag, index) in item.items"
                :key="index"
                type="info"
                style="margin-bottom: 7px;margin-right: 4px;color: #323233;">
                {{ itemTag.label }}
              </el-tag>
            </div>
          </div>
          <div class="block-footer">
            <span class="item-label">创建于：</span><span>{{item.createdBy}}</span>
          </div>
        </div>
      </div>
    </div>
    <el-dialog title="新建模型" :visible.sync="dialog.add" :close-on-click-modal="false" class="middle-dialog">
      <div class="form-area">
        <div class="form-inner">
          <el-form ref="form" :model="modelForm" :rules="modelRules" label-width="120px" label-position="left">
            <el-form-item prop="modelName" label="模型名称：">
              <el-input v-model="modelForm.modelName"></el-input>
            </el-form-item>
            <el-form-item prop="modelVar" label="模型变量：">
              <el-select v-model="modelForm.modelVar" :multiple-limit="5" :clearable="false" multiple placeholder="请选择">
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
        <el-button @click="cancelAdd">取 消</el-button>
        <el-button type="primary" @click="confirmAdd">确 定</el-button>
      </div>
    </el-dialog>
  </default-layout>
</template>
<script>
export default {
  data () {
    return {
      sectionList: [
        {
          id: 1,
          title: '次级标题/项目名称/产品名称名称名称名称名',
          status: '启用中',
          items: [
            { label: '标签一标签一标签一标签一标签一标签一标签' },
            { label: '标签一标签一标签一标签一标签一标签一标签' },
            { label: '标签一标签一标签一标签一标签一标签一标签' },
            { label: '标签一标签一标签一标签一标签一标签一标签' },
            { label: '标签一标签一标签一标签一标签一标签一标签' }
          ],
          createdBy: '2020-06-18 13:56:59'
        },
        {
          id: 2,
          title: '次级标题/项目名称/产品名称',
          status: '启用中',
          items: [
            { label: '标签一标签一标签一标签一标签一标签一标签' },
            { label: '标签一标签一标签一标签一标签一标签一标签' },
            { label: '标签一标签一标签一标签一标签一标签一标签' },
            { label: '标签一标签一标签一标签一标签一标签一标签' }
          ],
          createdBy: '2020-06-18 13:56:59'
        },
        {
          id: 3,
          title: '次级标题/项目名称/产品名称',
          status: '启用中',
          items: [
            { type: '', label: '标签一' }
          ],
          createdBy: '2020-06-18 13:56:59'
        },
        {
          id: 4,
          title: '次级标题/项目名称/产品名称',
          status: '启用中',
          items: [
            { type: '', label: '标签一' },
            { type: 'success', label: '标签二' }
          ],
          createdBy: '2020-06-18 13:56:59'
        }
      ],
      dialog: {
        add: false
      },
      options1: [{
        value: '选项1',
        label: '黄金糕'
      }, {
        value: '选项2',
        label: '双皮奶',
        disabled: false
      }, {
        value: '选项3',
        label: '蚵仔煎',
        disabled: false
      }, {
        value: '选项4',
        label: '龙须面'
      }, {
        value: '选项5',
        label: '北京烤鸭'
      }, {
        value: '选项6',
        label: '北京烤鸭1'
      }],
      modelForm: {
        modelName: '',
        modelVar: []
      },
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
      }
    }
  },
  created () {},
  methods: {
    toDetail () {
      this.$router.push({name: 'modelDetail'})
    },
    cancelAdd () {
      this.$refs['form'].resetFields()
      this.$refs['form'].clearValidate()
      this.dialog.add = false
    },
    confirmAdd () {
      this.$refs['form'].validate(valid => {
        if (valid) {
          let item = []
          for (let i in this.modelForm.modelVar) {
            for (let j in this.options1) {
              if (this.modelForm.modelVar[i] === this.options1[j].value) {
                item.push({label: this.options1[j].label})
              }
            }
          }
          this.sectionList.push({
            id: 5,
            title: this.modelForm.modelName,
            status: '启用中',
            items: item,
            createdBy: '2020-06-18 13:56:59'
          })
          this.dialog.add = false
        }
      })
    }
  }
}
</script>
<style scoped lang="less">
  .list-title {
    font-size: 18px;
    font-weight: 600;
    padding-left: 58px;
    font-family: "PingFangSC-Semibold";
    margin-bottom: 12px;
    color: #323233;
  }
  .section-plain {
    padding: 0 50px 20px;
    display: flex;
    flex-flow: row wrap;
    justify-content: flex-start;
  }
  .section-plain-card {
    .item-label {
      color: #969799;
    }
    .section-block {
      min-width: 340px;
      background-color: #ffffff;
      border-radius:4px;
      border:1px solid rgba(215,230,245,1);
      padding: 20px;
      flex-grow: 1;
      margin-right: 8px;
      margin-left: 8px;
      cursor: pointer;
      &:hover {
        box-shadow: 0px 20px 40px -20px rgba(64, 88, 142, 0.32);
      }
      .block-header {
        margin: 0px auto 20px;
        height: 30px;
        line-height: 30px;
        .right {
          width: 16px;
          height: 16px;
          vertical-align: middle;
        }
        .status {
          font-size: 12px;
          vertical-align: middle;
        }
      }
      .block-tag {
        display: flex;
        flex-flow: row nowrap;
        justify-content: flex-start;
        height: 155px;
        .label {
          font-size: 12px;
          flex-basis: 50px;
          flex-grow: 0;
          flex-shrink: 0;
        }
        .tag-list {
          flex-grow: 1;
          .el-tag.el-tag--info {
            border-color: transparent;
          }
        }
      }
      .block-title {
        font-size: 16px;
        font-weight: 500;
        font-family: "PingFang SC";
        margin-bottom: 18px;
        color: #323233;
      }
      .block-footer {
        margin-top: 18px;
      }
    }
  }
</style>
