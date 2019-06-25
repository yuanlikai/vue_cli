<style lang="less">
  .ivu-tree li ul {
    padding: 0 0 0 60px;
  }

  .ivu-layout-content .ivu-input-group-small .ivu-input {
    height: 25px;
  }

  .search-box .ivu-card-body {
    padding: 6px 16px;
  }

</style>
<template>
  <div class="content">
    <Breadcrumb :style="{margin: '15px 0'}">
      <BreadcrumbItem>商品管理</BreadcrumbItem>
      <BreadcrumbItem>商品列表</BreadcrumbItem>
    </Breadcrumb>
    <Content :style="{padding: '16px', minHeight: '701px', background: '#fff',overflow:'hidden'}">


      <Row style="margin-bottom: 15px">
        <Col span="24">
          <ButtonGroup class="btnIcon" size="small" style="float:left;">
            <Button>
              <Poptip
                confirm
                transfer
                title="确定批量删除已选择产品？"
                @on-ok="OnSale({name:'del',type:''})">
                <div style="width: 100%;height: 100%;">
                  <Icon type="md-trash"/>
                </div>
              </Poptip>
            </Button>
            <Button>
              <Poptip
                confirm
                transfer
                title="确定批量下架已选择产品？"
                @on-ok="OnSale({name:'OnSale',type:false})">
                <Icon type="md-arrow-round-down"/>
              </Poptip>
            </Button>
          </ButtonGroup>
          <Input @on-enter="searchBtn" v-model="searchInp" style="width: 250px;float: right;margin-top: -1px;"
                 size="small">
            <Select @on-change="getProduct" v-model="select3" slot="prepend" style="width: 80px">
              <Option value="0">商品名称</Option>
              <Option value="1">商品编号</Option>
            </Select>
            <Button @click="searchBtn" slot="append" icon="ios-search"></Button>
          </Input>
          <Select v-model="onSale" @on-change="getProduct" style="width:100px;float: right;margin-right: 20px"
                  size="small">
            <Option value="全部">全部</Option>
            <Option value="true">上架</Option>
            <Option value="false">下架</Option>
            <Option value="3">回收站</Option>
            <Option value="4">审批中</Option>
          </Select>
          <span style="float: right;margin: 3px 4px 0 0">状态:</span>
          <Select v-if="supplierStatus!=='SUPPLIER'" v-model="terrace" @on-change="getProduct"
                  style="width:100px;float: right;margin-right: 20px" size="small">
            <Option v-for="item in cityList" :value="item.id" :key="item.id">{{ item.supplierName }}</Option>
          </Select>
          <span v-if="supplierStatus!=='SUPPLIER'" style="float: right;margin: 3px 4px 0 0">供应商:</span>
          <Cascader @on-change="classify" :data="Class" change-on-select v-model="ClassVal" size="small"
                    style="float:right;margin-right: 20px"></Cascader>
          <span style="float: right;margin: 3px 4px 0 0">分类:</span>
          <div class="search-box" style="padding-right: 16px;">

            <Card class="Card">
              <span style="margin: 3px 4px 0 0">积分:</span>
              <Input v-model="mixInte" placeholder="" style="width: 50px;" size="small"/>
              <span style="margin: 3px 4px">-</span>
              <Input v-model="maxInte" placeholder="" style="width: 50px;" size="small"/>
              <Button @click="sortBtn('Inte')" type="info" size="small" style="margin-left: 4px;float: right"
                      class="CardBtn">确定
              </Button>
            </Card>

            <Card class="Card">
              <span style="margin: 3px 4px 0 0">销量:</span>
              <Input v-model="minSales" placeholder="" style="width: 50px;" size="small"/>
              <span style="margin: 3px 4px">-</span>
              <Input v-model="maxSales" placeholder="" style="width: 50px;" size="small"/>
              <Button @click="sortBtn('Sales')" type="info" size="small" style="margin-left: 4px;float: right"
                      class="CardBtn">确定
              </Button>
            </Card>
          </div>
        </Col>
      </Row>
      <Table @on-selection-change="tableChange" :loading="loading" @on-sort-change="rank" border ref="selection"
             :columns="columns1" height="592"
             :data="data1" size="small"></Table>

      <div style="width: 100%;text-align: center;margin-top: 15px">
        <Page :total="total" :page-size="14" @on-change="paging" show-elevator show-total/>
      </div>
    </Content>
  </div>
</template>
<script>
  export default {
    data() {
      return {
        supplierStatus: localStorage.getItem('status'),
        start: 0,                 // 分页页码0为第一页
        total: 1,                 // 分页总条数
        loading: true,            // 列表价值动画
        creditOrder: '',          // 积分升序为true 降序为false
        priceOrder: '',           // 价格升序为true 降序为false
        stockOrder: '',           // 库存升序为true 降序为false
        saleVolumeOrder: '',      // 销量升序为true 降序为false
        onSale: '全部',           // 是否上下架
        Class: [],                // 分类列表
        categoryIdLikeAndE: '',   // 分类ID
        select3: '0',
        value13: '',
        ClassVal: [],
        minSales: '',              // 销量范围开始
        maxSales: '',              // 销量范围结束
        saleVolumeStart: '',       // 销量范围开始》参数
        saleVolumeEnd: '',         // 销量范围结束》参数
        mixInte: '',               // 积分范围开始
        maxInte: '',               // 积分范围结束
        creditStart: '',           // 积分范围结束》参数
        creditEnd: '',             // 积分范围结束》参数
        projectIds: [],            // 已选中产品id

        cityList: [
          {
            id: '0',
            supplierName: '全部'
          }
        ],

        terrace: '0',
        price: '',
        columns1: [
          {
            type: 'selection',
            width: 50,
            align: 'center',
          },
          {
            title: '商品图',
            align: 'center',
            tooltip: true,
            minWidth: 70,
            maxWidth: 100,
            render: (h, params) => {
              return h('Poptip', {
                props: {
                  placement: 'right',
                  width: "250",
                }
              }, [
                h('img', {
                  attrs: {
                    src: params.row.skuInfoPicUrl
                  },
                  style: {
                    height: '25px',
                    cursor: 'pointer'
                  },
                  on: {
                    click: () => {

                    }
                  }
                }),
                h('div', {
                  slot: 'content',
                  attrs: {
                    class: 'api'
                  }
                }, [
                  h('img', {
                    attrs: {
                      src: params.row.skuInfoPicUrl
                    },
                    style: {
                      width: '100%'
                    }
                  })
                ])
              ])
            }
          },
          {
            title: '商品名',
            tooltip: true,
            key: 'skuInfoName',
            minWidth: 150,
          },
          {
            title: '所属企业',
            minWidth: 100,
            tooltip: true,
            maxWidth: 400,
            key: 'supplierName'
          },
          {
            title: '编号',
            align: 'center',
            minWidth: 80,
            maxWidth: 150,
            key: 'skuInfoNo'
          },
          {
            title: '价格',
            minWidth: 73,
            maxWidth: 150,
            align: 'center',
            key: 'price',
            sortable: 'custom'
          },
          {
            title: '积分',
            minWidth: 73,
            maxWidth: 150,
            align: 'center',
            key: 'credit',
            sortable: 'custom'
          },
          {
            title: '库存',
            minWidth: 73,
            maxWidth: 150,
            align: 'center',
            key: 'skuInfoStock',
            sortable: 'custom'
          },
          {
            title: '销量',
            minWidth: 73,
            maxWidth: 150,
            align: 'center',
            key: 'saleVolume',
            sortable: 'custom'
          },
          {
            title: '状态',
            align: 'center',
            minWidth: 60,
            maxWidth: 120,
            key: 'onSale',
            render: (h, params) => {
              if (params.row.subAudit === true) {
                return h('p', '审批中')
              } else if (params.row.deleted === false) {
                return h('p', params.row.onSale === true ? '上架' : '下架')
              } else {
                return h('p', '回收站')
              }
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
                    size: '20',
                    type: 'ios-create'
                  },
                  style: {
                    marginRight: '5px',
                    cursor: 'pointer'
                  },
                  on: {
                    click: () => {
                      this.$router.push({
                        name: 'addProduct',
                        query: {
                          id: params.row.id,
                          name: params.row.skuInfoName,
                          spuInfoId: params.row.spuInfoId
                        }
                      })
                    }
                  }
                }),
                h('Poptip', {
                  props: {
                    confirm: true,
                    transfer: true,
                    offset: 15,
                    placement: "top-end",
                    title: '确定后将进入上架审核状态，是否确定？',
                  },
                  on: {
                    'on-ok': () => {
                      const _this = this;
                      if (params.row.subAudit === true) {
                        _this.$Message.warning('该商品正在审批')
                      } else if (params.row.onSale === true) {
                        _this.$Message.warning('该商品已上架')
                      } else {
                        _this.Axios.post('/Manage/SpuInfo/subAudit', _this.Qs.stringify({
                          id: params.row.spuInfoId
                        }, {indices: false})).then(res => {
                          if (res.data.code === 0) {
                            _this.getProduct();
                          } else {
                            _this.$Message.error(res.data.message)
                          }
                        })
                      }
                    }
                  }
                }, [
                  h('Icon', {
                    props: {
                      size: '18',
                      type: 'md-arrow-round-up'
                    },
                    style: {
                      cursor: 'pointer'
                    },
                  })
                ])
              ])
            }
          }
        ],
        data1: [],
        searchInp: '',
      }
    },
    methods: {

      // 订单编号名称搜索
      searchBtn() {
        this.start = 0;
        this.total = 0;
        this.value13 = this.searchInp;
        this.getProduct();
      },

      // 获取产品列表接口
      getProduct() {
        const _this = this;
        _this.loading = true;
        _this.Axios.get('/Manage/SkuInfo/getSkuInfoPageList', {
          params: {
            start: _this.start,
            size: 14,
            manageOrder: true,
            supplierId: _this.terrace === '0' ? '' : _this.terrace,    //供应商筛选
            onSale: _this.onSale === '全部' || _this.onSale === '3' || _this.onSale === '4' ? '' : _this.onSale,   // 是否上架 true为上架false为下架
            saleVolumeStart: _this.saleVolumeStart,                      // 销量范围开始
            saleVolumeEnd: _this.saleVolumeEnd,                          // 销量范围结束
            creditStart: _this.creditStart,                              // 积分范围开始
            creditEnd: _this.creditEnd,                                  // 积分范围结束
            categoryIdLikeAndE: _this.categoryIdLikeAndE,                // 根据类目id查询
            skuInfoNameLike: _this.select3 === '0' ? _this.value13 : '', // 名称模糊查询
            skuInfoNoLike: _this.select3 === '1' ? _this.value13 : '',   // 编号模糊查询
            recycleBin: _this.onSale === '3' ? true : false,             // 查询回收站商品 传true为回收站商品
            subAudit: _this.onSale === '4' ? true : false,               // 查询回收站商品 传true为审批中商品
            priceOrder: _this.priceOrder,                                // 价格升序为true 降序为false
            stockOrder: _this.stockOrder,                                // 库存升序为true 降序为false
            creditOrder: _this.creditOrder,                              // 销量升序为true 降序为false
            saleVolumeOrder: _this.saleVolumeOrder                       // 销量升序为true 降序为false
          }
        }).then(res => {
          if (res.data.code === 0) {
            _this.data1 = res.data.data.content;
            _this.total = res.data.data.totalElements
          } else {
            _this.$Message.error(res.data.message)
          }
          _this.loading = false
        })
      },

      // 批量商品上下架丶删除
      OnSale(i) {
        const _this = this;
        if (_this.projectIds.length < 1) {
          _this.$Message.warning('至少选择一个商品！')
        } else {
          _this.Axios.post(i.name === 'del' ? '/Manage/SpuInfo/deleteSpuInfo' : '/Manage/SpuInfo/updateStopSale', _this.Qs.stringify({
            ids: _this.projectIds
          }, {indices: false})).then(res => {
            if (res.data.code === 0) {
              _this.projectIds = [];
              _this.getProduct();
            } else {
              _this.$Message.error(res.data.message)
            }
          })
        }
      },

      // 销量丶积分筛选
      sortBtn(i) {
        if (i === 'Sales') {
          this.saleVolumeStart = this.minSales;
          this.saleVolumeEnd = this.maxSales;
        } else {
          this.creditStart = this.mixInte;
          this.creditEnd = this.maxInte;
        }
        this.getProduct()
      },

      // 分类选择搜索
      classify(i) {
        this.categoryIdLikeAndE = i.reverse()[0];
        this.getProduct()
      },

      // 价格、销量、库存 排序
      rank(i) {
        this.priceOrder = '';          // 价格升序为true 降序为false
        this.stockOrder = '';          // 库存升序为true 降序为false
        this.creditOrder = '';         // 积分升序为true 降序为false
        this.saleVolumeOrder = '';     // 销量升序为true 降序为false
        i.key === 'price' ? (i.order === 'desc' ? this.priceOrder = false : this.priceOrder = true) : '';                 //价格排序
        i.key === 'skuInfoStock' ? (i.order === 'desc' ? this.stockOrder = false : this.stockOrder = true) : '';          //库存排序
        i.key === 'credit' ? (i.order === 'desc' ? this.creditOrder = false : this.creditOrder = true) : '';              //价格排序
        i.key === 'saleVolume' ? (i.order === 'desc' ? this.saleVolumeOrder = false : this.saleVolumeOrder = true) : '';  //销量排序
        this.getProduct()
      },

      // 获取供应商列表
      getSupplier() {
        const _this = this;
        _this.Axios.get('/Manage/Supplier/list').then(res => {
          _this.cityList = _this.cityList.concat(res.data.data);
        })
      },

      // 表格已选中产品id
      tableChange(id) {
        this.projectIds = [];
        for (let i = 0; i < id.length; i++) {
          this.projectIds.push(id[i].spuInfoId)
        }
      },

      // 分页
      paging(i) {
        this.start = i - 1;
        this.getProduct();
      },

      // 获取分类筛选树形结构
      getClass() {
        const _this = this;
        _this.Axios.get('/Manage/Category/treeList').then(res => {
          _this.Class = res.data.data
        })
      },

      // 全选
      handleSelectAll(status) {
        this.$refs.selection.selectAll(status);
      },
    },
    mounted() {
      this.getClass();
      this.getProduct();
      this.getSupplier()
    }
  }
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
  .Card {
    cursor: pointer;
    width: 190px;
    overflow: hidden;
    float: right;
    margin-top: -7px;
    margin-right: -16px;
    font-size: 12px;
    border: 1px solid #ffffff;
    -webkit-transition: all 0s;
    -moz-transition: all 0s;
    -ms-transition: all 0s;
    -o-transition: all 0s;
    transition: all 0s;
  }

  .CardBtn {
    display: none;
  }

  .Card:hover {
    z-index: 99;
    width: 245px;
    margin-right: -71px;
    border: 1px solid #dcdee2;

    .CardBtn {
      display: block;
    }
  }

  .btnIcon .ivu-icon {
    vertical-align: baseline;
    padding: 6px 7px 4px 7px;
  }

  .ivu-layout-content .ivu-btn-group-small > .ivu-btn {
    padding: 0;
  }

  .ivu-tree li ul {
    padding: 0 0 0 60px;
  }

  .search-box {
    float: right;
    height: 24px;
  }

  @media screen and (max-width: 1522px) {
    .search-box {
      width: 50%;
      margin-top: 10px;
      margin-right: -20px;
    }

    .Card:hover {
      margin-right: 0;
    }
  }
</style>
