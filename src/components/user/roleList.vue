<style lang="less">
  .ivu-tree li ul {
    padding: 0 0 0 60px;
  }

  .ivu-layout-content .ivu-input-group-small .ivu-input {
    height: 25px;
  }
</style>
<template>
  <div class="content">
    <Breadcrumb :style="{margin: '15px 0'}">
      <BreadcrumbItem>系统管理</BreadcrumbItem>
      <BreadcrumbItem>角色列表</BreadcrumbItem>
    </Breadcrumb>
    <Content :style="{padding: '16px', minHeight: '701px', background: '#fff',overflow:'hidden'}">
      <Row style="margin-bottom: 15px">
        <Col span="24">
          <Button type="primary" size="small" icon="ios-add" @click="addRole()">新增角色</Button>
        </Col>
      </Row>
      <Table :loading="loading" border ref="selection"
             :columns="columns1" height="592"
             :data="data1" size="small"></Table>

      <div style="width: 100%;text-align: center;margin-top: 15px">
        <Page @on-change="paging" :total="total" :page-size="14" show-elevator show-total/>
      </div>
    </Content>


    <Modal v-model="addAccount" width="300">
      <p slot="header">
        <Icon type="ios-information-circle"></Icon>
        <span>{{id===''?'添加':'修改'}}角色</span>
      </p>
      <div>
        <Spin size="large" fix v-if="spinShow"></Spin>
        <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="70">
          <FormItem label="角色名称" prop="roleName">
            <Input :maxlength="10" v-model="formValidate.roleName" placeholder="请输入角色名称"></Input>
          </FormItem>
          <FormItem label="角色编号" prop="roleCode">
            <Input :disabled="id!==''?true:false" :maxlength="10" v-model="formValidate.roleCode"
                   placeholder="请输入角色编号"></Input>
          </FormItem>
          <FormItem label="角色说明" prop="remark">
            <Input type="textarea" :maxlength="50" v-model="formValidate.remark" placeholder="请输入角色说明"></Input>
          </FormItem>
          <FormItem :label-width="100" label="供应商是否专属" prop="supplierExclusive">
            <i-switch :disabled="id!==''?true:false" v-model="formValidate.supplierExclusive">
              <span slot="open">是</span>
              <span slot="close">否</span>
            </i-switch>
          </FormItem>
          <FormItem label="关联菜单" prop="menuIds">
            <Card>
              <Tree @on-check-change="checkTree" ref="tree" :data="roleTree" show-checkbox></Tree>
            </Card>
          </FormItem>
        </Form>
      </div>
      <div slot="footer">
        <Button type="success" size="large" long :loading="modal_loading" @click="handleSubmit('formValidate')">
          {{id===''?'添加':'修改'}}
        </Button>
      </div>
    </Modal>

  </div>
</template>
<script>
  export default {
    data() {
      // 角色名称验证
      const roleName = (rule, value, callback) => {
        const _this = this;
        if (value.length < 1) {
          callback(new Error('请选择角色'))
        } else {
          _this.Axios.get('/Manage/Role/checkRoleName', {
            params: {
              id: _this.id !== '' ? _this.id : '',
              roleName: value //角色名
            }
          }).then(res => {
            if (res.data.code === 0) {
              callback()
            } else {
              callback(new Error(res.data.message))
            }
          })
        }
      };
      // 角色编号验证
      const roleCode = (rule, value, callback) => {
        const _this = this;
        if (value.length < 1) {
          callback(new Error('请选择角色'))
        } else {
          _this.Axios.get('/Manage/Role/checkRoleCode', {
            params: {
              id: _this.id !== '' ? _this.id : '',
              roleCode: value //角色名
            }
          }).then(res => {
            if (res.data.code === 0) {
              callback()
            } else {
              callback(new Error(res.data.message))
            }
          })
        }
      };
      // 角色菜单验证
      const roleMenu = (rule, value, callback) => {
        if (this.cheTree.length < 1) {
          callback(new Error('请关联菜单'))
        } else {
          callback()
        }
      };
      return {
        spinShow: false,
        roleTree: [],
        cheTree: [],
        formValidate: {
          roleName: '',       //角色名称，
          roleCode: '',        //角色编号，
          remark: '',           //角色说明
          supplierExclusive: false,  //是否供应商专属,
          menuIds: false,
        },
        ruleValidate: {
          roleName: [
            {validator: roleName, required: true, trigger: 'blur'}
          ],
          roleCode: [
            {validator: roleCode, required: true, trigger: 'blur'}
          ],
          menuIds: [
            {validator: roleMenu, required: true, trigger: 'change'}
          ],
        },
        id: '',
        addAccount: false,
        total: 0,
        loading: false,
        modal_loading: false,
        columns1: [
          {
            type: 'index',
            width: 50,
            align: 'center'
          },
          {
            title: '角色名称',
            key: 'roleName',
          },
          {
            title: '角色备注',
            key: 'remark',
          },
          {
            title: '供应商是否专属',
            key: 'status',
            render: (h, params) => {
              return h('p', params.row.supplierExclusive === true ? '是' : '否')
            }
          },
          {
            title: '最后修改时间',
            key: 'timeModified',
            render: (h, params) => {
              return h('p', this.GetLocalTime(params.row.timeModified))
            }
          },
          {
            title: '操作',
            align: 'center',
            minWidth: 55,
            maxWidth: 90,
            render: (h, params) => {
              return h('div', [
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
                      const _this = this;
                      _this.spinShow = true;
                      _this.addAccount = true;
                      _this.id = params.row.id;
                      _this.handleReset('formValidate');
                      _this.formValidate.remark = params.row.remark;
                      _this.formValidate.roleName = params.row.roleName;
                      _this.formValidate.roleCode = params.row.roleCode;
                      _this.formValidate.supplierExclusive = params.row.supplierExclusive;
                      _this.Axios.get('/Manage/Role/getRole', {
                        params: {
                          id: params.row.id
                        }
                      }).then(res => {
                        if (res.data.code === 0) {
                          let menu = res.data.data.menuTreeList,
                            menuList = [];
                          for (let i = 0; i < menu.length; i++) {
                            menu[i].expand = menu[i].checked === true ? true : false;
                            menu[i].checked = false;
                            menuList.push(menu[i])
                          }
                          _this.roleTree = menuList;
                          setTimeout(() => {
                            _this.cheTree = _this.$refs.tree.getCheckedNodes()
                          }, 1)
                        } else {
                          _this.$Message.error(res.data.message)
                        }
                        _this.spinShow = false;
                      })
                    }
                  }
                }),
                h('Poptip', {
                  props: {
                    confirm: true,
                    transfer: true,
                    placement: "top-end",
                    offset: 13,
                    title: '确定删除该角色？',
                  },
                  on: {
                    'on-ok': () => {
                      const _this = this;
                      _this.Axios.post('/Manage/Role/deleteRole', _this.Qs.stringify({
                        ids: [params.row.id]
                      }, {indices: false})).then(res => {
                        if (res.data.code === 0) {
                          _this.getTreeList();
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
        data1: [],
        like: '',
      }
    },
    methods: {
      // 获取角色列表
      getTreeList() {
        const _this = this;
        _this.loading = true;
        _this.Axios.get('/Manage/Role/pageList', {
          params: {
            start: _this.start,
            size: 14,
            roleNameLike: '',
          }
        }).then(res => {
          if (res.data.code === 0) {
            _this.data1 = res.data.data.content
          } else {
            _this.$Message.error(res.data.message)
          }
          _this.loading = false;
          _this.total = res.data.data.totalElements;
        })
      },

      // 获取选中半选中树形结构
      checkTree(i) {
        this.cheTree = this.$refs.tree.getCheckedAndIndeterminateNodes();
      },

      // 新增角色
      addRole() {
        this.getTree();
        this.id = '';
        this.handleReset('formValidate')
        this.addAccount = true
      },

      // 角色分页
      paging(i) {
        this.start = i - 1;
        this.getTreeList();
      },

      // 添加角色
      handleSubmit(name) {
        const _this = this;
        _this.$refs[name].validate((valid) => {
          if (valid) {
            _this.modal_loading = true;
            const menuIds = [];
            for (let i in _this.cheTree) {
              menuIds.push(_this.cheTree[i].id)
            }
            if (_this.id === '') {
              _this.Axios.post('/Manage/Role/addRole', _this.Qs.stringify({
                roleName: _this.formValidate.roleName,        //角色名称
                roleCode: _this.formValidate.roleCode,        //角色编号
                remark: _this.formValidate.remark,            //备注
                menuIds: menuIds,             //菜单id集合
                supplierExclusive: _this.formValidate.supplierExclusive,   //是否供应商专属 true为是 需要传
              }, {indices: false})).then(res => {
                if (res.data.code === 0) {
                  _this.addAccount = false;
                  _this.getTreeList();
                  _this.$Message.success('添加成功')
                } else {
                  _this.$Message.error(res.data.message)
                }
                _this.modal_loading = false;
              })
            } else {
              _this.Axios.post('/Manage/Role/updateRole', _this.Qs.stringify({
                id: _this.id,
                roleName: _this.formValidate.roleName,        //角色名称
                roleCode: _this.formValidate.roleCode,        //角色编号
                remark: _this.formValidate.remark,            //备注
                menuIds: menuIds,                             //菜单id集合
                supplierExclusive: _this.formValidate.supplierExclusive,   //是否供应商专属 true为是 需要传
              }, {indices: false})).then(res => {
                if (res.data.code === 0) {
                  _this.addAccount = false;
                  _this.getTreeList();
                  _this.$Message.success('修改成功')
                } else {
                  _this.$Message.error(res.data.message)
                }
                _this.modal_loading = false;
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

      // 获取菜单树形结构
      getTree() {
        const _this = this;
        _this.Axios.get('/Manage/Menu/tree').then(res => {
          _this.roleTree = res.data.data;
        })
      }
    },
    mounted() {
      this.getTreeList()
      this.getTree()
    }
  }
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
</style>
