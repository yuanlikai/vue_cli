<style lang="less">
  .ivu-tree li ul {
    padding: 0 0 0 60px;
  }
</style>
<template>
  <div class="content">
    <Breadcrumb :style="{margin: '15px 0'}">
      <BreadcrumbItem>系统管理</BreadcrumbItem>
      <BreadcrumbItem>菜单管理</BreadcrumbItem>
    </Breadcrumb>
    <Content :style="{padding: '16px', minHeight: '701px', background: '#fff',overflow:'hidden'}">

      <Row style="margin-bottom: 15px">
        <Col span="24">
          <Button type="primary" size="small" icon="ios-add" @click="addMenu">新建模块</Button>
        </Col>
      </Row>
      <Table :columns="columns10" :data="menuData" size="small" border height="592" :loading="loading"></Table>
    </Content>
    <Modal v-model="addAccount" width="300">
      <p slot="header">
        <Icon type="ios-information-circle"></Icon>
        <span>{{module}} {{id===''?status+'模块':status+'菜单'}}</span>
      </p>
      <div>
        <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="70">
          <FormItem label="菜单名称" prop="menuName">
            <Input :maxlength="10" v-model="formValidate.menuName" placeholder="请输入菜单名称"></Input>
          </FormItem>
          <FormItem v-if="formValidate.menuUrl===''?(id!==''&&status!=='修改'):true" label="菜单路径" prop="menuUrl">
            <Input :maxlength="30" v-model="formValidate.menuUrl" placeholder="请输入菜单路径"></Input>
          </FormItem>
          <FormItem label="唯一标识" prop="numb">
            <Input :maxlength="10" v-model="formValidate.numb" placeholder="请输入唯一标识"></Input>
          </FormItem>
        </Form>
      </div>
      <div slot="footer">
        <Button type="success" size="large" long :loading="modal_loading" @click="handleSubmit('formValidate')">
          {{status}}
        </Button>
      </div>
    </Modal>

  </div>
</template>
<script>
  import expandRow from './menu-expand.vue';

  export default {
    components: {expandRow},
    data() {
      return {
        id: '',
        module: '',
        loading: true,
        modal_loading: false,
        addAccount: false,
        columns10: [
          {
            type: 'expand',
            width: 50,
            render: (h, params) => {
              return h(expandRow, {
                props: {
                  row: params.row.children,
                  getMenu: this.getMenu,
                  getChild: this.getChild,
                }
              })
            }
          },
          {
            title: '菜单名称',
            key: 'menuName'
          },
          {
            title: '菜单类型',
            key: 'numb',
            render: (h, params) => {
              return h('p', params.row.menuType.name)
            }
          },
          {
            title: '唯一标识',
            key: 'numb',
          },
          {
            title: '操作',
            width: 120,
            align: 'center',
            render: (h, params) => {
              return h('div', [
                h('Icon', {
                  props: {
                    type: 'md-add',
                    size: '20'
                  },
                  style: {
                    cursor: 'pointer',
                    marginRight: '5px'
                  },
                  on: {
                    click: () => {
                      this.status = '添加';
                      this.handleReset('formValidate');
                      this.addAccount = true;
                      this.id = params.row.id;
                      this.module = '《' + params.row.menuName + '》';
                    }
                  }
                }),
                h('Icon', {
                  props: {
                    type: 'ios-create',
                    size: '20'
                  },
                  style: {
                    cursor: 'pointer',
                    marginRight: '5px'
                  },
                  on: {
                    click: () => {
                      this.status = '修改';
                      this.addAccount = true;
                      this.id = params.row.id;
                      this.formValidate.menuUrl = '';
                      this.formValidate.numb = params.row.numb;
                      this.formValidate.menuName = params.row.menuName;
                      this.module = '《' + params.row.menuName + '》';
                    }
                  }
                }),
                h('Poptip', {
                  props: {
                    confirm: true,
                    transfer: true,
                    placement: "top-end",
                    offset: 13,
                    title: '确定删除该菜单？',
                  },
                  on: {
                    'on-ok': () => {
                      const _this = this;
                      _this.Axios.post('/Manage/Menu/deleteMenus', _this.Qs.stringify({
                        id: params.row.id
                      }, {indices: false})).then(res => {
                        if (res.data.code === 0) {
                          _this.getMenu();
                          _this.$Message.success('删除成功')
                        } else {
                          _this.$Message.error(res.data.message)
                        }
                      })
                    }
                  }
                }, [
                  h('Icon', {
                    props: {
                      type: 'md-trash',
                      size: '20'
                    },
                    style: {
                      cursor: 'pointer',
                    }
                  })
                ])
              ])
            }
          }
        ],
        menuData: [],

        formValidate: {
          menuName: '',       //角色名称
          menuUrl: '',       //角色名称
          numb: '',       //角色名称
        },
        ruleValidate: {
          menuName: [
            {required: true, message: '请输入名称', trigger: 'blur'}
          ],
          menuUrl: [
            {required: true, message: '请输入路径', trigger: 'blur'}
          ],
          numb: [
            {required: true, message: '请输入唯一标识', trigger: 'blur'}
          ]
        },
        status: ''
      }
    },
    methods: {

      // 子组件点击编辑事件
      getChild(i) {
        this.status = '修改';
        this.addAccount = true;
        this.id = i.id;
        this.formValidate.numb = i.numb;
        this.formValidate.menuUrl = i.menuUrl;
        this.formValidate.menuName = i.menuName;
        this.module = '《' + i.menuName + '》';
      },

      // 添加菜单
      addMenu() {
        this.id = '';
        this.status = '添加';
        this.handleReset('formValidate');
        this.formValidate.menuUrl = '';
        this.addAccount = true;
      },

      // 获取菜单列表
      getMenu() {
        const _this = this;
        _this.loading = true;
        _this.Axios.get('/Manage/Menu/tree').then(res => {
          if (res.data.code === 0) {
            _this.menuData = res.data.data.reverse();
          } else {
            _this.$Message.error(res.data.message)
          }
          _this.loading = false
        })
      },

      // 添加菜单
      handleSubmit(name) {
        const _this = this;
        _this.$refs[name].validate((valid) => {
          if (valid) {
            _this.modal_loading = true;
            if (_this.status === '修改') {
              _this.Axios.post('/Manage/Menu/updateMenu', _this.Qs.stringify({
                id: _this.id,  //上级id 如果为模块级 不需要传入
                menuName: _this.formValidate.menuName,  //菜单名称,
                menuUrl:_this.formValidate.menuUrl,
                numb: _this.formValidate.numb,  //前端用
              })).then(res => {
                if (res.data.code === 0) {
                  _this.getMenu();
                  _this.addAccount = false;
                } else {
                  _this.$Message.error(res.data.message)
                }
                _this.modal_loading = false
              })

            } else {
              _this.Axios.post('/Manage/Menu/addMenu', _this.Qs.stringify({
                parentId: _this.id !== '' ? this.id : '',  //上级id 如果为模块级 不需要传入
                menuName: _this.formValidate.menuName,  //菜单名称
                menuUrl: _this.formValidate.menuUrl,  //菜单路径
                numb: _this.formValidate.numb,  //前端用
              })).then(res => {
                if (res.data.code === 0) {
                  _this.getMenu();
                  _this.addAccount = false;
                } else {
                  _this.$Message.error(res.data.message)
                }
                _this.modal_loading = false
              })
            }
          } else {
            _this.$Message.error('有必填项未填写!');
          }
        })
      },
      handleReset(name) {
        this.$refs[name].resetFields();
      },
    },
    mounted() {
      this.getMenu()
    }
  }
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
</style>
