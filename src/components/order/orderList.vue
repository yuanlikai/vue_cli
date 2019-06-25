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
      <BreadcrumbItem>订单列表</BreadcrumbItem>
    </Breadcrumb>
    <Content :style="{padding: '16px', background: '#fff'}">
      <Row style="margin-bottom: 15px">
        <Col span="24">
          <Input v-model="searchInp" @on-enter="searchBtn" style="width: 250px;float: right;margin-top: -1px;"
                 size="small">
          <Select @on-change="getOrder" v-model="pre" slot="prepend" style="width: 80px">
            <Option value="0">订单编号</Option>
            <Option value="1">商品名称</Option>
            <Option value="2">买家账号</Option>
            <Option value="3">收货人</Option>
            <Option value="4">手机号</Option>
          </Select>
          <Button @click="searchBtn" slot="append" icon="ios-search"></Button>
          </Input>
          <Select v-model="status" @on-change="statuss" style="width:85px;float: right;margin-right: 20px"
                  size="small">
            <Option value="全部">全部</Option>
            <Option value="1">待付款</Option>
            <Option value="2">待发货</Option>
            <Option value="3">已发货</Option>
            <Option value="4">已完成</Option>
            <Option value="5">申请售后</Option>
            <Option value="6">售后中</Option>
            <Option value="7">已关闭</Option>
          </Select>
          <span style="float: right;margin: 3px 4px 0 0">状态:</span>
          <!--<Select style="width:100px;float: right;margin-right: 20px" size="small">-->
          <!--<Option value="0">全部</Option>-->
          <!--</Select>-->
          <!--<span style="float: right;margin: 3px 4px 0 0">企业:</span>-->
          <div class="search-box" style="padding-right: 16px;">
            <Card class="Card">
              <span style="margin: 3px 4px 0 0">订单积分:</span>
              <Input v-model="inte" placeholder="最小" style="width: 50px;" size="small"/>
              <span style="margin: 3px 4px">-</span>
              <Input v-model="intes" placeholder="最大" style="width: 50px;" size="small"/>
              <Button @click="inteBtn" type="info" size="small" style="margin-left: 4px;float: right"
                      class="CardBtn">确定
              </Button>
            </Card>
          </div>
          <div style="float: right;" class="upTime">
            <DatePicker @on-change="getTime" :editable="false" format="yyyy/MM/dd" type="daterange" show-week-numbers
                        placement="bottom-start" placeholder="选择支付时间"
                        style="cursor:pointer;width: 180px;float: right" size="small"></DatePicker>
            <span style="float: right;margin: 3px 4px 0 0">支付时间:</span>
          </div>



        </Col>
      </Row>

      <Table :loading="loading" border :columns="columns1" :data="data1" height="592" size="small"></Table>

      <div style="width: 100%;text-align: center;margin-top: 15px">
        <Page @on-change="paging" :total="total" :page-size="14" show-elevator show-total/>
      </div>
    </Content>

    <Modal v-model="deliver" width="360">
      <p slot="header">
        <span>订单号：<{{orderNo}}></span>
      </p>
      <div>
        <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="80">
          <FormItem label="快递公司" prop="expressName">
            <Select v-model="formValidate.expressName">
              <Option value="顺丰:shunfeng">顺丰</Option>
              <Option value="圆通:yuantong">圆通</Option>
              <Option value="中通:zhongtong">中通</Option>
              <Option value="申通:shentong">申通</Option>
              <Option value="韵达:yundakuaiyun">韵达</Option>
              <Option value="百世汇通:huitongkuaidi">百世汇通</Option>
            </Select>
          </FormItem>
          <FormItem label="快递单号" prop="expressNo">
            <Input :maxlength="20" v-model="formValidate.expressNo" placeholder="输入快递单号"></Input>
          </FormItem>
          <FormItem label="发货备注" prop="expressRemarks">
            <Input :maxlength="70" type="textarea" placeholder="输入备注" v-model="formValidate.expressRemarks"></Input>
          </FormItem>
          <div style="width: 100%;position: relative">
            <span style="position: absolute;right: 10px;top: -45px;">{{formValidate.expressRemarks.length}} / 70</span>
          </div>
        </Form>
      </div>
      <div slot="footer">
        <Button type="success" :deliverLoading="deliverLoading" size="large" long @click="handleSubmit('formValidate')">
          发货
        </Button>
      </div>
    </Modal>
  </div>
</template>
<script>
  import expandRow from './table-expand.vue';

  export default {
    components: {expandRow},
    data() {
      return {
        deliverLoading: false,
        orderNo: '',
        deliver: false,
        total: 1,
        start: 0,
        pre: '0',
        status: '全部',        // 订单状态搜索
        searchInp: '',         // 订单商品买家搜索
        search: '',
        inte: '',
        intes: '',
        totleCreditGe: '',    //积分开始
        totleCreditLe: '',    //积分结束
        payTimeBegin: '',     //成交时间开始 毫秒级
        payTimeEnd: '',       //成交时间结束 毫秒级
        contactPhone:'',   //收货人手机号
        contactName:'',    //收货人姓名
        loading: true,
        columns1: [
          {
            type: 'expand',
            width: 50,
            render: (h, params) => {
              const _this = this;
              return h(expandRow, {
                props: {
                  row: params.row,
                  getOrder: _this.getOrder
                }
              })
            }
          },
          {
            title: '订单编号',
            minWidth: 160,
            maxWidth: 200,
            key: 'ordersNo'
          },
          {
            title: '买家账号',
            minWidth: 80,
            tooltip: true,
            align: 'center',
            maxWidth: 180,
            key: 'username'
          },
          {
            title: '收货地址',
            tooltip: true,
            minWidth: 200,
            key: 'fullAddress'
          },
          {
            title: '创建时间',
            minWidth: 110,
            align: 'center',
            maxWidth: 150,
            tooltip: true,
            key: 'timeCreated',
            render: (h, params) => {
              return h('p', this.GetLocalTime(params.row.timeCreated))
            }
          },
          {
            title: '支付时间',
            minWidth: 110,
            align: 'center',
            maxWidth: 150,
            key: 'payTime',
            render: (h, params) => {
              if (params.row.payTime === undefined) {
                return h('p', '暂无')
              } else {
                return h('p', this.GetLocalTime(params.row.payTime))
              }
            }
          },
          {
            title: '状态',
            minWidth: 85,
            align: 'center',
            maxWidth: 150,
            key: 'orderStatus',
            render: (h, params) => {
              return h('p', params.row.orderStatus.name)
            }
          },
          {
            title: '操作',
            minWidth: 80,
            maxWidth: 100,
            align: 'center',
            render: (h, params) => {
              let sta;
              if (params.row.ordersDetailsInfoList[0].refundType === 0) {
                if (params.row.paid === true) {
                  sta = false
                } else {
                  sta = true
                }
              } else {
                sta = true
              }
              //系统自动确认 和 用户手动确认 发货按钮不能点击
              if(params.row.orderStatus.value == 'AUTOCONFIRMATION' || params.row.orderStatus.value == 'USERCONFIRMATION'){
                sta = true
              }

              return h('Button', {
                props: {
                  size: 'small',
                  type: "info",
                  ghost: true,
                  disabled: sta
                },
                on: {
                  click: () => {
                    this.deliver = true;
                    this.orderNo = params.row.ordersNo;
                    this.formValidate = {
                      expressNo: '',
                      expressName: '',
                      expressRemarks: '',
                    };
                  }
                }
              }, '发货')
            }
          }
        ],
        data1: [],

        formValidate: {
          expressName: '',
          expressNo: '',
          expressRemarks: '',
        },
        ruleValidate: {
          expressName: [
            {required: true, message: '请选择快递公司', trigger: 'change'}
          ],
          expressNo: [
            {required: true, message: '请填写快递单号', trigger: 'blur'}
          ]
        }

      }
    },
    methods: {

      // 获取订单列表
      getOrder() {
        const _this = this;
        _this.loading = true;
        _this.Axios.get('/Manage/Order/getOrdersPageList', {
          params: {
            start: _this.start,
            size: 14,
            orderStatus: _this.status === '全部' ? '' : _this.status,     //订单状态1;//待付款 2; //代发货 3;//已发货 4;//已完成 5;//申请售后 6;//处理中 7;//已关闭
            payTimeBegin: this.payTimeBegin,    //成交时间开始 毫秒级
            payTimeEnd: this.payTimeEnd,      //成交时间结束 毫秒级
            totlePriceGe: '',    //订单金额开始
            totlePriceLe: '',    //订单金额结束
            totleCreditGe: _this.totleCreditGe,   //积分开始
            totleCreditLe: _this.totleCreditLe,    //积分结束
            usernameLike: _this.pre === '2' ? _this.search : '',    //账号模糊搜索
            skuInfoNameLike: _this.pre === '1' ? _this.search : '', //商品名模糊搜索
            orderNoLike: _this.pre === '0' ? _this.search : '',     //订单编号模糊查询
            consigneeNameLike: _this.pre === '3' ? _this.search : '', //收货人姓名
            consigneePhoneLike:_this.pre === '4' ? _this.search:'', //收货人手机号
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

      // 订单积分区间搜索
      inteBtn() {
        this.start = 0;
        this.total = 0;
        this.totleCreditGe = this.inte;
        this.totleCreditLe = this.intes;
        this.getOrder();
      },

      // 订单分页
      paging(i) {
        this.start = i - 1;
        this.getOrder();
      },

      // 发货操作
      handleSubmit(name) {
        const _this = this;
        _this.$refs[name].validate((valid) => {
          if (valid) {
            _this.deliverLoading = true;
            _this.Axios.post('/Manage/Order/deliver', _this.Qs.stringify({
              ordersNo: _this.orderNo,        // 订单编号
              expressName: _this.formValidate.expressName.split(':')[0],     // 快递公司
              comCode: _this.formValidate.expressName.split(':')[1],     // 快递公司code
              expressNo: _this.formValidate.expressNo,       // 快递单号
              expressRemarks: _this.formValidate.expressRemarks   // 发货备注
            })).then(res => {
              if (res.data.code === 0) {
                _this.deliver = false;
                _this.getOrder();
                _this.$Message.success('发货成功!');
              } else {
                _this.$Message.error(res.data.message);
              }
              _this.deliverLoading = false;
            });
          } else {
            _this.$Message.error('有必填项未填写!');
          }
        })
      },
      handleReset(name) {
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

  @media screen and (max-width: 1280px) {
    .upTime {
      margin-top: 10px;
    }

  }
</style>
