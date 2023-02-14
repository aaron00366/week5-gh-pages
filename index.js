
  const { createApp } = Vue

  const apiUrl = 'https://vue3-course-api.hexschool.io';
  const apiPath = 'aaronshih04263test'

  Object.keys(VeeValidateRules).forEach(rule => {
    if (rule !== 'default') {
      VeeValidate.defineRule(rule, VeeValidateRules[rule]);
    }
  });


  // 讀取外部的資源
VeeValidateI18n.loadLocaleFromURL('./zh_TW.json');

// Activate the locale
VeeValidate.configure({
  generateMessage: VeeValidateI18n.localize('zh_TW'),
  validateOnInput: true, // 調整為：輸入文字時，就立即進行驗證
});
  const productModal = {
      // 當 id 變動時，取得遠端資料，並呈現 Modal
      props:['id','addToCart','openModal'],
    data(){
        return {
            modal:{},
            tempProduct:{},
            qty:1
        }
    },
    template:'#userProductModal',
    watch: {
        id() { // id 變動了
          console.log('productModal:', this.id);
          if(this.id){
              axios.get(`${apiUrl}/v2/api/${apiPath}/product/${this.id}`)
                .then(res=>{
                    console.log('產品列表:', res.data.product)
                    this.tempProduct = res.data.product
                    this.modal.show()
                })
                .catch(error=>{
                    console.log(error)
                })
          }
        },
      },
      methods:{
        hide(){
            this.modal.hide()
        }
      },
    mounted(){
        this.modal = new bootstrap.Modal(this.$refs.modal)
        // this.modal.show()
        //監聽DOM ，當modal 關閉時...要做其他事情
        this.$refs.modal.addEventListener('hidden.bs.modal', event => {
            // do something...
            console.log('modal is closed')
            this.openModal('') //改id
          })
    }
  }

  const app =  createApp({
    data() {
      return {
        message: 'Hello Vue!',
        products:[],
        productId:'',
        cart:[],
        loadingItem:'' //存id
      }
    },
    methods:{
        getProduct(){
            axios.get(`${apiUrl}/v2/api/${apiPath}/products/all`)
            .then(res=>{
                console.log('產品列表:', res.data.products)
                this.products = res.data.products
            })
            .catch(error=>{
                console.log(error)
            })
        },
        openModal(id){
            this.productId = id
            console.log('外部帶入的id' , id)
        },
        addToCart(product_id,qty = 1){
            const data = {
                product_id,
                qty
              }
              axios.post(`${apiUrl}/v2/api/${apiPath}/cart`,{ data })
            .then(res=>{
                console.log('加入購物車:', res.data)
                this.$refs.productModal.hide()
            })
            .catch(error=>{
                console.log(error)
            })
        },
        getCarts(){
            axios.get(`${apiUrl}/v2/api/${apiPath}/cart`)
            .then(res=>{
                console.log('購物車:', res.data.data)
                this.cart = res.data.data
            })
            .catch(error=>{
                console.log(error)
            })
        },
        updateCartItem(item){ //購物車的id , 產品id
            const data = {
                    product_id: item.product.id,
                    qty: item.qty,
            }
            this.loadingItem = item.id
            console.log(data,item.id)
             axios.put(`${apiUrl}/v2/api/${apiPath}/cart/${item.id}`,{data})
             .then(res=>{
                 console.log('更新購物車:', res.data)
                 this.getCarts()
                 this.loadingItem = ''
             })
             .catch(error=>{
                 console.log(error)
             })
        },
        deleteCartItem(item){
            this.loadingItem = item.id
             axios.delete(`${apiUrl}/v2/api/${apiPath}/cart/${item.id}`)
             .then(res=>{
                 console.log('刪除購物車:', res.data)
                 this.getCarts()
                 this.loadingItem = ''
             })
             .catch(error=>{
                 console.log(error)
             })
        },
        isPhone(value) {
            const phoneNumber = /^(09)[0-9]{8}$/
            return phoneNumber.test(value) ? true : '需要正確的電話號碼'
          }
    },
    components:{
        productModal
    },
    mounted(){
        console.log('init')
        this.getProduct()
        this.getCarts()
        console.log(this)
    }
  })
  app.component('VForm', VeeValidate.Form);
app.component('VField', VeeValidate.Field);
app.component('ErrorMessage', VeeValidate.ErrorMessage);
  app.mount('#app')


