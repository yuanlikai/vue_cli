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
      <BreadcrumbItem>管理员管理</BreadcrumbItem>
      <BreadcrumbItem>管理员列表</BreadcrumbItem>
    </Breadcrumb>
    <Content :style="{padding: '16px', minHeight: '701px', background: '#fff',overflow:'hidden'}">
      <Row style="margin-bottom: 15px">
        <Col span="24">
          <Input v-model="searchInp" @on-enter="getSupplier" style="width: 250px;float: right;margin-top: -1px;"
                 size="small">
            <Select v-model="pre" slot="prepend" style="width: 60px">
              <Option value="0">名称</Option>
              <Option value="1">编号</Option>
            </Select>
            <Button @click="getSupplier" slot="append" icon="ios-search"></Button>
          </Input>
          <Select v-model="locked" @on-change="getSupplier" style="width:100px;float: right;margin-right: 20px"
                  size="small">
            <Option value="全部">全部</Option>
            <Option value="true">启用</Option>
            <Option value="false">锁定</Option>
          </Select>
          <span style="float: right;margin: 3px 4px 0 0">状态:</span>
          <!--<Select v-model="locked" @on-change="getSupplier()" style="width:100px;float: right;margin-right: 20px"-->
          <!--size="small">-->
          <!--<Option value="false">启用</Option>-->
          <!--<Option value="true">禁用</Option>-->
          <!--</Select>-->
          <!--<span style="float: right;margin: 3px 4px 0 0">状态:</span>-->
        </Col>
      </Row>
      <Table :loading="loading" border :columns="columns1" :data="data1" height="592" size="small"></Table>
      <div style="width: 100%;text-align: center;margin-top: 15px">
        <Page :total="total" :page-size="14" show-elevator show-total/>
      </div>
    </Content>
  </div>
</template>
<script>
  export default {
    data() {
      return {
        total: 0,
        pre: '0',
        locked: '全部',
        searchInp: '',
        loading: false,
        columns1: [
          {
            type: 'index',
            width: 50,
            align: 'center'
          },
          {
            title: '供应商名称',
            minWidth: 120,
            maxWidth: 200,
            tooltip: true,
            key: 'supplierName'
          },
          {
            title: '供应商编号',
            minWidth: 110,
            tooltip: true,
            align: 'center',
            maxWidth: 180,
            key: 'supplierNo'
          },

          {
            title: '地址',
            minWidth: 160,
            tooltip: true,
            key: 'fullAddress'
          },
          {
            title: '商品总数',
            tooltip: true,
            minWidth: 85,
            align: 'center',
            maxWidth: 150,
            key: 'spuInfoCount'
          },
          {
            title: '销售积分',
            minWidth: 85,
            align: 'center',
            maxWidth: 150,
            tooltip: true,
            key: 'saleCredit'
          },
          {
            title: '销售金额',
            minWidth: 85,
            align: 'center',
            maxWidth: 150,
            tooltip: true,
            key: 'salePrice'
          },
          {
            title: '启用',
            minWidth: 70,
            align: 'center',
            maxWidth: 150,
            key: 'locked',
            render: (h, params) => {
              return h('i-switch', {
                props: {
                  value: !params.row.locked,
                  disabled:params.row.oneself
                },
                on: {
                  'on-change': (i) => {
                    const _this = this;
                    _this.Axios.post('/Manage/Supplier/lockedById', _this.Qs.stringify({
                      id: params.row.id,
                      locked: i,
                    })).then(res => {
                      if (res.data.code === 0) {
                        _this.$Message.success('success');
                        if (i === false) {
                          _this.Axios.post('/Manage/SpuInfo/stopSaleBySupplierId', _this.Qs.stringify({
                            supplierId: params.row.id,
                          }))
                        }
                      } else {
                        _this.$Message.error(res.data.message)
                      }
                    })
                  }
                }
              }, [
                h('Icon', {
                  slot: 'open',
                  props: {
                    size: '5px',
                    type: 'md-checkmark',
                  }
                }),
                h('Icon', {
                  slot: 'close',
                  props: {
                    size: '5px',
                    type: 'md-close',
                  }
                })
              ])
            }
          },
          {
            title: '操作',
            width: 110,
            align: 'center',
            render: (h, params) => {

              if(params.row.oneself===true){
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
                        this.$router.push({
                          name: 'addSupplier',
                          query: {
                            id: params.row.id,
                            supplierName: params.row.supplierName
                          }
                        })
                      }
                    }
                  }),
                  h('Icon', {
                    props: {
                      type: 'md-list-box',
                      size: '20'
                    },
                    style: {
                      cursor: 'pointer',
                      marginRight: '5px'
                    },
                    on: {
                      click: () => {
                        this.$router.push({
                          name: 'supplierAccount',
                          query: {
                            id: params.row.id,
                            supplierName: params.row.supplierName
                          }
                        })
                      }
                    }
                  })
                ])
              }else {

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
                        this.$router.push({
                          name: 'addSupplier',
                          query: {
                            id: params.row.id,
                            supplierName: params.row.supplierName
                          }
                        })
                      }
                    }
                  }),
                  h('Icon', {
                    props: {
                      type: 'md-list-box',
                      size: '20'
                    },
                    style: {
                      cursor: 'pointer',
                      marginRight: '5px'
                    },
                    on: {
                      click: () => {
                        this.$router.push({
                          name: 'supplierAccount',
                          query: {
                            id: params.row.id,
                            supplierName: params.row.supplierName
                          }
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
                      title: '确定删除该供应商？',
                    },
                    on: {
                      'on-ok': () => {
                        const _this = this;
                        _this.Axios.post('/Manage/Supplier/deletedById', _this.Qs.stringify({
                          id: params.row.id
                        })).then(res => {
                          if (res.data.code === 0) {
                            _this.Axios.post('/Manage/SpuInfo/deletedBySupplierId', _this.Qs.stringify({
                              supplierId: params.row.id
                            })).then(res => {
                              if (res.data.code === 0) {
                                _this.getSupplier();
                              } else {
                                _this.$Message.error(res.data.message)
                              }
                            })
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
          }
        ],
        data1: [],
      }
    },
    methods: {
      // 获取供应商列表
      getSupplier() {
        const _this = this;
        _this.loading = true;
        _this.Axios.get('/Manage/Supplier/pageList', {
          params: {
            locked: _this.locked === '全部' ? '' : _this.locked,
            supplierNameLike: this.pre === '0' ? this.searchInp : '',
            supplierNoLike: this.pre === '1' ? this.searchInp : '',
          }
        }).then(res => {
          if (res.data.code === 0) {
            _this.data1 = res.data.data.content;
            _this.total = res.data.data.totalElements;
          } else {
            _this.$Message.error(res.data.message)
          }
          _this.loading = false
        })
      }

    },
    mounted() {
      this.getSupplier()
    }
  }
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
</style>
