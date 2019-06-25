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
      <BreadcrumbItem>订单管理</BreadcrumbItem>
      <BreadcrumbItem>退单列表</BreadcrumbItem>
    </Breadcrumb>
    <Content :style="{padding: '16px', background: '#fff'}">
      <Row style="margin-bottom: 15px">
        <Col span="24">
          <Input v-model="searchInp" @on-enter="searchBtn" style="width: 250px;float: right;margin-top: -1px;"
                 size="small">
            <Select @on-change="getOrder" v-model="pre" slot="prepend" style="width: 80px">
              <Option value="0">订单编号</Option>
              <Option value="3">退货单号</Option>
              <Option value="1">商品名称</Option>
              <Option value="2">买家账号</Option>
            </Select>
            <Button @click="searchBtn" slot="append" icon="ios-search"></Button>
          </Input>
          <Select v-model="status" @on-change="statuss" style="width:85px;float: right;margin-right: 20px"
                  size="small">
            <Option value="全部">全部</Option>
            <Option value="APPLYING">待处理</Option>
            <Option value="COMPLETE">已同意</Option>
            <Option value="REJECT">已拒绝</Option>
          </Select>
          <span style="float: right;margin: 3px 4px 0 0">状态:</span>
          <div style="float: right;margin-right: 20px" class="upTime">
            <DatePicker @on-change="getTime" :editable="false" format="yyyy/MM/dd" type="daterange" show-week-numbers
                        placement="bottom-start" placeholder="选择申请退货时间"
                        style="cursor:pointer;width: 180px;float: right" size="small"></DatePicker>
            <span style="float: right;margin: 3px 4px 0 0">申请时间:</span>
          </div>
        </Col>
      </Row>

      <Table :loading="loading" border :columns="columns1" :data="data1" height="592" size="small"></Table>

      <div style="width: 100%;text-align: center;margin-top: 15px">
        <Page @on-change="paging" :total="total" :page-size="14" show-elevator show-total/>
      </div>
    </Content>

    <Modal v-model="refuse" width="360">
      <p slot="header" style="color:#f60;text-align:center">
        <Icon type="ios-information-circle"></Icon>
        <span>拒绝买家<{{username}}>申请</span>
      </p>
      <div style="text-align:center">
        <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="80">
          <FormItem label="拒绝原因" prop="rejectReason">
            <Input :maxlength="80" type="textarea" placeholder="输入拒绝原因" v-model="formValidate.rejectReason"></Input>
          </FormItem>
          <div style="width: 100%;position: relative">
            <span style="position: absolute;right: 10px;top: -45px;">{{formValidate.rejectReason.length}} / 80</span>
          </div>
        </Form>
      </div>
      <div slot="footer">
        <Button type="error" size="large" long :loading="modal_loading" @click="handleSubmit('formValidate')">拒绝
        </Button>
      </div>
    </Modal>

    <Modal v-model="consent" width="360">
      <p slot="header" style="color:#19be6b;text-align:center">
        <Icon type="ios-information-circle"></Icon>
        <span>同意买家<{{username}}>申请</span>
      </p>
      <div>
        <Form ref="formValidatea" :model="formValidatea" :rules="ruleValidatea" :label-width="80">
          <FormItem label="退货类型" prop="refundType">
            <Select v-model="formValidatea.refundType">
              <Option value="RETURNGOODS">退货</Option>
              <Option value="BARTER">换货</Option>
              <Option value="REFUND">退款</Option>
            </Select>
          </FormItem>
          <FormItem label="退还积分" prop="refundTotleCredit">
            <Input :maxlength="80" :disabled="true" type="text" placeholder="输入退还积分" v-model="formValidatea.refundTotleCredit"></Input>
          </FormItem>
        </Form>
      </div>
      <div slot="footer">
        <Button type="success" size="large" long :loading="modal_loading" @click="handleSubmita('formValidatea')">同意
        </Button>
      </div>
    </Modal>

  </div>
</template>
<script>
  import expandRow from './order-expand.vue';

  export default {
    components: {expandRow},
    data() {
      return {
        username: '',
        modal_loading: false,
        refuse: false,
        orderNo: '',
        consent: false,
        deliver: false,
        total: 1,
        start: 0,
        pre: '0',
        status: '全部',        // 订单状态搜索
        searchInp: '',         // 订单商品买家搜索
        search: '',
        payTimeBegin: '',     //成交时间开始 毫秒级
        payTimeEnd: '',       //成交时间结束 毫秒级
        loading: true,
        columns1: [
          {
            type: 'expand',
            width: 50,
            render: (h, params) => {
              return h(expandRow, {
                props: {
                  row: params.row
                }
              })
            }
          },
          {
            title: '订单编号',
            key: 'ordersNo',
            minWidth: 80,
            maxWidth: 300,
            tooltip: true,
          },
          {
            title: '买家账号',
            tooltip: true,
            align: 'center',
            key: 'username'
          },
          {
            title: '联系电话',
            tooltip: true,
            align: 'center',
            key: 'contactPhone'
          },
          {
            title: '支付时间',
            align: 'center',
            key: 'payTime',
            render: (h, params) => {
              if (params.row.payTime === undefined) {
                return h('p', '暂无')
              } else {
                return h('p', this.GetLocalTime(params.row.payTime))
              }
            }
          },
          // {
          //   title: '退货类型',
          //   align: 'center',
          //   tooltip: true,
          //   key: 'timeCreated',
          //   render: (h, params) => {
          //     return h('p', params.row.applyType.name)
          //   }
          // },
          {
            title: '申请方式',
            align: 'center',
            tooltip: true,
            key: 'timeCreated',
            render: (h, params) => {
              return h('p', params.row.applyType.name)
            }
          },

          {
            title: '状态',
            align: 'center',
            maxWidth: 150,
            key: 'refundOrdersStatus',
            render: (h, params) => {
              if (params.row.refundOrdersStatus.value === 'APPLYING') {
                return h('p', '待处理')
              } else if (params.row.refundOrdersStatus.value === 'COMPLETE') {
                return h('p', '已同意')
              } else {
                return h('p', '已拒绝')
              }
            }
          },
          {
            title: '操作',
            minWidth: 80,
            maxWidth: 100,
            align: 'center',
            render: (h, params) => {
              return h('div', [
                h('Tooltip', {
                  props: {
                    content: '同意申请',
                  }
                }, [
                  h('Icon', {
                    style: {
                      cursor: 'pointer',
                      marginRight: '10px'
                    },
                    attrs: {
                      type: 'ios-checkmark-circle',
                      size: 20
                    },
                    on: {
                      click: () => {
                        this.formValidate.refundOrdersNo = params.row.refundOrdersNo;
                        this.username = params.row.username
                        this.formValidatea.refundTotleCredit=params.row.refundOrdersDetailBos[0].realSubtotalCredit
                        this.consent = true
                      }
                    }
                  }),
                ]),
                h('Tooltip', {
                  props: {
                    content: '拒绝申请',
                  }
                }, [
                  h('Icon', {
                    style: {
                      cursor: 'pointer'
                    },
                    attrs: {
                      type: 'md-close-circle',
                      size: 20
                    },
                    on: {
                      click: () => {
                        this.handleReset('formValidate');
                        this.refuse = true;
                        this.formValidate.refundOrdersNo = params.row.refundOrdersNo;
                        this.username = params.row.username
                      }
                    }
                  })
                ])
              ])


            }
          }
        ],
        data1: [],
        formValidate: {
          refundOrdersNo: '',        //退货单编号
          rejectReason: '',         //拒绝原因
        },
        ruleValidate: {
          rejectReason: [
            {required: true, message: '请填写拒绝原因', trigger: 'change'}
          ]
        },
        formValidatea: {
          refundTotleCredit: '',        //实退积分
          refundType: '',               //退货方式 BARTER("换货"), RETURNGOODS("退货"), REFUND("退款");
        },
        ruleValidatea: {
          refundType: [
            {required: true, message: '请填写拒绝原因', trigger: 'change'}
          ]
        }

      }
    },
    methods: {

      // 获取订单列表
      getOrder() {
        const _this = this;
        _this.loading = true;
        _this.Axios.get('/Manage/RefundOrder/pageList', {
          params: {
            start: _this.start,
            size: 14,
            createTimeGe: this.payTimeBegin,    //成交时间开始 毫秒级
            createTimeLe: this.payTimeEnd,      //成交时间结束 毫秒级
            refundOrdersStatus: _this.status === '全部' ? '' : _this.status,
            refundOrderNoLike: _this.pre === '3' ? _this.search : '', //退货单号模糊搜索
            usernameLike: _this.pre === '2' ? _this.search : '',    //账号模糊搜索
            skuInfoNameLike: _this.pre === '1' ? _this.search : '', //商品名模糊搜索
            orderNoLike: _this.pre === '0' ? _this.search : '',     //订单编号模糊查询
          }
        }).then(res => {
          _this.total = res.data.data.totalElements;
          if (res.data.code === 0) {
            _this.data1 = res.data.data.content
          } else {
            _this.$Message.error(res.data.message)
          }
          _this.loading = false
        })
      },

      // 状态筛选
      statuss() {
        this.start = 0;
        this.total = 1;
        this.getOrder()
      },

      // 日期筛选
      getTime(i) {
        if (i[0].length < 1) {
          this.start = 0;
          this.total = 0;
          this.payTimeBegin = '';
          this.payTimeEnd = '';
          this.getOrder()
        } else {
          this.start = 0;
          this.total = 0;
          this.payTimeBegin = new Date(i[0]).getTime();
          this.payTimeEnd = new Date(i[1]).getTime();
          this.getOrder()
        }
      },

      // 订单编号名称搜索
      searchBtn() {
        this.start = 0;
        this.total = 0;
        this.search = this.searchInp;
        this.getOrder();
      },

      // 订单分页
      paging(i) {
        this.start = i - 1;
        this.getOrder();
      },

      // 拒绝操作
      handleSubmit(name) {
        const _this = this;
        _this.$refs[name].validate((valid) => {
          if (valid) {
            _this.modal_loading = true;
            _this.Axios.post('/Manage/RefundOrder/refundHandle', _this.Qs.stringify({
              refundOrdersNo: _this.formValidate.refundOrdersNo,
              refundOrdersStatus: 'REJECT',  //COMPLETE完成 REJECT拒绝
              rejectReason: _this.formValidate.rejectReason
            })).then(res => {
              if (res.data.code === 0) {
                _this.getOrder();
                _this.$Message.success('已拒绝该申请')
                this.refuse = false;
              } else {
                _this.$Message.error(res.data.message)
              }
              _this.modal_loading = false;
            })
          } else {
            _this.$Message.error('有必填项未填写!');
          }
        })
      },
      handleReset(name) {
        this.$refs[name].resetFields();
      },
      // 同意操作
      handleSubmita(name) {
        const _this = this;
        _this.$refs[name].validate((valid) => {
          if (valid) {
            _this.modal_loading = true;
            _this.Axios.post('/Manage/RefundOrder/refundHandle',_this.Qs.stringify({
              refundOrdersNo: _this.formValidate.refundOrdersNo,
              refundOrdersStatus: 'COMPLETE',  //COMPLETE完成 REJECT拒绝
              refundType:_this.formValidatea.refundType,
              refundTotleCredit:_this.formValidatea.refundTotleCredit,  //实退积分
              refundTotlePrice:0     //实退金额
            })).then(res=>{
              if(res.data.code===0){
                _this.consent=false;
                _this.getOrder();
                _this.$Message.success('已同意该申请')
              }else {
                _this.$Message.error(res.data.message)
              }
              _this.modal_loading = false;
            })

          } else {
            _this.$Message.error('有必填项未填写!');
          }
        })
      },
      handleReseta(name) {
        this.$refs[name].resetFields();
      }
    },
    mounted() {
      this.getOrder();
    }
  }
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
  .Card {
    cursor: pointer;
    width: 212px;
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
    width: 262px;
    margin-right: -66px;
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

</style>
