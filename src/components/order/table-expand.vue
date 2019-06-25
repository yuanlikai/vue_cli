// table-expand.vue
<style scoped>
  .expand-row {
    margin-bottom: 16px;
  }
</style>
<template>
  <div>
    <Row class="expand-row">

      <Col span="24">
        <span class="expand-key" style="font-weight: 700">商品详情: </span>
      </Col>
      <Col span="24" style="margin-top: 6px">
        <Table border :columns="columns1" :data="data1" size="small"></Table>
      </Col>
    </Row>
    <Row>
      <Col span="24" style="margin-bottom: 6px">
        <span class="expand-key" style="font-weight: 700">物流信息: {{row.hasSendOut===true?'':'未发货'}}</span>
      </Col>
      <Row v-if="row.hasSendOut===true?true:false">
        <Col span="4">
          <span class="expand-key">物流公司: </span>
          <span class="expand-value">{{row.expressName}}</span>
        </Col>
        <Col span="5">
          <span class="expand-key">物流单号: </span>
          <span class="expand-value">{{row.expressNo}}</span>
        </Col>
        <Col span="4">
          <span class="expand-key">收件人: </span>
          <span class="expand-value">{{row.consigneeName}}</span>
        </Col>
        <Col span="4">
          <span class="expand-key">手机: </span>
          <span class="expand-value">{{row.consigneePhone}}</span>
        </Col>
        <Col span="7">
          <span class="expand-key">收货地址: </span>
          <span class="expand-value">{{row.fullAddress}}</span>
        </Col>
        <Col span="24">
          <span class="expand-key">备注: </span>
          <span class="expand-value">{{row.expressRemarks}}</span>
        </Col>
      </Row>
    </Row>
    <Modal v-model="deliver" width="360">
      <p slot="header">
        <span>订单号：<{{orderNo}}></span>
      </p>
      <div>
        <div style="width: 100%;float: left;margin-bottom: 15px">
          <img :src="product.productImg+'?x-oss-process=image/resize,m_pad,h_70,w_70,color_FFFFFF'"
               style="float: left;margin-right: 15px" alt="" class="productImg">
          <p class="productCl">商品名称：{{product.skuInfoName}}</p>
          <p class="productCl">商品编号：{{product.skuInfoNo}}</p>
          <p class="productCl">实付积分：{{product.realSubtotalCredit}}</p>
        </div>
        <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="80">
          <FormItem label="联系手机" prop="contactPhone">
            <Input :maxlength="11" v-model="formValidate.contactPhone" placeholder="输入联系人手机号"></Input>
          </FormItem>
          <FormItem label="退货原因" prop="reason">
            <Input :maxlength="70" type="textarea" placeholder="输入退货原因" v-model="formValidate.reason"></Input>
          </FormItem>
          <div style="width: 100%;position: relative">
            <span style="position: absolute;right: 10px;top: -45px;">{{formValidate.reason.length}} / 70</span>
          </div>
        </Form>
      </div>
      <div slot="footer">

        <Button type="success" :loading="deliverLoading" size="large" long @click="handleSubmit('formValidate')">
          退货
        </Button>
      </div>
    </Modal>
  </div>
</template>
<script>
  export default {
    props: ['row', 'getOrder'],
    data() {
      // 手机号码校验
      const liaisonPhone = (rule, value, callback) => {
        const _this = this;
        if (value.length < 1) {
          callback(new Error('手机号码不能为空'));
        } else if (!(/^1[34578]\d{9}$/.test(value))) {
          callback(new Error('手机号格式有误'));
        } else {
          callback();
        }
      };
      return {
        order: {
          orderId: '',                   //订单id
          orderNo: '',                   //订单编号
          reason: '',                    //退货原因
          applyRefundTotlePrice: '',     //申请退货总金额
          applyRefundTotleCredit: '',    //申请退货总积分
          orderDetailIdSet: '',          //退货的订单明细id
          contactPhone: '',              //联系人手机号
        },
        product: {
          productImg: '',
          skuInfoName: '',
          skuInfoNo: '',
          realSubtotalCredit: '',
        },
        productImg: '',
        deliver: false,
        deliverLoading: false,
        orderNo: '',
        formValidate: {
          contactPhone: '',
          reason: '',
        },
        ruleValidate: {
          contactPhone: [
            {required: true, validator: liaisonPhone, trigger: 'blur'}
          ],
          reason: [
            {required: true, message: '请填写退货原因', trigger: 'blur'}
          ]
        },
        columns1: [
          {
            title: '商品图',
            width: 80,
            align: 'center',
            key: 'skuInfoThums',
            render: (h, params) => {
              return h('Poptip', {
                props: {
                  placement: 'right',
                  width: "250",
                }
              }, [
                h('img', {
                  attrs: {
                    src: params.row.skuInfoThums
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
                      src: params.row.skuInfoThums
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
            title: '商品名称',
            minWidth: 200,
            tooltip: true,
            key: 'skuInfoName'
          },
          {
            title: '供应商',
            minWidth: 150,
            maxWidth: 300,
            tooltip: true,
            key: 'supplierName',
          },
          {
            title: '商品编号',
            minWidth: 100,
            maxWidth: 150,
            tooltip: true,
            align: 'center',
            key: 'skuInfoNo'
          },
          {
            title: '件数',
            minWidth: 70,
            maxWidth: 150,
            align: 'center',
            key: 'amount'
          },
          {
            title: '实付积分',
            minWidth: 90,
            maxWidth: 150,
            align: 'center',
            key: 'realSubtotalCredit'
          },
          {
            title: '操作',
            width: 100,
            align: 'center',
            render: (h, params) => {

              let sta = '';
              if (params.row.paid === true) {
                if (params.row.refundType === 0) {
                  sta = '退货'
                } else if (params.row.refundType === 1) {
                  sta = '处理中'
                } else {
                  sta = '已退货'
                }
              } else {
                sta = '未付款'
              }
              return h('Button', {
                props: {
                  size: 'small',
                  type: "error"
                },
                attrs: {
                  disabled: sta === '退货' ? false : true,
                },
                on: {
                  click: () => {
                    const _this = this;
                    _this.handleReset('formValidate')
                    _this.deliver = true;
                    _this.orderNo = _this.row.ordersNo;
                    _this.product = {
                      productImg: params.row.skuInfoThums,
                      skuInfoName: params.row.skuInfoName,
                      skuInfoNo: params.row.skuInfoNo,
                      realSubtotalCredit: params.row.realSubtotalCredit
                    };
                    _this.order = {
                      orderId: _this.row.id,                   //订单id
                      orderNo: _this.row.ordersNo,                   //订单编号
                      reason: _this.formValidate.reason,                    //退货原因
                      applyRefundTotlePrice: params.row.realSubtotalPrice,     //申请退货总金额
                      applyRefundTotleCredit: params.row.realSubtotalCredit,    //申请退货总积分
                      orderDetailIdSet: params.row.id,          //退货的订单明细id
                      contactPhone: _this.formValidate.contactPhone,              //联系人手机号
                    }
                  }
                }
              }, sta)
            }
          }
        ],
        data1: this.row.ordersDetailsInfoList
      }
    },
    methods: {

      // 发货操作
      handleSubmit(name) {
        const _this = this;
        _this.$refs[name].validate((valid) => {
          if (valid) {
            _this.deliverLoading = true;
            _this.Axios.post('/Manage/RefundOrder/createRefundOrder', _this.Qs.stringify({
              orderId: _this.order.orderId,                   //订单id
              orderNo: _this.order.orderNo,                   //订单编号
              reason: _this.formValidate.reason,                    //退货原因
              applyRefundTotlePrice: _this.order.applyRefundTotlePrice,     //申请退货总金额
              applyRefundTotleCredit: _this.order.applyRefundTotleCredit,    //申请退货总积分
              orderDetailIdSet: _this.order.orderDetailIdSet,    //退货的订单明细id
              contactPhone: _this.formValidate.contactPhone,    //联系人手机号
            })).then(res => {
              if (res.data.code === 0) {
                _this.getOrder();
              } else {
                _this.$Message.error(res.data.message)
              }
              _this.deliverLoading = false;
            })
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

    }
  };
</script>
<style lang="less">
  .productCl {
    float: left;
    width: 230px;
    margin-bottom: 6px;
    overflow: hidden;
    -ms-text-overflow: ellipsis;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
