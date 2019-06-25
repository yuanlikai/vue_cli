<style lang="less">
  .ivu-tree li ul {
    padding: 0 0 0 60px;
  }
</style>
<template>
  <div class="content" @click="clearPreview">
    <Breadcrumb :style="{margin: '15px 0'}">
      <BreadcrumbItem>商品管理</BreadcrumbItem>
      <BreadcrumbItem v-if="!$route.query.id">添加商品</BreadcrumbItem>
      <BreadcrumbItem v-else>修改《{{$route.query.name}}》</BreadcrumbItem>
    </Breadcrumb>
    <Content :style="{padding: '16px', minHeight: '701px', background: '#fff',overflow:'hidden'}">
      <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="80"
            style="position: relative;">
        <Spin size="large" fix v-if="spinShow"></Spin>
        <Row :gutter="100" style="max-width:930px">
          <Col span="24" style="position: relative;">
            <FormItem label="商品标题" prop="spuInfoName">
              <Input :maxlength="60" v-model="formValidate.spuInfoName" placeholder="请填写"></Input>
              <p style="position: absolute;right: 10px;top: 2px;color: #999999;">
                {{formValidate.spuInfoName.length}}/60</p>
            </FormItem>
          </Col>
          <Col span="12">
            <FormItem label="商品编号" prop="spuInfoNo">
              <Input :disabled="$route.query.id?true:false" v-model="formValidate.spuInfoNo" placeholder="请填写"></Input>
            </FormItem>
          </Col>
          <Col span="12" v-if="supplierStatus!=='SUPPLIER'">
            <FormItem label="供应商" prop="supplier">

              <Select :disabled="$route.query.id?true:false" v-model="formValidate.supplier" :label-in-value="true"
                      @on-change="getSupplierName">
                <Option v-for="item in SupplierList" :value="item.id" :key="item.id">{{ item.supplierName }}</Option>
              </Select>
            </FormItem>
          </Col>
          <Col span="12">
            <FormItem label="售价" prop="price">
              <Input :disabled="true" @on-keyup="formValidate.price=formValidate.price.replace(/\D/g,'')"
                     v-model="formValidate.price"
                     placeholder="请填写"></Input>
            </FormItem>
          </Col>
          <Col span="12">
            <FormItem label="市场价(¥)" prop="marketPrice">
              <!--<Input @on-keyup="formValidate.marketPrice=formValidate.marketPrice.replace(/\D/g,'')"-->
              <!--v-model="formValidate.marketPrice" placeholder="请填写"></Input>-->
              <Input @on-keyup="marketPrice2Decimal" v-model="formValidate.marketPrice" placeholder="请填写"></Input>
            </FormItem>
          </Col>
          <Col span="12">
            <FormItem label="原价积分" prop="marketCredit">
              <Input :maxlength="10" @on-keyup="formValidate.marketCredit=formValidate.marketCredit.replace(/\D/g,'')"
                     v-model="formValidate.marketCredit" placeholder="请填写"></Input>
            </FormItem>
          </Col>
          <Col span="12">
            <FormItem label="实际积分" prop="credit">
              <Input :maxlength="10" @on-keyup="formValidate.credit=formValidate.credit.replace(/\D/g,'')"
                     v-model="formValidate.credit"
                     placeholder="请填写"></Input>
            </FormItem>
          </Col>
          <Col span="12">
            <FormItem label="库存" prop="stock">
              <Input @on-keyup="formValidate.stock=formValidate.stock.replace(/\D/g,'')" v-model="formValidate.stock"
                     placeholder="请填写"></Input>
            </FormItem>
          </Col>
          <Col span="12">
            <FormItem label="分类" prop="ClassVal">
              <Cascader :data="Class" v-model="formValidate.ClassVal"></Cascader>
            </FormItem>
          </Col>
          <Col span="24">
            <FormItem label="是否精选" prop="choice">
              <i-switch v-model="formValidate.choice">
                <span slot="open">是</span>
                <span slot="close">否</span>
              </i-switch>
            </FormItem>
          </Col>
          <Col span="12" v-if="formValidate.choice">
            <FormItem label="排序" prop="choiceSort">
              <Input :maxlength="3" @on-keyup="formValidate.choiceSort=formValidate.choiceSort.replace(/\D/g,'')"
                     v-model="formValidate.choiceSort"
                     placeholder="请填写"></Input>
            </FormItem>
          </Col>
          <Col span="24">
            <FormItem label="题图" prop="above">
              <div style="height: 60px;">
                <upImg ref="aboves" :num="5" style="float: left;"></upImg>
                <Alert type="warning" style="float: left;margin: 12px 0 0 20px;border:none" show-icon>
                  题图最多五张，第一张为默认列表主图
                </Alert>
              </div>
            </FormItem>
          </Col>
          <Col span="24">
            <FormItem label="详情图" prop="detail">
              <div style="height: 60px;">
                <upImg ref="detail" :num="10" style="float: left;"></upImg>
                <Alert type="warning" style="float: left;margin: 12px 0 0 20px;border:none" show-icon>
                  图片大小，宽750px，高自适应。
                </Alert>
              </div>
            </FormItem>
          </Col>
        </Row>
        <FormItem>
          <Button type="primary" :loading="loading" @click="handleSubmit('formValidate')">提交</Button>
          <!--预览-->
          <div style="margin-left: 15px;display: inline-block;position: relative">
            <Button type="success" :loading="previewLoading" @click="previewImg('formValidate')">预览</Button>
            <div @click.stop="" v-if="previewImage" class="ivu-poptip-popper" style="position: absolute; will-change: top, left; bottom: 0px; left: 700px;min-width: 400px; overflow: auto;
    height: 580px;"
                 x-placement="right">
              <div class="ivu-poptip-content">
                <div class="ivu-poptip-inner">
                  <div class="ivu-poptip-body" style="padding: 0px">
                    <div class="ivu-poptip-body-content">
                      <div class="api">
                        <img :src="previewImage" style="width: 100%;"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Poptip
            v-if="deleted"
            confirm
            title="你确定要恢复这个产品吗?"
            @on-ok="recoverSpu">
            <Button type="warning" style="margin-left: 15px">恢复</Button>
          </Poptip>
        </FormItem>
      </Form>
    </Content>
  </div>
</template>
<script>
  import upImg from '../upImg'
  export default {
    components: {
      upImg
    },
    watch: {
      $route(i) {
        if (i.query.id) {
          this.getProduct()
        } else {
          this.handleReset('formValidate');
          this.$refs.aboves.defaultList = [];
          this.$refs.detail.defaultList = [];
          this.$refs.aboves.resetList();
          this.$refs.detail.resetList();
        }
      }
    },
    data() {
      // 题图上传校验
      const abovea = (rule, value, callback) => {
        this.$refs.aboves.uploadList.length < 1 ? callback(new Error('至少选择一张图片')) : callback();
      };
      // 题图上传校验
      const detail = (rule, value, callback) => {
        this.$refs.detail.uploadList.length < 1 ? callback(new Error('至少选择一张图片')) : callback();
      };
      // 分类选择校验
      const Class = (rule, value, callback) => {
        this.formValidate.ClassVal.length < 3 ? callback(new Error('至少选择一个三级分类')) : callback();
      };
      // 检查商品编号是否重复
      const InfoNo = (rule, value, callback) => {
        const _this = this;
        if (_this.formValidate.spuInfoNo.length < 1) {
          callback(new Error('商品编号不能为空'))
        } else {
          _this.Axios.get('/Manage/SkuInfo/validSkuInfoNo', {
            params: {
              id: _this.$route.query.id ? _this.$route.query.id : '',          //修改时传入
              skuInfoNo: _this.formValidate.spuInfoNo,   //商品编号
            }
          }).then(res => {
            if (res.data.code === 0) {
              callback();
            } else {
              callback(new Error(res.data.message))
            }
          })
        }

      };

      //原价积分
      const marketCreditLen = (rule, value, callback) => {
        this.formValidate.marketCredit.length > 10 ? callback(new Error('原价积分不能超过10位数')) : callback()
      };
      //实际积分
      const creditLen = (rule, value, callback) => {
        this.formValidate.credit.length > 10 ? callback(new Error('实际积分不能超过10位数')) : callback()
      };

      //市场价
      const marketPriceLen = (rule, value, callback) => {
        this.formValidate.marketPrice > 9999999.99 ? callback(new Error('市场价最多7位整数 2位小数')) : callback()
      };

      return {
        id: '',
        supplierDeleted: '',
        supplierLocked: '',
        supplierStatus: localStorage.getItem('status'),
        deleted: '',
        onSale: '',
        spinShow: true,
        loading: false,
        previewLoading: false,
        previewImage: null,
        SupplierList: [],
        Class: [],                // 分类列表
        categoryIdLikeAndE: '',   // 分类ID
        formValidate: {
          ClassVal: [],
          spuInfoName: '',        // 商品标题
          spuInfoNo: '',          // 商品编号
          supplier: '',            // 供应商id
          supplierName: '',        // 供应商名称
          price: '0',              // 售价
          marketPrice: '',        // 市场价
          marketCredit: '',       // 原价积分
          credit: '',             // 实际积分
          stock: '',              // 库存
          pics: [],                // 图片
          choice: false,            // 是否精选
          choiceSort: '50',              // 排序 默认50
        },
        ruleValidate: {
          spuInfoName: [
            {required: true, message: '商品标题不能为空', trigger: 'blur'}
          ],
          spuInfoNo: [
            {validator: InfoNo, required: true, trigger: 'change'}
          ],
          price: [
            {required: true, message: '售价不能为空', trigger: 'change'}
          ],
          marketPrice: [
            {required: true, message: '市场价不能为空', trigger: 'change'},
            {validator: marketPriceLen, required: true, trigger: 'blur'}
          ],
          marketCredit: [
            {required: true, message: '原价积分不能为空', trigger: 'blur'},
            {validator: marketCreditLen, required: true, trigger: 'blur'}
          ],
          credit: [
            {required: true, message: '实际积分不能为空', trigger: 'blur'},
            {validator: creditLen, required: true, trigger: 'blur'}
          ],
          supplier: [
            {required: true, message: '实际积分不能为空', trigger: 'change'}
          ],
          stock: [
            {required: true, message: '库存不能为空', trigger: 'blur'}
          ],
          choiceSort: [
            {required: true, message: '排序不能为空', trigger: 'blur'}
          ],
          ClassVal: [
            {validator: Class, required: true, trigger: 'change'}
          ],
          above: [
            {validator: abovea, required: true, message: '题图至少上传一张', trigger: 'change'}
          ],
          detail: [
            {validator: detail, required: true, message: '详情图至少上传一张', trigger: 'change'}
          ],
        }
      }
    },
    methods: {

      // 恢复回收站产品
      recoverSpu() {
        const _this = this;
        if (_this.supplierDeleted === true) {
          _this.$Message.warning('供应商已被删除，无法恢复！')
        } else if (_this.supplierLocked === true) {
          _this.$Message.warning('供应商已被锁定，无法恢复！')
        } else {
          _this.Axios.post('/Manage/SpuInfo/recoverSpu', _this.Qs.stringify({
            id: _this.id,
          })).then(res => {
            if (res.data.code === 0) {
              _this.$router.go(-1);
              _this.$Message.success('success')
            } else {
              _this.$Message.error(res.data.message)
            }
          })
        }
      },

      //市场价格2位小数
      marketPrice2Decimal(e) {
        e.target.value = (e.target.value.match(/^\d*(\.?\d{0,2})/g)[0]) || null
      },

      // 添加修改产品
      handleSubmit(name) {
        const _this = this;
        _this.$refs[name].validate((valid) => {
          if (valid) {
            _this.loading = true;
            _this.formValidate.pics = [];
            let aboves = _this.$refs.aboves.uploadList;
            let detail = _this.$refs.detail.uploadList;
            for (let i = 0; i < aboves.length; i++) {
              _this.formValidate.pics.push({
                "filePath": aboves[i].url,
                "fileType": 'PICTURE',
                "albumsSeq": i,
                "detailPic": false
              })
            }
            for (let i = 0; i < detail.length; i++) {
              _this.formValidate.pics.push({
                "filePath": detail[i].url,
                "fileType": 'PICTURE',
                "albumsSeq": i,
                "detailPic": true
              })
            }
            _this.Axios.post('/Manage/SpuInfo/saveSpuInfo', {
              deleted: _this.$route.query.spuInfoId ? _this.deleted : '',
              onSale: _this.$route.query.spuInfoId ? _this.onSale : '',
              id: _this.$route.query.spuInfoId ? _this.$route.query.spuInfoId : '',   //修改是传入id
              skuInfoId: _this.$route.query.id ? _this.$route.query.id : '',          //修改时传入skuInfoId
              spuInfoNo: _this.formValidate.spuInfoNo,              // 商品编号
              spuInfoName: _this.formValidate.spuInfoName,          // 商品名称
              supplierId: _this.formValidate.supplier,              // 供应商id
              supplierName: _this.formValidate.supplierName,        // 供应商名称
              categoryId: this.formValidate.ClassVal.reverse()[0],  // 分类id
              price: Number(_this.formValidate.price),              // 售价
              marketPrice: Number(_this.formValidate.marketPrice),  // 市场价
              marketCredit: _this.formValidate.marketCredit,        // 原价积分
              credit: _this.formValidate.credit,                    // 实际积分
              stock: _this.formValidate.stock,                      // 库存
              firstMainPics: _this.$refs.aboves.uploadList[0].url,  // 首图url
              pics: _this.formValidate.pics,                        // 图片集合
              choice: _this.formValidate.choice,                    // 是否精选
              choiceSort: Number(_this.formValidate.choiceSort)     // 排序
            }).then(res => {
              if (res.data.code === 0) {
                _this.$router.push('product');
                _this.$Message.success('Success');
              } else {
                _this.$Message.error(res.data.message);
              }
              _this.loading = false;
            });
          } else {
            _this.$Message.error('Fail!');
            _this.loading = false;
          }
        })
      },

      //清除预览
      clearPreview() {
        this.previewImage = null
      },

      //预览图片
      previewImg(name) {
        const _this = this;
        _this.$refs[name].validate((valid) => {
          if (valid) {
            _this.previewLoading = true;
            _this.formValidate.pics = [];
            let aboves = _this.$refs.aboves.uploadList;
            let detail = _this.$refs.detail.uploadList;
            for (let i = 0; i < aboves.length; i++) {
              _this.formValidate.pics.push({
                "filePath": aboves[i].url,
                "fileType": 'PICTURE',
                "albumsSeq": i,
                "detailPic": false
              })
            }
            for (let i = 0; i < detail.length; i++) {
              _this.formValidate.pics.push({
                "filePath": detail[i].url,
                "fileType": 'PICTURE',
                "albumsSeq": i,
                "detailPic": true
              })
            }
            _this.Axios.post('/Manage/SpuInfo/preview', {
              deleted: _this.$route.query.spuInfoId ? _this.deleted : '',
              onSale: _this.$route.query.spuInfoId ? _this.onSale : '',
              id: _this.$route.query.spuInfoId ? _this.$route.query.spuInfoId : '',   //修改是传入id
              skuInfoId: _this.$route.query.id ? _this.$route.query.id : '',          //修改时传入skuInfoId
              spuInfoNo: _this.formValidate.spuInfoNo,                  // 商品编号
              spuInfoName: _this.formValidate.spuInfoName,              // 商品名称
              supplierId: _this.formValidate.supplier,                  // 供应商id
              supplierName: _this.formValidate.supplierName,            // 供应商名称
              categoryId: this.formValidate.ClassVal.reverse()[0],      // 分类id
              price: Number(_this.formValidate.price),                  // 售价
              marketPrice: Number(_this.formValidate.marketPrice),      // 市场价
              marketCredit: _this.formValidate.marketCredit,            // 原价积分
              credit: _this.formValidate.credit,                        // 实际积分
              stock: _this.formValidate.stock,                          // 库存
              firstMainPics: _this.$refs.aboves.uploadList[0].url,      // 首图url
              pics: _this.formValidate.pics,                            // 图片集合
              choice: _this.formValidate.choice,                        // 是否精选
              choiceSort: Number(_this.formValidate.choiceSort)         // 排序
            }, {
              responseType: "arraybuffer",
            }).then(res => {
              return 'data:image/png;base64,' + btoa(
                new Uint8Array(res.data)
                  .reduce((data, byte) => data + String.fromCharCode(byte), '')
              );
            }).then(data => {
              _this.previewImage = data
              _this.previewLoading = false;
            })

          } else {
            _this.$Message.error('Fail!');
            _this.previewLoading = false;
          }
        })
      },


      // 获取分类筛选树形结构
      getClass() {
        const _this = this;
        _this.Axios.get('/Manage/Category/treeList').then(res => {
          _this.Class = res.data.data
        })
      },

      // 获取供应商列表
      getSupplier() {
        const _this = this;
        _this.Axios.get('/Manage/Supplier/list').then(res => {
          _this.SupplierList = res.data.data;
        })
      },

      // reset Input
      handleReset(name) {
        this.$refs[name].resetFields();
      },

      // 获取产品详情
      getProduct() {
        const _this = this;
        _this.Axios.get('/Manage/SpuInfo/getSpuInfoById', {
          params: {
            id: _this.$route.query.spuInfoId
          }
        }).then(res => {
          if (res.data.code === 0) {
            _this.formValidate = {
              ClassVal: res.data.data.idPath.split('/'),
              supplier: res.data.data.supplierId,
              spuInfoName: res.data.data.spuInfoName,                          // 商品标题
              spuInfoNo: res.data.data.spuInfoNo,                              // 商品编号
              price: String(res.data.data.skuInfoBos[0].price),                // 售价
              marketPrice: String(res.data.data.skuInfoBos[0].marketPrice),    // 市场价
              marketCredit: String(res.data.data.skuInfoBos[0].marketCredit),  // 原价积分
              credit: String(res.data.data.skuInfoBos[0].credit),              // 实际积分
              stock: String(res.data.data.skuInfoBos[0].skuInfoStock),         // 库存
              choice: res.data.data.choice,
              choiceSort: String(res.data.data.choiceSort)                     // 排序
            };
            _this.id = res.data.data.id;
            _this.supplierDeleted = res.data.data.supplierDeleted;
            _this.supplierLocked = res.data.data.supplierLocked;
            _this.deleted = res.data.data.deleted;
            _this.onSale = res.data.data.onSale;
            _this.$refs.aboves.defaultList = res.data.data.mianPics;
            _this.$refs.detail.defaultList = res.data.data.detailPics;
            _this.$refs.aboves.resetList();
            _this.$refs.detail.resetList();
          } else {
            _this.$Message.error(res.data.message)
          }
          _this.spinShow = false;
        })
      },

      // 获取供应商名称
      getSupplierName(i) {
        this.formValidate.supplierName = i ? i.label : null
      },
    },
    mounted() {
      this.getClass();
      this.getSupplier();
      this.$route.query.id ? this.getProduct() : this.spinShow = false;
    }
  }
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
  .demo {

  }
</style>
